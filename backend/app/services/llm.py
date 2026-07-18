"""
Service LLM amélioré : détection matière, ton adaptatif, prompts spécialisés
Gemini → Groq → OpenRouter (3 fallbacks gratuits)
"""
import httpx
from groq import Groq
from app.config import get_settings

settings = get_settings()

# ── Détection matière ────────────────────────────────────────────────────────

MATIERES = {
    "philosophie": ["philosophie", "philo", "éthique", "conscience", "liberté", "bonheur", "morale", "métaphysique"],
    "histoire": ["histoire", "historique", "siècle", "guerre", "révolution", "empire", "colonisation"],
    "géographie": ["géographie", "territoire", "espace", "carte", "région", "mondialisation"],
    "économie": ["économie", "marché", "pib", "croissance", "inflation", "entreprise", "management"],
    "droit": ["droit", "juridique", "loi", "contrat", "responsabilité", "constitution", "pénal"],
    "marketing": ["marketing", "marque", "consommateur", "publicité", "segmentation", "stratégie commerciale"],
    "informatique": ["algorithme", "code", "programmation", "réseau", "base de données", "logiciel", "système"],
    "biologie": ["biologie", "cellule", "gène", "évolution", "écologie", "organisme", "adn"],
    "mathématiques": ["mathématiques", "équation", "théorème", "probabilité", "statistique", "calcul"],
    "littérature": ["littérature", "roman", "poème", "auteur", "narrateur", "analyse littéraire"],
    "sociologie": ["sociologie", "société", "social", "inégalités", "institution", "culture"],
    "psychologie": ["psychologie", "comportement", "cognition", "inconscient", "développement", "thérapie"],
}

TYPES_DEVOIR = {
    "dissertation": ["dissertation", "dissert", "plan dialectique", "thèse antithèse"],
    "rapport": ["rapport", "compte rendu", "synthèse", "bilan"],
    "exposé": ["exposé", "présentation orale", "diaporama"],
    "analyse": ["analyse", "commenter", "étude de cas", "commentaire"],
    "résumé": ["résumé", "synthétiser", "résumer"],
    "qcm": ["qcm", "questionnaire", "questions réponses"],
    "essai": ["essai", "argumentation", "rédaction"],
    "tp": ["tp", "travail pratique", "expérience", "protocole"],
}

NIVEAUX = {
    "lycée": ["lycée", "terminale", "première", "seconde", "bac", "baccalauréat"],
    "licence": ["licence", "l1", "l2", "l3", "premier cycle", "fac", "université"],
    "master": ["master", "m1", "m2", "mémoire", "master 1", "master 2"],
    "doctorat": ["doctorat", "thèse", "phd", "recherche"],
}


def detect_matiere(text: str) -> str:
    t = text.lower()
    for matiere, keywords in MATIERES.items():
        if any(k in t for k in keywords):
            return matiere
    return "général"


def detect_type_devoir(text: str) -> str:
    t = text.lower()
    for type_d, keywords in TYPES_DEVOIR.items():
        if any(k in t for k in keywords):
            return type_d
    return "devoir"


def detect_niveau(text: str) -> str:
    t = text.lower()
    for niveau, keywords in NIVEAUX.items():
        if any(k in t for k in keywords):
            return niveau
    return "licence"


def detect_output_format(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["powerpoint", "présentation", "diapositives", "ppt", "slides", "diapo"]):
        return "pptx"
    if any(w in t for w in ["word", ".docx", "document word", "traitement de texte"]):
        return "docx"
    if any(w in t for w in ["exposé", "présentation orale"]):
        return "pptx"
    return "pdf"


def detect_consignes(text: str) -> str:
    lines = text.split("\n")
    consignes = []
    keywords = ["consigne", "objectif", "travail", "devoir", "rendre", "format", "pages", "mots", "slides", "sujet"]
    for line in lines[:30]:
        if any(k in line.lower() for k in keywords):
            consignes.append(line.strip())
    return "\n".join(consignes[:10]) if consignes else text[:500]


# ── Construction du prompt ────────────────────────────────────────────────────

def build_system_prompt(matiere: str, type_devoir: str, niveau: str) -> str:
    niveau_desc = {
        "lycée": "lycéen de terminale très sérieux",
        "licence": "étudiant en 2ème année de licence",
        "master": "étudiant en master 1, spécialisé dans son domaine",
        "doctorat": "doctorant avec une solide maîtrise académique",
    }.get(niveau, "étudiant universitaire en licence")

    type_desc = {
        "dissertation": """Suis le plan dialectique classique (thèse / antithèse / synthèse).
- Chaque partie commence par une phrase d'annonce naturelle, pas mécanique
- Les transitions sont fluides, pas des copier-coller de formules
- Intègre des exemples précis tirés de l'actualité ou de ta culture personnelle
- La conclusion ne résume pas bêtement — elle ouvre sur une question plus large""",

        "rapport": """Structure en sections logiques mais sans rigidité excessive.
- L'introduction contextualise vraiment, ne commence pas par "Dans ce rapport..."
- Utilise des données chiffrées quand c'est pertinent
- Formule des recommandations personnelles et justifiées
- Le style est professionnel mais pas froid""",

        "exposé": """Organise pour capter l'attention dès la première diapositive.
- Accroche forte sur la slide titre (question rhétorique, chiffre choc, citation)
- Contenu dense mais lisible — bullet points courts et percutants
- Transitions entre slides cohérentes
- Slide conclusion mémorable""",

        "analyse": """Méthode analytique rigoureuse mais personnelle.
- Commence par contextualiser sans réciter Wikipedia
- L'analyse montre une vraie réflexion, pas juste une description
- Prends position en la justifiant
- Confronte différents points de vue""",

        "résumé": "Synthétise les idées essentielles avec tes propres mots. Ne colle pas des phrases du texte original.",
        "essai": "Développe une argumentation personnelle et cohérente. Prends position clairement.",
        "qcm": "Réponds avec précision et justifie brièvement chaque réponse.",
        "tp": "Décris la démarche expérimentale avec rigueur : problématique, méthode, résultats, interprétation.",
    }.get(type_devoir, "Structures ton devoir de manière claire et logique.")

    matiere_conseil = {
        "philosophie": "Cite des philosophes de façon intégrée (pas en liste), utilise leur pensée pour appuyer TES arguments. Ex: 'Sartre dirait que...' suivi de ta propre analyse.",
        "économie": "Articule théorie et exemples concrets récents (entreprises réelles, données économiques). Montre que tu comprends les mécanismes, pas que tu récites le cours.",
        "droit": "Cite les textes juridiques précisément mais explique leur portée avec tes mots. Donne des exemples de jurisprudence si pertinent.",
        "marketing": "Applique les frameworks (SWOT, 4P, etc.) à des cas réels et concrets. L'analyse doit montrer une vraie réflexion stratégique.",
        "informatique": "Utilise la terminologie technique correcte. Si tu donnes du code, commente-le comme le ferait un vrai dev.",
        "mathématiques": "Montre chaque étape du raisonnement clairement. Justifie les choix de méthode.",
        "histoire": "Contextualise avec des dates précises et des acteurs historiques nommés. Analyse les causalités, ne raconte pas juste une chronologie.",
        "sociologie": "Appuie-toi sur des auteurs (Bourdieu, Durkheim...) et des études empiriques réelles.",
        "psychologie": "Équilibre théorie et exemples cliniques ou expérimentaux concrets.",
        "littérature": "Cite le texte avec des références précises (page, chapitre). L'analyse doit aller au-delà du résumé.",
    }.get(matiere, "")

    # Techniques anti-détection IA
    anti_detection = """
TECHNIQUES DE STYLE NATUREL (TRÈS IMPORTANT) :
1. LONGUEUR DES PHRASES : alterne intentionnellement courtes et longues. Pas toujours des phrases de 20 mots.
2. TRANSITIONS : évite absolument "De plus", "En outre", "Par ailleurs", "Ainsi", "En effet" en début de phrase — trop robotiques. Préfère des tournures comme "C'est justement là que...", "Ce qui m'amène à...", "On peut d'ailleurs se demander si..."
3. OPINION PERSONNELLE : glisse 2-3 formulations personnelles naturelles : "Ce qui me semble central ici", "À titre personnel, je pense que", "Il faut bien reconnaître que"
4. IMPERFECTIONS VOLONTAIRES : une légère répétition occasionnelle d'un mot, une parenthèse explicative (comme celle-ci), une question rhétorique au milieu d'un paragraphe — tout cela sonne humain.
5. VOCABULAIRE : varie le registre. Parfois technique, parfois plus accessible. Un étudiant ne parle pas toujours en terminologie pure.
6. ÉVITE ABSOLUMENT : les listes à puces dans un texte rédigé, "En conclusion, nous avons vu que...", "Dans un premier temps... dans un second temps...", "Il convient de noter que", "Il est important de souligner que", "Force est de constater que"
7. LONGUEUR : adapte au sujet. Pas de rembourrage pour faire du volume."""

    return f"""Tu es {niveau_desc} qui rédige un {type_devoir} en {matiere}. Ton travail sera rendu tel quel au professeur.

MÉTHODE POUR CE TYPE DE DEVOIR :
{type_desc}

CONSEILS POUR LA DISCIPLINE ({matiere.upper()}) :
{matiere_conseil}

{anti_detection}

RAPPEL FINAL : Ce texte doit sonner comme écrit par un étudiant intelligent et travailleur, pas par une machine. Un professeur expérimenté ne doit pas pouvoir le détecter comme généré par IA."""


def build_user_prompt(devoir_text: str, format_sortie: str, matiere: str, type_devoir: str) -> str:
    format_instruction = _get_format_instruction(format_sortie)

    # Tronquer intelligemment si trop long
    texte = devoir_text[:8000] if len(devoir_text) > 8000 else devoir_text

    return (
        f"Voici le sujet/devoir à traiter :\n\n"
        f"{'─' * 50}\n"
        f"{texte}\n"
        f"{'─' * 50}\n\n"
        f"{format_instruction}\n\n"
        f"Rédige maintenant le {type_devoir} complet. "
        f"Fais-le aussi long et détaillé que nécessaire pour obtenir une bonne note. "
        f"Ne mets pas de commentaires méta comme 'Voici mon devoir' — commence directement par le contenu."
    )


# ── Appels LLM ────────────────────────────────────────────────────────────────

async def generate_with_gemini(system_prompt: str, user_prompt: str) -> str:
    if not settings.gemini_api_key:
        raise ValueError("Clé Gemini manquante")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
    )
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 8192,
        },
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def generate_with_groq(system_prompt: str, user_prompt: str) -> str:
    if not settings.groq_api_key:
        raise ValueError("Clé Groq manquante")

    client = Groq(api_key=settings.groq_api_key)
    models = ["llama3-8b-8192", "gemma2-9b-it", "llama-3.1-8b-instant"]
    last_error = None

    for model in models:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt[:6000]},
                ],
                temperature=0.9,
                max_tokens=4096,
            )
            print(f"[Groq/{model}] OK")
            return response.choices[0].message.content
        except Exception as e:
            print(f"[Groq/{model}] Erreur: {e}")
            last_error = e
            continue

    raise RuntimeError(f"Groq échoué: {last_error}")


async def generate_with_openrouter(system_prompt: str, user_prompt: str) -> str:
    if not settings.openrouter_api_key:
        raise ValueError("Clé OpenRouter manquante")

    models = [
        "google/gemma-4-26b-a4b-it:free",
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    ]
    last_error = None

    async with httpx.AsyncClient(timeout=120.0) as client:
        for model in models:
            try:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openrouter_api_key}",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "DevoirAI",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt[:6000]},
                        ],
                        "temperature": 0.9,
                        "max_tokens": 4096,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"].get("content")
                if not content:
                    raise ValueError(f"Contenu vide pour {model}")
                print(f"[OpenRouter/{model}] OK")
                return content
            except Exception as e:
                print(f"[OpenRouter/{model}] Erreur: {e}")
                last_error = e
                continue

    raise RuntimeError(f"OpenRouter échoué: {last_error}")


async def resolve_devoir(devoir_text: str, format_sortie: str) -> str:
    matiere = detect_matiere(devoir_text)
    type_devoir = detect_type_devoir(devoir_text)
    niveau = detect_niveau(devoir_text)

    print(f"[LLM] Matière: {matiere} | Type: {type_devoir} | Niveau: {niveau}")

    system_prompt = build_system_prompt(matiere, type_devoir, niveau)
    user_prompt = build_user_prompt(devoir_text, format_sortie, matiere, type_devoir)
    errors = []

    for name, fn in [
        ("Gemini", lambda: generate_with_gemini(system_prompt, user_prompt)),
        ("Groq", lambda: generate_with_groq(system_prompt, user_prompt)),
        ("OpenRouter", lambda: generate_with_openrouter(system_prompt, user_prompt)),
    ]:
        try:
            result = await fn()
            print(f"[LLM] {name} utilisé ✓")
            return result
        except Exception as e:
            print(f"[{name}] Échec: {e}")
            errors.append(f"{name}: {e}")

    raise RuntimeError("Tous les LLM ont échoué:\n" + "\n".join(errors))


def _get_format_instruction(format_sortie: str) -> str:
    if format_sortie == "pptx":
        return (
            "FORMAT REQUIS — Présentation PowerPoint :\n"
            "Structure ta réponse en diapositives avec ce format EXACT :\n\n"
            "[SLIDE 1] Titre accrocheur de la présentation\n"
            "Sous-titre ou phrase d'accroche percutante\n\n"
            "[SLIDE 2] Titre de la partie\n"
            "• Point clé 1 — développé en une phrase complète\n"
            "• Point clé 2 — avec exemple concret\n"
            "• Point clé 3 — chiffre ou fait marquant\n\n"
            "(Continue ainsi. Fais entre 8 et 12 slides. "
            "Chaque slide = un titre percutant + contenu dense mais lisible.)"
        )
    elif format_sortie == "docx":
        return (
            "FORMAT REQUIS — Document Word académique :\n"
            "Utilise # pour les parties principales et ## pour les sous-parties.\n"
            "Rédige en paragraphes complets. Pas de listes à puces dans le corps du texte.\n"
            "Structure : Introduction → # I. Titre → ## A. → ## B. → # II. → Conclusion"
        )
    else:
        return (
            "FORMAT REQUIS — Rapport/Dissertation PDF :\n"
            "Rédige en paragraphes complets et bien développés.\n"
            "Utilise # pour les grandes parties et ## pour les sous-parties.\n"
            "L'introduction doit accrocher le lecteur dès la première phrase.\n"
            "La conclusion doit ouvrir une perspective, pas juste résumer."
        )
