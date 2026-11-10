from fastapi import APIRouter
from app.schemas import TopicMapGenerateRequest
from app.database import DatabaseService
from app.groq_service import AIService

router = APIRouter(prefix="/api/topic-map", tags=["Topic Map Engine"])


@router.post("/generate")
def generate_topic_map_endpoint(req: TopicMapGenerateRequest):
    """
    Extracts or generates a hierarchical topic map from the student's uploaded syllabus
    or subject prompt, computing exam weightages dynamically.
    """
    materials = DatabaseService.get_all_materials_content(req.student_id)
    subject = req.subject or "General Studies"

    syllabus_texts = [m["file_content"] for m in materials if m["material_type"] == "syllabus"]
    past_paper_texts = [m["file_content"] for m in materials if m["material_type"] == "past_paper"]
    notes_texts = [m["file_content"] for m in materials if m["material_type"] == "notes"]

    combined_syllabus = "\n\n".join(syllabus_texts) if syllabus_texts else "\n\n".join(notes_texts)
    combined_past_papers = "\n\n".join(past_paper_texts)

    if not combined_syllabus:
        # Prompt Groq to dynamically synthesize the syllabus topic breakdown for this subject
        combined_syllabus = f"Standard comprehensive course syllabus and core curriculum for: {subject}."

    topic_data = AIService.generate_topic_map(combined_syllabus, combined_past_papers, subject=subject)

    saved = DatabaseService.save_topic_map(
        student_id=req.student_id,
        subject=subject,
        topic_data=topic_data
    )

    return {
        "success": True,
        "message": f"Successfully generated topic map with {len(topic_data)} dynamic topics.",
        "topic_map": saved
    }


@router.get("/{student_id}")
def get_student_topic_map(student_id: str):
    """Returns the latest generated topic map for the student."""
    topic_map = DatabaseService.get_latest_topic_map(student_id)
    if not topic_map:
        return {"topic_map": None, "message": "No topic map generated yet."}
    return {"topic_map": topic_map}
