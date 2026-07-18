from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserOut
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Vérifier email unique
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Vérifier username unique
    existing_u = await db.execute(select(User).where(User.username == user_data.username))
    if existing_u.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")

    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 8 caractères")

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Notifier n8n du nouvel utilisateur
    from app.services.webhooks import notify_nouvel_utilisateur
    await notify_nouvel_utilisateur(user.username, user.email)

    # Email de bienvenue
    from app.services.email import send_welcome
    await send_welcome(user.email, user.username)

    return user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/test-email")
async def test_email(current_user: User = Depends(get_current_user)):
    """Envoie un email de test à l'utilisateur connecté."""
    from app.services.email import send_welcome
    success = await send_welcome(current_user.email, current_user.username)
    if success:
        return {"message": f"Email de test envoyé à {current_user.email}"}
    return {"message": "Email désactivé — configure EMAIL_ENABLED=true dans .env"}


@router.post("/change-password")
async def change_password(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.security import verify_password, hash_password
    current_pwd = data.get("current_password", "")
    new_pwd = data.get("new_password", "")

    if not verify_password(current_pwd, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    if len(new_pwd) < 8:
        raise HTTPException(status_code=400, detail="Nouveau mot de passe trop court")

    current_user.hashed_password = hash_password(new_pwd)
    await db.commit()
    return {"message": "Mot de passe mis à jour"}
