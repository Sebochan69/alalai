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
        # Provide both a JSON blob and individual variables to support templates
        payload = {"input_json": json.dumps(variables, ensure_ascii=False)}
        # merge individual variables so ChatPromptTemplate can access named placeholders
        if isinstance(variables, dict):
            payload.update(variables)

        response = chain.invoke(payload)

        try:
            return json.loads(response.content)
        except json.JSONDecodeError:
            return {}

    def auto_assign_admin(self, location_area: str | None, admins: list[dict[str, Any]]) -> dict[str, Any]:
        normalized_location = self._normalize_location(location_area)
        eligible_admins = [
            admin
            for admin in admins
            if normalized_location and normalized_location in self._assigned_location_set(admin)
        ]

        candidates = eligible_admins or admins
        if not candidates:
            return {"admin_id": None, "dispatch_reason": "No admin available"}

        result = self._run_json_prompt(
            "assignment.md",
            {"location_area": location_area, "admins": candidates},
        )

        candidate_ids = {admin["id"] for admin in candidates}
        admin_id = self._normalize_admin_id(result.get("admin_id"))
        if admin_id not in candidate_ids:
            least_loaded = self._least_loaded_admin(candidates)
            admin_id = least_loaded["id"]
            reason = self._fallback_dispatch_reason(
                admin=least_loaded,
                location_area=location_area,
                used_location_match=bool(eligible_admins),
            )
        else:
            reason = result.get(
                "dispatch_reason", "AI-assisted assignment based on location and workload.")

        return {"admin_id": admin_id, "dispatch_reason": reason}

    def _assigned_location_set(self, admin: dict[str, Any]) -> set[str]:
        return {
            self._normalize_location(location)
            for location in (admin.get("assigned_locations") or "").split(",")
            if self._normalize_location(location)
        }

    def _fallback_dispatch_reason(
        self,
        admin: dict[str, Any],
        location_area: str | None,
        used_location_match: bool,
    ) -> str:
        admin_name = admin.get("full_name") or f"Admin #{admin.get('id')}"
        active_reports = admin.get("active_reports", 0)
        if used_location_match:
            return (
                f"Fallback: assigned to {admin_name} because they cover {location_area} "
                f"and have {active_reports} active report(s)."
            )
        return (
            f"Fallback: assigned to {admin_name} because no location match was found "
            f"and they have the lowest active workload ({active_reports})."
        )

    def _least_loaded_admin(self, admins: list[dict[str, Any]]) -> dict[str, Any]:
        return sorted(admins, key=lambda admin: (admin.get("active_reports", 0), admin.get("id", 0)))[0]

    def _normalize_admin_id(self, admin_id: Any) -> int | None:
        if isinstance(admin_id, bool):
            return None
        if isinstance(admin_id, int):
            return admin_id
        if isinstance(admin_id, str) and admin_id.strip().isdigit():
            return int(admin_id.strip())
        return None

    def _normalize_location(self, location: str | None) -> str:
        return (location or "").strip().lower()

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

    def generate_monthly_report(self, context: dict[str, Any]) -> dict[str, Any]:
        result = self._run_json_prompt("monthly_report.md", context)
        return result or {
            "forecast": "Not enough complaint data to forecast next month reliably.",
            "suggest_actions": [],
            "category_breakdown": context.get("category_breakdown", {}),
        }

    def answer_question(self, question: str) -> str:
        knowledge_base = load_prompt("../seed/barangay_info_mock.md")
        system_prompt = load_prompt("chatbot.md")
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human",
             "Question: {question}\n\nKnowledge base:\n{knowledge_base}"),
        ])
        chain = prompt | self.llm
        response = chain.invoke(
            {"question": question, "knowledge_base": knowledge_base})
        return response.content
