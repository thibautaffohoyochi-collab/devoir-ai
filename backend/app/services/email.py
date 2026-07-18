"""
Service Email — Resend (priorité) ou SMTP Gmail en fallback
"""
import smtplib
import httpx
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import get_settings

settings = get_settings()


# ── Templates HTML ────────────────────────────────────────────────────────────

def _base_template(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevoirAI</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#22c55e;padding:24px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 12px;margin-right:10px;">
                    <span style="color:#fff;font-size:20px;">🎓</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">DevoirAI</span>
                    <br>
                    <span style="color:rgba(255,255,255,0.8);font-size:12px;">Assistant étudiant IA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              {content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                © 2025 DevoirAI — Ton assistant étudiant IA<br>
                <a href="http://localhost:5173" style="color:#22c55e;text-decoration:none;">devoirai.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _btn(url: str, label: str, color: str = "#22c55e") -> str:
    return f"""<a href="{url}"
      style="display:inline-block;background:{color};color:#fff;text-decoration:none;
             padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;margin:8px 4px;">
      {label}
    </a>"""


def welcome_email(username: str) -> tuple[str, str]:
    """Retourne (subject, html)"""
    subject = f"🎓 Bienvenue sur DevoirAI, {username} !"
    content = f"""
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Bienvenue, {username} ! 👋</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Ton compte DevoirAI est prêt. Tu peux maintenant soumettre tes devoirs
      et recevoir des réponses rédigées avec un style étudiant naturel.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#15803d;font-weight:600;font-size:14px;">✅ Ce que tu peux faire :</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
        <li>Upload tes devoirs — PDF, Word, PowerPoint, TXT</li>
        <li>L'IA détecte la matière, le type et le niveau automatiquement</li>
        <li>Télécharge le résultat en PDF, Word ou PowerPoint</li>
        <li>3 LLM gratuits en cascade (Gemini, Groq, OpenRouter)</li>
      </ul>
    </div>

    <div style="text-align:center;margin-bottom:8px;">
      {_btn("http://localhost:5173/upload", "🚀 Soumettre mon premier devoir")}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:12px 0 0;">
      Gratuit · Sans carte bancaire · Résultat en 30 secondes
    </p>
    """
    return subject, _base_template(content)


def devoir_ready_email(username: str, titre: str, format_sortie: str,
                        matiere: str, devoir_id: int) -> tuple[str, str]:
    """Email quand le devoir est terminé"""
    subject = f"✅ Ton devoir est prêt — {titre[:50]}"
    view_url = f"http://localhost:5173/devoirs/{devoir_id}"
    download_url = f"http://localhost:8000/api/devoirs/{devoir_id}/download"
    fmt_icons = {"pdf": "📄", "docx": "📝", "pptx": "📊"}

    content = f"""
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;">Devoir prêt ! {fmt_icons.get(format_sortie, '📄')}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
      Bonjour <strong>{username}</strong>, ton devoir a été traité avec succès par l'IA.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color:#64748b;font-size:13px;padding:4px 0;">📋 Devoir</td>
          <td style="color:#1e293b;font-size:13px;font-weight:600;padding:4px 0;">{titre}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:4px 0;">📚 Matière</td>
          <td style="color:#1e293b;font-size:13px;font-weight:600;padding:4px 0;">{matiere.capitalize()}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:4px 0;">📁 Format</td>
          <td style="color:#1e293b;font-size:13px;font-weight:600;padding:4px 0;">{format_sortie.upper()}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      {_btn(view_url, "👁️ Voir le devoir")}
      {_btn(download_url, "⬇️ Télécharger", "#1e293b")}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:16px 0 0;">
      Connecte-toi à DevoirAI pour accéder à tous tes devoirs.
    </p>
    """
    return subject, _base_template(content)


def devoir_error_email(username: str, titre: str, erreur: str) -> tuple[str, str]:
    """Email en cas d'erreur"""
    subject = f"❌ Erreur sur ton devoir — {titre[:50]}"
    content = f"""
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;">Une erreur est survenue ⚠️</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 20px;">
      Bonjour <strong>{username}</strong>, le traitement de ton devoir a rencontré un problème.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#dc2626;font-size:13px;font-weight:600;">Devoir concerné : {titre}</p>
      <p style="margin:0;color:#7f1d1d;font-size:12px;word-break:break-word;">{erreur[:300]}</p>
    </div>

    <p style="color:#64748b;font-size:14px;margin:0 0 20px;">
      Ce problème est souvent temporaire (limite d'API atteinte). Tu peux réessayer dans quelques minutes.
    </p>

    <div style="text-align:center;">
      {_btn("http://localhost:5173/upload", "🔄 Réessayer")}
    </div>
    """
    return subject, _base_template(content)


# ── Envoi ─────────────────────────────────────────────────────────────────────

async def send_email(to: str, subject: str, html: str) -> bool:
    """Essaie Resend d'abord, puis SMTP en fallback."""
    if not settings.email_enabled:
        print(f"[Email] Désactivé — sujet : {subject}")
        return False

    # 1. Resend API
    if settings.resend_api_key:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {settings.resend_api_key}"},
                    json={"from": settings.email_from, "to": [to], "subject": subject, "html": html}
                )
                if resp.status_code == 200:
                    print(f"[Email/Resend] ✓ Envoyé à {to}")
                    return True
                print(f"[Email/Resend] Erreur {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[Email/Resend] Exception: {e}")

    # 2. SMTP fallback
    if settings.smtp_user and settings.smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.email_from
            msg["To"] = to
            msg.attach(MIMEText(html, "html", "utf-8"))

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            print(f"[Email/SMTP] ✓ Envoyé à {to}")
            return True
        except Exception as e:
            print(f"[Email/SMTP] Erreur: {e}")

    return False


# ── Fonctions utilitaires ──────────────────────────────────────────────────────

async def send_welcome(email: str, username: str):
    subject, html = welcome_email(username)
    await send_email(email, subject, html)


async def send_devoir_ready(email: str, username: str, titre: str,
                             format_sortie: str, matiere: str, devoir_id: int):
    subject, html = devoir_ready_email(username, titre, format_sortie, matiere, devoir_id)
    await send_email(email, subject, html)


async def send_devoir_error(email: str, username: str, titre: str, erreur: str):
    subject, html = devoir_error_email(username, titre, erreur)
    await send_email(email, subject, html)
