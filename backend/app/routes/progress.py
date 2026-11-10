from fastapi import APIRouter
from app.database import DatabaseService

router = APIRouter(prefix="/api/progress", tags=["Progress Dashboard & Attempts Analytics"])


@router.get("/{student_id}")
def get_progress_analytics(student_id: str):
    """
    Returns progress analytics across attempts:
    - Attempt history (scores, dates, attempt numbers)
    - Topic mastery progression (Weak -> Medium -> Strong shifts)
    - Latest vs First attempt improvement delta
    """
    reports = DatabaseService.get_all_gap_reports(student_id)

    if not reports:
        return {
            "has_data": False,
            "total_attempts": 0,
            "attempts": [],
            "improvement_pct": 0.0,
            "topic_trends": {},
            "summary": "No diagnostic tests taken yet. Take your first test to establish a baseline!"
        }

    attempts = []
    for r in reports:
        attempts.append({
            "attempt_number": r.get("attempt_number", 1),
            "overall_score": r.get("overall_score", 0.0),
            "correct_count": r.get("correct_count", 0),
            "total_questions": r.get("total_questions", 0),
            "weak_count": len(r.get("weak_topics", [])),
            "medium_count": len(r.get("medium_topics", [])),
            "strong_count": len(r.get("strong_topics", [])),
            "created_at": r.get("created_at")
        })

    first_score = attempts[0]["overall_score"]
    latest_score = attempts[-1]["overall_score"]
    delta = round(latest_score - first_score, 1)

    # Track topic transitions across attempts
    topic_trends = {}
    for r in reports:
        tb = r.get("topic_breakdown", {})
        att_num = r.get("attempt_number", 1)
        for topic, info in tb.items():
            if topic not in topic_trends:
                topic_trends[topic] = []
            topic_trends[topic].append({
                "attempt": att_num,
                "score": info.get("score", 0),
                "status": info.get("status", "medium")
            })

    if delta > 0:
        summary = f"Great progress! You improved by +{delta}% from Attempt 1 ({first_score}%) to Attempt {len(attempts)} ({latest_score}%)."
    elif delta == 0 and len(attempts) > 1:
        summary = f"Steady score of {latest_score}% across {len(attempts)} attempts. Ready to push for 90%+!"
    elif len(attempts) == 1:
        summary = f"Baseline diagnostic established at {first_score}%. Follow your personalized revision plan to boost your weak areas."
    else:
        summary = f"Latest score is {latest_score}%. Revisit your revision plan for targeted practice."

    return {
        "has_data": True,
        "total_attempts": len(attempts),
        "attempts": attempts,
        "initial_score": first_score,
        "latest_score": latest_score,
        "improvement_pct": delta,
        "topic_trends": topic_trends,
        "summary": summary
    }

