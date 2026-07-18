"""
Service de webhooks — notifie n8n (ou tout autre endpoint) des événements DevoirAI
"""
import httpx
from app.config import get_settings

settings = get_settings()


async def notify_devoir_termine(devoir_id: int, titre: str, format_sortie: str,
                                 user_email: str, username: str, matiere: str = ""):
    """Envoie un webhook quand un devoir est terminé."""
    if not settings.n8n_webhook_url:
        return  # Pas configuré, on skip silencieusement

    payload = {
        "event": "devoir_termine",
        "devoir_id": devoir_id,
        "titre": titre,
        "format_sortie": format_sortie,
        "matiere": matiere,
        "user": {
            "email": user_email,
            "username": username,
        },
        "download_url": f"{settings.app_base_url}/api/devoirs/{devoir_id}/download",
        "view_url": f"http://localhost:5174/devoirs/{devoir_id}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(settings.n8n_webhook_url, json=payload)
            print(f"[Webhook] Envoyé → n8n : {resp.status_code}")
    except Exception as e:
        print(f"[Webhook] Erreur envoi n8n : {e}")


async def notify_devoir_erreur(devoir_id: int, titre: str, user_email: str,
                                username: str, erreur: str):
    """Notifie n8n en cas d'erreur de traitement."""
    if not settings.n8n_webhook_url:
        return

    payload = {
        "event": "devoir_erreur",
        "devoir_id": devoir_id,
        "titre": titre,
        "erreur": erreur[:500],
        "user": {
            "email": user_email,
            "username": username,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(settings.n8n_webhook_url, json=payload)
    except Exception as e:
        print(f"[Webhook] Erreur envoi n8n : {e}")


async def notify_nouvel_utilisateur(username: str, email: str):
    """Notifie n8n quand un nouvel étudiant s'inscrit."""
    if not settings.n8n_webhook_url:
        return

    payload = {
        "event": "nouvel_utilisateur",
        "username": username,
        "email": email,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(settings.n8n_webhook_url, json=payload)
    except Exception as e:
        print(f"[Webhook] Erreur envoi n8n : {e}")
