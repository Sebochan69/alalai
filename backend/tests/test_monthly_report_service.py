import unittest
from datetime import datetime

from app.db.db import Complaint
from app.services.monthly_report_service import build_monthly_metrics, parse_month


class MonthlyReportServiceTests(unittest.TestCase):
    def test_parse_month_returns_full_month_range(self):
        start, end = parse_month("2026-05")

        self.assertEqual(start, datetime(2026, 5, 1))
        self.assertEqual(end.year, 2026)
        self.assertEqual(end.month, 5)
        self.assertEqual(end.day, 31)

    def test_build_monthly_metrics_counts_completion_days_and_categories(self):
        complaints = [
            Complaint(
                status="resolved",
                tagging="garbage",
                created_at=datetime(2026, 5, 1),
                date_resolved=datetime(2026, 5, 3),
            ),
            Complaint(
                status="pending",
                tagging="flooding",
                created_at=datetime(2026, 5, 4),
            ),
            Complaint(
                status="in progress",
                tagging="garbage",
                created_at=datetime(2026, 5, 5),
            ),
        ]

        metrics = build_monthly_metrics("2026-05", complaints)

        self.assertEqual(metrics["overall_complaint_count"], 3)
        self.assertEqual(metrics["overall_completion_rate"], 33)
        self.assertEqual(metrics["avg_solution_days"], 2)
        self.assertEqual(metrics["unresolved_count"], 2)
        self.assertEqual(metrics["status_counts"]["pending"], 1)
        self.assertEqual(metrics["status_counts"]["in progress"], 1)
        self.assertEqual(metrics["status_counts"]["resolved"], 1)
        self.assertEqual(metrics["category_breakdown"], {"garbage": 2, "flooding": 1})

    def test_empty_month_returns_zero_metrics(self):
        metrics = build_monthly_metrics("2026-05", [])

        self.assertEqual(metrics["overall_complaint_count"], 0)
        self.assertEqual(metrics["overall_completion_rate"], 0)
        self.assertEqual(metrics["avg_solution_days"], 0)
        self.assertEqual(metrics["category_breakdown"], {})


if __name__ == "__main__":
    unittest.main()
