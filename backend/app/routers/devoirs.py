import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db, AsyncSessionLocal
from app.models import User, Devoir
from app.schemas import DevoirOut, DevoirSummary
from app.security import get_current_user
from app.services.extractor import extract_text
from app.services.llm import (
    resolve_devoir, detect_output_format, detect_consignes,
    detect_matiere, detect_type_devoir, detect_niveau
)
from app.services.exporter import export_response
from app.services.webhooks import notify_devoir_termine, notify_devoir_erreur

router = APIRouter(prefix="/devoirs", tags=["Devoirs"])


async def _process_devoir(devoir_id: int, devoir_text: str, format_sortie: str,
                          titre: str, user_id: int, user_email: str, username: str):
    """Tâche de fond avec sa propre session DB + webhooks + emails."""
    async with AsyncSessionLocal() as db:
        try:
            reponse = await resolve_devoir(devoir_text, format_sortie)
            fichier = export_response(reponse, format_sortie, titre, user_id)

            result = await db.execute(select(Devoir).where(Devoir.id == devoir_id))
            devoir = result.scalar_one_or_none()
            if devoir:
                devoir.reponse_generee = reponse
                devoir.fichier_resultat = fichier
                devoir.statut = "termine"
                await db.commit()

                matiere = devoir.matiere_detectee or "général"

                # Webhook n8n
                await notify_devoir_termine(
                    devoir_id=devoir_id, titre=titre,
                    format_sortie=format_sortie,
                    user_email=user_email, username=username,
                    matiere=matiere
                )

                # Email de notification
                from app.services.email import send_devoir_ready
                await send_devoir_ready(
                    email=user_email, username=username,
                    titre=titre, format_sortie=format_sortie,
                    matiere=matiere, devoir_id=devoir_id
                )

        except Exception as e:
            result = await db.execute(select(Devoir).where(Devoir.id == devoir_id))
            devoir = result.scalar_one_or_none()
            if devoir:
                devoir.statut = "erreur"
                devoir.reponse_generee = f"Erreur: {str(e)}"
                await db.commit()

                # Webhook + email d'erreur
                await notify_devoir_erreur(
                    devoir_id=devoir_id, titre=titre,
                    user_email=user_email, username=username,
                    erreur=str(e)
                )
                from app.services.email import send_devoir_error
                await send_devoir_error(
                    email=user_email, username=username,
                    titre=titre, erreur=str(e)
                )


@router.post("/upload", response_model=DevoirOut, status_code=202)
async def upload_devoir(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    titre: str = Form(...),
    format_override: str = Form(None),
    niveau_override: str = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not titre.strip():
        raise HTTPException(status_code=400, detail="Le titre est requis")

    texte, file_type = await extract_text(file)

    # Format override ou détection auto
    if format_override and format_override in ("pdf", "docx", "pptx"):
        format_sortie = format_override
    else:
        format_sortie = detect_output_format(texte)

    consignes = detect_consignes(texte)
    matiere = detect_matiere(texte)
    type_dv = detect_type_devoir(texte)

    # Niveau : manuel ou auto-détecté
    if niveau_override and niveau_override in ("lycee", "licence", "master", "doctorat"):
        niveau = niveau_override
    else:
        niveau = detect_niveau(texte)

    meta = f"[Matière: {matiere} | Type: {type_dv} | Niveau: {niveau}]"
    consignes_enrichies = f"{meta}\n{consignes}" if consignes else meta

    devoir = Devoir(
        user_id=current_user.id,
        titre=titre.strip(),
        contenu_original=texte,
        consignes_detectees=consignes_enrichies,
        matiere_detectee=matiere,
        type_devoir=type_dv,
        niveau_detecte=niveau,
        format_sortie=format_sortie,
        statut="traitement"
    )
    db.add(devoir)
    await db.commit()
    await db.refresh(devoir)

    background_tasks.add_task(
        _process_devoir,
        devoir.id, texte, format_sortie, titre,
        current_user.id, current_user.email, current_user.username
    )

    return devoir


@router.get("/", response_model=List[DevoirSummary])
async def list_devoirs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Devoir)
        .where(Devoir.user_id == current_user.id)
        .order_by(Devoir.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{devoir_id}", response_model=DevoirOut)
async def get_devoir(
    devoir_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Devoir).where(Devoir.id == devoir_id, Devoir.user_id == current_user.id)
    )
    devoir = result.scalar_one_or_none()
    if not devoir:
        raise HTTPException(status_code=404, detail="Devoir non trouvé")
    return devoir


@router.get("/{devoir_id}/download")
async def download_devoir(
    devoir_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Devoir).where(Devoir.id == devoir_id, Devoir.user_id == current_user.id)
    )
    devoir = result.scalar_one_or_none()
    if not devoir:
        raise HTTPException(status_code=404, detail="Devoir non trouvé")
    if devoir.statut != "termine" or not devoir.fichier_resultat:
        raise HTTPException(status_code=400, detail="Le devoir n'est pas encore prêt")
    if not os.path.exists(devoir.fichier_resultat):
        raise HTTPException(status_code=404, detail="Fichier introuvable")

    ext = devoir.fichier_resultat.split('.')[-1]
    media_types = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }
    return FileResponse(
        path=devoir.fichier_resultat,
        media_type=media_types.get(ext, "application/octet-stream"),
        filename=f"{devoir.titre}.{ext}"
    )


@router.post("/{devoir_id}/relancer", response_model=DevoirOut)
async def relancer_devoir(
    devoir_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Relance le traitement d'un devoir en erreur."""
    result = await db.execute(
        select(Devoir).where(Devoir.id == devoir_id, Devoir.user_id == current_user.id)
    )
    devoir = result.scalar_one_or_none()
    if not devoir:
        raise HTTPException(status_code=404, detail="Devoir non trouvé")
    if devoir.statut not in ("erreur", "en_attente"):
        raise HTTPException(status_code=400, detail="Seuls les devoirs en erreur peuvent être relancés")

    devoir.statut = "traitement"
    devoir.reponse_generee = None
    await db.commit()
    await db.refresh(devoir)

    background_tasks.add_task(
        _process_devoir,
        devoir.id, devoir.contenu_original, devoir.format_sortie,
        devoir.titre, current_user.id, current_user.email, current_user.username
    )
    return devoir


@router.delete("/{devoir_id}", status_code=204)
async def delete_devoir(
    devoir_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Devoir).where(Devoir.id == devoir_id, Devoir.user_id == current_user.id)
    )
    devoir = result.scalar_one_or_none()
    if not devoir:
        raise HTTPException(status_code=404, detail="Devoir non trouvé")

    if devoir.fichier_resultat and os.path.exists(devoir.fichier_resultat):
        os.remove(devoir.fichier_resultat)

    await db.delete(devoir)
    await db.commit()
