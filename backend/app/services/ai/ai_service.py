import json
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.core.constants import ALLOWED_TAGS, PRIORITY_LEVELS
from app.services.ai.prompt_loader import load_prompt


class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            api_key=settings.OPENAI_API_KEY,
        )

    def _run_json_prompt(self, prompt_file: str, variables: dict[str, Any]) -> dict[str, Any]:
        system_prompt = load_prompt(prompt_file)
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input_json}"),
        ])

        chain = prompt | self.llm
        response = chain.invoke({"input_json": json.dumps(variables, ensure_ascii=False)})

        try:
            return json.loads(response.content)
        except json.JSONDecodeError:
            return {}

    def auto_tag_complaint(self, description: str, address: str) -> dict[str, Any]:
        result = self._run_json_prompt(
            "tagging.md",
            {"description": description, "address": address},
        )

        tag = result.get("tag") if result.get("tag") in ALLOWED_TAGS else "other"
        priority = result.get("priority") if result.get("priority") in PRIORITY_LEVELS else "medium"

        return {
            "tag": tag,
            "priority": priority,
            "location_area": result.get("location_area"),
            "summary": result.get("summary") or description[:120],
        }

    def auto_assign_admin(self, location_area: str | None, admins: list[dict[str, Any]]) -> dict[str, Any]:
        eligible_admins = []
        for admin in admins:
            assigned = [x.strip().lower() for x in (admin.get("assigned_locations") or "").split(",")]
            if location_area and location_area.strip().lower() in assigned:
                eligible_admins.append(admin)

        candidates = eligible_admins or admins
        if not candidates:
            return {"admin_id": None, "dispatch_reason": "No admin available"}

        result = self._run_json_prompt(
            "assignment.md",
            {"location_area": location_area, "admins": candidates},
        )

        candidate_ids = {admin["id"] for admin in candidates}
        admin_id = result.get("admin_id")
        if admin_id not in candidate_ids:
            least_loaded = sorted(candidates, key=lambda x: x.get("active_reports", 0))[0]
            admin_id = least_loaded["id"]
            reason = "Fallback: assigned to eligible admin with least active workload."
        else:
            reason = result.get("dispatch_reason", "AI-assisted assignment based on location and workload.")

        return {"admin_id": admin_id, "dispatch_reason": reason}

    def generate_analytics(self, reports: list[dict[str, Any]]) -> dict[str, Any]:
        result = self._run_json_prompt("analytics.md", {"reports": reports})
        return result or {
            "summary": "No analytics available yet.",
            "top_issues": [],
            "recurring_patterns": [],
            "hotspot_areas": [],
            "suggested_actions": [],
            "forecast": "Not enough data yet.",
            "sla_issues": [],
        }

    def answer_question(self, question: str) -> str:
        knowledge_base = load_prompt("../seed/barangay_info_mock.md")
        system_prompt = load_prompt("chatbot.md")
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Question: {question}\n\nKnowledge base:\n{knowledge_base}"),
        ])
        chain = prompt | self.llm
        response = chain.invoke({"question": question, "knowledge_base": knowledge_base})
        return response.content
