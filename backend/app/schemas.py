from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None


# ── Devoirs ───────────────────────────────────────────────────────────────────

class DevoirOut(BaseModel):
    id: int
    titre: str
    contenu_original: str
    consignes_detectees: Optional[str]
    matiere_detectee: Optional[str]
    type_devoir: Optional[str]
    niveau_detecte: Optional[str]
    format_sortie: str
    reponse_generee: Optional[str]
    fichier_resultat: Optional[str]
    statut: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DevoirSummary(BaseModel):
    id: int
    titre: str
    matiere_detectee: Optional[str]
    type_devoir: Optional[str]
    format_sortie: str
    statut: str
    created_at: datetime

    class Config:
        from_attributes = True
