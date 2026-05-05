import unittest
import os

os.environ["DEBUG"] = "false"
from app.services.ai.ai_service import AIService


class StubAssignmentAI(AIService):
    def __init__(self, response):
        self.response = response
        self.prompt_calls = []

    def _run_json_prompt(self, prompt_file, variables):
        self.prompt_calls.append((prompt_file, variables))
        return self.response


class AIAssignmentTests(unittest.TestCase):
    def test_exact_location_match_is_sent_as_only_candidate(self):
        ai = StubAssignmentAI({"admin_id": 1, "dispatch_reason": "Zone 1 match."})
        result = ai.auto_assign_admin("Zone 1", [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1,Purok 1", "active_reports": 4},
            {"id": 2, "full_name": "Admin B", "assigned_locations": "Zone 2", "active_reports": 0},
        ])

        self.assertEqual(result["admin_id"], 1)
        self.assertEqual(ai.prompt_calls[0][1]["admins"], [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1,Purok 1", "active_reports": 4},
        ])

    def test_location_matching_is_case_insensitive(self):
        ai = StubAssignmentAI({"admin_id": 2, "dispatch_reason": "Purok 2 match."})
        result = ai.auto_assign_admin("purok 2", [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1", "active_reports": 0},
            {"id": 2, "full_name": "Admin B", "assigned_locations": "B,Zone 2,Purok 2", "active_reports": 5},
        ])

        self.assertEqual(result["admin_id"], 2)

    def test_invalid_ai_id_falls_back_to_least_loaded_location_match(self):
        ai = StubAssignmentAI({"admin_id": 999, "dispatch_reason": "Bad id."})
        result = ai.auto_assign_admin("Zone 1", [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1", "active_reports": 3},
            {"id": 2, "full_name": "Admin B", "assigned_locations": "Zone 1", "active_reports": 1},
        ])

        self.assertEqual(result["admin_id"], 2)
        self.assertIn("Fallback", result["dispatch_reason"])
        self.assertIn("Zone 1", result["dispatch_reason"])

    def test_no_location_match_falls_back_to_least_loaded_admin(self):
        ai = StubAssignmentAI({"admin_id": None})
        result = ai.auto_assign_admin("Unknown Area", [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1", "active_reports": 2},
            {"id": 2, "full_name": "Admin B", "assigned_locations": "Zone 2", "active_reports": 0},
        ])

        self.assertEqual(result["admin_id"], 2)
        self.assertIn("no location match", result["dispatch_reason"].lower())

    def test_missing_location_uses_all_admins_and_least_workload_fallback(self):
        ai = StubAssignmentAI({"admin_id": "bad"})
        result = ai.auto_assign_admin(None, [
            {"id": 1, "full_name": "Admin A", "assigned_locations": "Zone 1", "active_reports": 4},
            {"id": 2, "full_name": "Admin B", "assigned_locations": "Zone 2", "active_reports": 1},
        ])

        self.assertEqual(result["admin_id"], 2)
        self.assertEqual(len(ai.prompt_calls[0][1]["admins"]), 2)

    def test_string_admin_id_from_ai_is_accepted_when_valid(self):
        ai = StubAssignmentAI({"admin_id": "2", "dispatch_reason": "Lowest workload."})
        result = ai.auto_assign_admin("Zone 2", [
            {"id": 2, "full_name": "Admin B", "assigned_locations": "Zone 2", "active_reports": 1},
        ])

        self.assertEqual(result["admin_id"], 2)
        self.assertEqual(result["dispatch_reason"], "Lowest workload.")

    def test_no_admin_candidates_returns_null_assignment(self):
        ai = StubAssignmentAI({"admin_id": 1})
        result = ai.auto_assign_admin("Zone 1", [])

        self.assertEqual(result, {"admin_id": None, "dispatch_reason": "No admin available"})
        self.assertEqual(ai.prompt_calls, [])


if __name__ == "__main__":
    unittest.main()
