from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    devoirs = relationship("Devoir", back_populates="owner", cascade="all, delete-orphan")


class Devoir(Base):
    __tablename__ = "devoirs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titre = Column(String(255), nullable=False)
    contenu_original = Column(Text, nullable=False)
    consignes_detectees = Column(Text, nullable=True)
    matiere_detectee = Column(String(100), nullable=True)
    type_devoir = Column(String(50), nullable=True)
    niveau_detecte = Column(String(50), nullable=True)
    format_sortie = Column(String(50), default="pdf")
    reponse_generee = Column(Text, nullable=True)
    fichier_resultat = Column(String(255), nullable=True)
    statut = Column(String(50), default="en_attente")  # en_attente, traitement, termine, erreur
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="devoirs")
