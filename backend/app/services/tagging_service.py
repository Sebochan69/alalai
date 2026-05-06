from .ai.ai_tagging import AITaggingService
from datetime import datetime


class TaggingService:
    def __init__(self):
        # Initialize the AI component
        self.ai_engine = AITaggingService()

# #     {
        # user_id
# #   "location": "Brgy. Central",
#     "long": 120.982,
#     "lat": 14.604,
#     "description": "Large pothole near market",
#     "media": "https://example.com/photo.jpg"
# # }
    async def process_incoming_complaint(self, complaint_data: dict) -> dict:
        """
        Orchestrates the tagging workflow for a single complaint.
        """
        # 1. Extract context for the AI
        description = complaint_data.get("description")
        location = complaint_data.get("location")

        # 2. Call the AI Service to get structured tags
        # We only pass what is necessary to save tokens and maintain privacy
        ai_result = await self.ai_engine.auto_tag_complaint(
            description=description,
            location=location
        )

        validated_result = self.ai_engine.validate_ai_output(ai_result)

        # Preserve provided created_at if present, otherwise use current UTC time
        created_at = complaint_data.get("created_at") or datetime.utcnow()

        # 3. Merge results back into the final dictionary
        # This includes your original fields + the new AI-generated fields
        # Align output keys with the `Complaint` DB model
        output = {
            "id": None,  # This will not yet se be set until we save to DB
            "user_id": complaint_data.get("user_id"),
            "assigned_id": None,
            "location": location,
            "long": complaint_data.get("long"),
            "lat": complaint_data.get("lat"),
            "description": description,
            "media": complaint_data.get("media"),

            "priority": validated_result.priority,
            "tagging": validated_result.tagging,
            "summary": validated_result.summary,
            "created_at": None,  # This will be set when we save to DB
        }

        return output
