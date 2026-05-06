
import json
from typing import Any

from ...schemas.schemas import ComplaintTaggingResult
from app.core.config import settings
from .ai_service import AIService


class AITaggingService():
    def __init__(self):
        # Reuse the centralized AIService which configures the LLM and prompt runner
        self.ai_service = AIService()

        # Define allowed tags for the validation step
        self.allowed_tags = {
            "garbage", "flooding", "noise", "road_damage", "illegal_parking",
            "vandalism", "street_light", "drainage_clog", "water_leak",
            "power_outage", "dangling_wires", "open_manhole", "broken_sidewalk",
            "sidewalk_obstruction", "abandoned_vehicle", "illegal_terminal",
            "traffic_congestion", "reckless_driving", "loitering", "curfew_violation",
            "public_intoxication", "drug_related_activity", "theft_robbery",
            "stray_animals", "burning_trash", "sewage_leak", "stagnant_water",
            "overgrown_vegetation", "illegal_dumping", "boundary_dispute",
            "illegal_construction", "verbal_harassment", "other"
        }

    async def auto_tag_complaint(self, description: str, location: str):
        """
        Passes both description and location into the LangChain chain for processing. 
        The chain will use the provided prompt template to generate the tag and location area based on the input data.
        """
        # The keys here must match the {placeholders} in your .md file
        variables = {
            "description": description,
            "location": location
        }
        # Use the shared AIService prompt runner which returns parsed JSON
        raw_output = self.ai_service._run_json_prompt("tagging.md", variables)

        # Convert raw dict to Pydantic model for validation
        ai_result = ComplaintTaggingResult(**raw_output)

        return self.validate_ai_output(ai_result)

    def validate_ai_output(self, ai_result: ComplaintTaggingResult) -> ComplaintTaggingResult:
        """
        Ensures the AI didn't hallucinate tags and follows business rules.
        """
        # 1. Check if the tag is actually in our allowed list
        if ai_result.tagging not in self.allowed_tags:
            ai_result.tagging = "other"

        # 2. Logic Check: Ensure priority is lowercase for DB consistency
        ai_result.priority = ai_result.priority.lower()

        return ai_result
