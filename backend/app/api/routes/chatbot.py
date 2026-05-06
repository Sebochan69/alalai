import re
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter

from app.schemas.schemas import ChatRequest, ChatResponse

router = APIRouter()

KNOWLEDGE_BASE_PATH = Path(__file__).resolve().parents[2] / "seed" / "barangay_info_mock.md"
STOP_WORDS = {
    "a",
    "about",
    "and",
    "are",
    "barangay",
    "can",
    "do",
    "for",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "the",
    "to",
    "what",
    "when",
    "where",
    "who",
    "with",
}
SECTION_ALIASES = {
    "Emergency & Barangay Hotlines": "hotline hotlines emergency contact phone number call tanod police fire health",
    "Hotlines": "hotline hotlines emergency contact phone number call tanod police fire health",
    "Office Hours": "open opening office hours schedule time barangay hall available closed weekday weekend",
    "Barangay Officials": "official officials captain secretary treasurer chairperson health worker peace order",
    "Officials": "official officials captain secretary treasurer chairperson health worker peace order",
    "Garbage Collection Schedule": "garbage trash waste collection pickup schedule disposal biodegradable non biodegradable",
    "Garbage Collection": "garbage trash waste collection pickup schedule disposal biodegradable non biodegradable",
    "Flooding Reminder": "flood flooding drainage rain typhoon disaster emergency report clogged evacuation",
    "Complaint Reporting Guide": "complaint complaints report reporting incident issue concern anonymous evidence",
    "Available Services": "service services clearance residency indigency cedula id application mediation assistance",
    "Civil & Administrative Services": "service services clearance residency indigency cedula id application",
    "Community Services": "service services complaint mediation disaster senior citizen solo parent assistance",
    "Health Services": "health medical consultation vaccination blood pressure feeding program",
}


@lru_cache(maxsize=1)
def load_knowledge_sections() -> dict[str, str]:
    content = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    sections: dict[str, str] = {}
    current_title: str | None = None
    current_lines: list[str] = []

    for line in content.splitlines():
        heading = re.match(r"^#{1,6}\s+(.+?)\s*$", line)
        if heading:
            body = "\n".join(current_lines).strip()
            if current_title and body:
                sections[current_title] = body
            current_title = heading.group(1).strip()
            current_lines = []
        elif current_title:
            current_lines.append(line)

    body = "\n".join(current_lines).strip()
    if current_title and body:
        sections[current_title] = body

    return sections


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {word for word in words if word not in STOP_WORDS and len(word) > 1}


def answer_from_knowledge_base(message: str) -> str:
    sections = load_knowledge_sections()
    question_tokens = tokenize(message)

    if not question_tokens:
        return fallback_reply(sections)

    best_title = ""
    best_body = ""
    best_score = 0

    for title, body in sections.items():
        section_tokens = tokenize(f"{title} {SECTION_ALIASES.get(title, '')} {body}")
        score = len(question_tokens & section_tokens)
        if score > best_score:
            best_title = title
            best_body = body
            best_score = score

    if best_score == 0:
        return fallback_reply(sections)

    return f"{best_title}\n\n{best_body}"


def fallback_reply(sections: dict[str, str]) -> str:
    topics = ", ".join(sections.keys())
    return f"I can answer based on the barangay info file. Try asking about: {topics}."


@router.post("/", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return ChatResponse(reply=answer_from_knowledge_base(payload.message))
