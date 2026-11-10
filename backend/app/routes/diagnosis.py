from fastapi import APIRouter, HTTPException
from app.schemas import PlanGenerateRequest, ToggleTaskRequest
from app.database import DatabaseService
from app.groq_service import AIService

router = APIRouter(prefix="/api/diagnosis", tags=["Gap Diagnosis & Revision Planner"])


@router.get("/{student_id}/latest")
def get_latest_gap_report(student_id: str):
    """Fetches the latest Gap Report for the student."""
    report = DatabaseService.get_latest_gap_report(student_id)
    if not report:
        return {"gap_report": None, "message": "No diagnostic quiz taken yet."}
    return {"gap_report": report}


@router.post("/plan")
def generate_personalized_revision_plan(req: PlanGenerateRequest):
    """
    Generates a personalized revision plan based on student's diagnostic weaknesses,
    exam weightages, and available time constraint (e.g. 5 days, 2 hours/day).
    """
    gap_report = DatabaseService.get_latest_gap_report(req.student_id)
    
    # If no diagnostic quiz taken yet, create a clean starter gap report
    if not gap_report:
        topic_map_rec = DatabaseService.get_latest_topic_map(req.student_id)
        default_topic = topic_map_rec["subject"] if topic_map_rec else "Core Subject"
        gap_report = {
            "id": "starter",
            "overall_score": 50.0,
            "weak_topics": [f"{default_topic} - Foundations"],
            "medium_topics": [f"{default_topic} - Practice"],
            "strong_topics": [],
            "topic_breakdown": {
                f"{default_topic} - Foundations": {
                    "status": "weak",
                    "score": 40.0,
                    "reason": "Diagnostic baseline needed",
                    "recommended_focus": "Begin comprehensive topic revision"
                }
            }
        }

    topic_map_record = DatabaseService.get_latest_topic_map(req.student_id)
    topic_map_data = topic_map_record.get("topic_data") if topic_map_record else []

    plan_schedule = AIService.generate_revision_plan(
        gap_report=gap_report,
        topic_map=topic_map_data,
        available_days=req.available_days,
        daily_hours=req.daily_hours
    )

    total_hours = req.available_days * req.daily_hours

    saved_plan = DatabaseService.save_revision_plan(
        student_id=req.student_id,
        gap_report_id=gap_report.get("id", "initial"),
        available_days=req.available_days,
        daily_hours=req.daily_hours,
        total_hours=total_hours,
        plan_schedule=plan_schedule
    )

    return {
        "success": True,
        "message": f"Personalized {req.available_days}-day revision plan generated successfully.",
        "revision_plan": saved_plan
    }


@router.get("/{student_id}/plan")
def get_active_revision_plan(student_id: str):
    """Retrieves the active personalized revision plan for the student."""
    plan = DatabaseService.get_latest_revision_plan(student_id)
    if not plan:
        return {"revision_plan": None, "message": "No active revision plan found."}
    return {"revision_plan": plan}


@router.post("/task/toggle")
def toggle_revision_task_endpoint(req: ToggleTaskRequest):
    """Marks a revision task complete/incomplete in the student's study plan."""
    plan = DatabaseService.toggle_revision_task(
        student_id=req.student_id,
        plan_id=req.plan_id,
        day_number=req.day_number,
        task_index=req.task_index,
        completed=req.completed
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Active revision plan not found.")
    return {"success": True, "revision_plan": plan}
