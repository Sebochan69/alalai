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
QUERY_ALIASES = {
    "bring": "requirements",
    "need": "requirements",
    "needed": "requirements",
    "require": "requirements",
    "required": "requirements",
}
SECTION_ALIASES = {
    "Emergency & Barangay Hotlines": "hotline hotlines emergency contact phone number call tanod police fire health",
    "Hotlines": "hotline hotlines emergency contact phone number call tanod police fire health",
    "Office Hours": "open opening office hours schedule time barangay hall available closed weekday weekend",
    "Barangay Hall Information": "open opening office hours schedule time barangay hall available closed weekday weekend address email",
    "Barangay Officials": "official officials captain secretary treasurer chairperson health worker peace order",
    "Officials": "official officials captain secretary treasurer chairperson health worker peace order",
    "Garbage Collection Schedule": "garbage trash waste collection pickup schedule disposal biodegradable non biodegradable",
    "Garbage Collection": "garbage trash waste collection pickup schedule disposal biodegradable non biodegradable",
    "Flooding Reminder": "flood flooding drainage rain typhoon disaster emergency report clogged evacuation",
    "Complaint Reporting Guide": "complaint complaints report reporting incident issue concern anonymous evidence",
    "Complaint Status Demo": "complaint complaints report reports status update tracking assigned admin progress resolved review",
    "Available Services": "service services clearance residency indigency cedula id application mediation assistance",
    "Civil & Administrative Services": "service services clearance residency indigency cedula id application",
    "Community Services": "service services complaint mediation disaster senior citizen solo parent assistance",
    "Health Services": "health medical consultation vaccination blood pressure feeding program",
}
GENERIC_TABLE_TOKENS = {
    "area",
    "availability",
    "barangay",
    "collection",
    "contact",
    "hotline",
    "hotlines",
    "name",
    "number",
    "position",
    "schedule",
    "service",
    "time",
}


def clean_markdown(text: str) -> str:
    text = re.sub(r"^#{1,6}\s*", "", text.strip())
    text = re.sub(r"^\s*[-*]\s+", "", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text.strip()


@lru_cache(maxsize=1)
def load_knowledge_sections() -> dict[str, str]:
    content = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    sections: dict[str, str] = {}
    current_title: str | None = None
    current_lines: list[str] = []

    for line in content.splitlines():
        heading = re.match(r"^#\s+(.+?)\s*$", line)
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


def split_subsections(title: str, body: str) -> list[tuple[str, str]]:
    subsections: list[tuple[str, str]] = []
    current_title = title
    current_lines: list[str] = []

    for line in body.splitlines():
        heading = re.match(r"^#{2,6}\s+(.+?)\s*$", line)
        if heading:
            if current_lines:
                subsections.append((current_title, "\n".join(current_lines).strip()))
            current_title = heading.group(1).strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        subsections.append((current_title, "\n".join(current_lines).strip()))

    return subsections or [(title, body)]


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    tokens = {word for word in words if word not in STOP_WORDS and (len(word) > 1 or word.isdigit())}
    return tokens | {QUERY_ALIASES[word] for word in tokens if word in QUERY_ALIASES}


def table_rows_to_text(lines: list[str], question_tokens: set[str]) -> list[str]:
    rows = [line.strip() for line in lines if line.strip().startswith("|")]
    rows = [row for row in rows if not re.match(r"^\|\s*-+", row)]
    if len(rows) < 2:
        return []

    headers = [clean_markdown(cell) for cell in rows[0].strip("|").split("|")]
    scored_rows: list[tuple[int, str]] = []
    for row in rows[1:]:
        cells = [clean_markdown(cell) for cell in row.strip("|").split("|")]
        if len(cells) != len(headers):
            continue
        row_text = " ".join(cells)
        row_tokens = tokenize(row_text)
        specific_tokens = question_tokens - GENERIC_TABLE_TOKENS
        score = len(question_tokens & row_tokens) + (2 * len(specific_tokens & row_tokens))
        if question_tokens and score == 0:
            continue
        scored_rows.append((score, ", ".join(f"{header}: {cell}" for header, cell in zip(headers, cells))))

    if scored_rows:
        best_score = max(score for score, _ in scored_rows)
        return [text for score, text in scored_rows if score == best_score]

    output = []
    for row in rows[1:]:
        cells = [clean_markdown(cell) for cell in row.strip("|").split("|")]
        if len(cells) == len(headers):
            output.append(", ".join(f"{header}: {cell}" for header, cell in zip(headers, cells)))

    return output


def plain_answer(title: str, body: str, question_tokens: set[str]) -> str:
    subsections = split_subsections(title, body)
    best_title, best_body = max(
        subsections,
        key=lambda item: len(question_tokens & tokenize(f"{item[0]} {item[1]}")),
    )

    lines = [line for line in best_body.splitlines() if line.strip() and not line.strip() == "---"]
    table_answer = table_rows_to_text(lines, question_tokens)
    if table_answer:
        return "\n".join(table_answer[:6])

    useful_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") or re.match(r"^#{1,6}\s+", stripped):
            continue
        cleaned = clean_markdown(stripped)
        if not cleaned or cleaned.startswith(">"):
            continue
        line_tokens = tokenize(cleaned)
        label_match = re.match(r"^(date|time|location|schedule|required|requirements|eligible participants|freebies|notes):", cleaned.lower())
        if question_tokens & line_tokens or label_match:
            useful_lines.append(cleaned)

    if not useful_lines:
        useful_lines = [
            clean_markdown(line)
            for line in lines
            if clean_markdown(line) and not line.strip().startswith(("|", ">"))
        ]

    answer = " ".join(useful_lines[:5])
    return answer or fallback_reply(load_knowledge_sections())


def summarize_event_programs(body: str) -> str:
    event_blocks = re.findall(r"^##\s+(.+?)\s*\n(.*?)(?=^##\s+|\Z)", body, flags=re.DOTALL | re.MULTILINE)
    summaries: list[str] = []

    for event_title, event_body in event_blocks:
        details: list[str] = []
        for label in ("Date", "Schedule", "Time", "Location"):
            match = re.search(rf"^{label}:\s*(.+?)\s*$", event_body, flags=re.MULTILINE)
            if match:
                details.append(f"{label}: {clean_markdown(match.group(1))}")

        if details:
            summaries.append(f"{clean_markdown(event_title)} - " + ", ".join(details))
        else:
            summaries.append(clean_markdown(event_title))

    return "\n".join(summaries) if summaries else plain_answer("Upcoming Barangay Events & Programs", body, {"event", "events", "programs"})


def summarize_specific_event(body: str, question_tokens: set[str]) -> str | None:
    event_blocks = re.findall(r"^##\s+(.+?)\s*\n(.*?)(?=^##\s+|\Z)", body, flags=re.DOTALL | re.MULTILINE)
    if not event_blocks:
        return None

    specific_tokens = question_tokens - {"event", "events", "program", "programs", "when", "time", "date", "schedule"}
    if not specific_tokens:
        return None

    best_title = ""
    best_body = ""
    best_score = 0
    for event_title, event_body in event_blocks:
        score = len(specific_tokens & tokenize(event_title))
        if score > best_score:
            best_title = event_title
            best_body = event_body
            best_score = score

    if best_score == 0:
        return None

    return summarize_event_programs(f"## {best_title}\n{best_body}")


def answer_complaint_status_demo(body: str, message: str) -> str:
    rows = [line.strip() for line in body.splitlines() if line.strip().startswith("|")]
    rows = [row for row in rows if not re.match(r"^\|\s*-+", row)]
    if len(rows) < 2:
        return plain_answer("Complaint Status Demo", body, {"complaint", "status"})

    headers = [clean_markdown(cell) for cell in rows[0].strip("|").split("|")]
    complaint_id_match = re.search(r"\b(?:complaint|report)?\s*#?\s*(\d{3,})\b", message.lower())
    requested_id = complaint_id_match.group(1) if complaint_id_match else "1001"

    for row in rows[1:]:
        cells = [clean_markdown(cell) for cell in row.strip("|").split("|")]
        if len(cells) != len(headers):
            continue
        record = dict(zip(headers, cells))
        if record.get("Complaint ID") == requested_id:
            return (
                f"Complaint #{record['Complaint ID']} is {record['Status']}. "
                f"Concern: {record['Concern']}. "
                f"Assigned admin: {record['Assigned Admin']}. "
                f"Latest update: {record['Latest Update']}"
            )

    return f"Sorry, wala akong demo status for complaint #{requested_id}. Available demo complaint IDs are 1001, 1002, and 1003."


def answer_from_knowledge_base(message: str) -> str:
    sections = load_knowledge_sections()
    question_tokens = tokenize(message)
    normalized_message = " ".join(re.findall(r"[a-z0-9]+", message.lower()))

    if not question_tokens:
        return fallback_reply(sections)

    if "barangay hall" in normalized_message and question_tokens & {"open", "opening", "hours", "time", "schedule"}:
        section = sections.get("Barangay Hall Information", "")
        match = re.search(r"## Office Hours\s+(.*?)(?:\n##\s|\Z)", section, flags=re.DOTALL)
        if match:
            lines = [
                clean_markdown(line)
                for line in match.group(1).splitlines()
                if clean_markdown(line) and not line.strip() == "---"
            ]
            return " ".join(lines)

    if question_tokens & {"event", "events", "program", "programs", "upcoming"}:
        section = sections.get("Upcoming Barangay Events & Programs")
        if section:
            specific_event = summarize_specific_event(section, question_tokens)
            if specific_event:
                return specific_event
            if question_tokens & {"events", "programs", "upcoming", "list"}:
                return summarize_event_programs(section)

    if question_tokens & {"complaint", "complaints", "report", "reports"} and question_tokens & {"status", "update", "tracking", "progress"}:
        section = sections.get("Complaint Status Demo")
        if section:
            return answer_complaint_status_demo(section, message)

    if "barangay id" in normalized_message and question_tokens & {"requirement", "requirements", "bring", "need", "needed"}:
        section = sections.get("Barangay ID Registration Drive")
        if not section:
            events_section = sections.get("Upcoming Barangay Events & Programs", "")
            event_match = re.search(r"## Barangay ID Registration Drive\s+(.*?)(?:\n##\s|\Z)", events_section, flags=re.DOTALL)
            section = event_match.group(1) if event_match else ""
        if section:
            match = re.search(r"### Requirements\s+(.*?)(?:\n###|\Z)", section, flags=re.DOTALL)
            if match:
                requirements = [
                    clean_markdown(line)
                    for line in match.group(1).splitlines()
                    if clean_markdown(line) and not line.strip() == "---"
                ]
                return "Requirements: " + ", ".join(requirements)

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

    return plain_answer(best_title, best_body, question_tokens)


def fallback_reply(sections: dict[str, str]) -> str:
    return "Sorry, wala pa akong official info tungkol diyan. Please contact the barangay office for confirmation."


@router.post("/", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return ChatResponse(reply=answer_from_knowledge_base(payload.message))
