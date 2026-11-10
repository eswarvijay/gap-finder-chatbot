from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas import QuizGenerateRequest, QuizSubmitRequest
from app.database import DatabaseService
from app.rag_engine import RAGEngine
from app.groq_service import AIService

router = APIRouter(prefix="/api/quiz", tags=["Diagnostic Quiz Engine"])


def sanitize_quiz_for_client(quiz: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes quiz questions for client-side assessment.
    Strips correct_option_index and explanation so answers are not exposed in browser devtools.
    """
    if not quiz:
        return quiz
    safe_quiz = dict(quiz)
    safe_questions = []
    for q in quiz.get("questions", []):
        sq = {
            "id": q.get("id"),
            "topic": q.get("topic"),
            "subtopic": q.get("subtopic"),
            "question": q.get("question"),
            "options": q.get("options", []),
            "source_citation": q.get("source_citation"),
            "difficulty": q.get("difficulty", "Medium"),
            "question_type": q.get("question_type", "mcq")
        }
        safe_questions.append(sq)
    safe_quiz["questions"] = safe_questions
    return safe_quiz


@router.post("/generate")
def generate_quiz_endpoint(req: QuizGenerateRequest):
    """
    Generates diagnostic questions dynamically from uploaded student materials.
    Stores full answer keys securely on the backend; client receives sanitized questions.
    """
    materials = DatabaseService.get_all_materials_content(req.student_id)
    subject = req.subject or "General Studies"

    retrieved = []
    if materials:
        all_chunks = []
        for m in materials:
            m_chunks = RAGEngine.chunk_material(m["file_content"], m["title"], m["material_type"])
            all_chunks.extend(m_chunks)

        if all_chunks:
            query = req.focus_topic or f"{subject} key concepts, problems, edge cases"
            retrieved = RAGEngine.retrieve_relevant_chunks(query, all_chunks, top_k=6)

    # If no retrieved chunks, ground with curriculum standards
    if not retrieved:
        retrieved = [{
            "chunk_id": f"{subject}_core",
            "text": f"Core diagnostic principles, foundational theorems, and common problem-solving edge cases for {subject}.",
            "citation": f"{subject} Curriculum Standards",
            "source_title": f"{subject} Subject Guide"
        }]

    questions = AIService.generate_diagnostic_quiz(
        retrieved_chunks=retrieved,
        num_questions=req.num_questions,
        subject=subject
    )

    saved_quiz = DatabaseService.save_quiz(
        student_id=req.student_id,
        title=f"Diagnostic Test: {subject}",
        subject=subject,
        questions=questions
    )

    return {
        "success": True,
        "message": f"Generated {len(questions)} diagnostic questions dynamically.",
        "quiz": sanitize_quiz_for_client(saved_quiz)
    }


@router.get("/{quiz_id}")
def get_quiz_endpoint(quiz_id: str):
    """Retrieves sanitized quiz details for taking the test."""
    quiz = DatabaseService.get_quiz(quiz_id)
    if not quiz:
        return {"quiz": None, "message": "Quiz not found"}
    return {"quiz": sanitize_quiz_for_client(quiz)}


@router.post("/submit")
def submit_quiz_answers(req: QuizSubmitRequest):
    """
    Evaluates student answers securely against backend answer keys,
    explains right/wrong choices with citations, and generates the Gap Report (🔴 Weak, 🟡 Medium, 🟢 Strong).
    """
    quiz = DatabaseService.get_quiz(req.quiz_id) if req.quiz_id else None

    questions = []
    if quiz and "questions" in quiz:
        questions = quiz["questions"]
    else:
        questions = AIService.generate_diagnostic_quiz([], num_questions=5)

    answers_dict = [{"question_id": a.question_id, "selected_option_index": a.selected_option_index} for a in req.answers]
    diagnosis = AIService.evaluate_quiz_and_diagnose(questions, answers_dict)

    saved_report = DatabaseService.save_gap_report(
        student_id=req.student_id,
        quiz_id=req.quiz_id,
        overall_score=diagnosis["overall_score"],
        total_questions=diagnosis["total_questions"],
        correct_count=diagnosis["correct_count"],
        topic_breakdown=diagnosis["topic_breakdown"],
        weak_topics=diagnosis["weak_topics"],
        medium_topics=diagnosis["medium_topics"],
        strong_topics=diagnosis["strong_topics"],
        doctor_summary=diagnosis["doctor_summary"],
        student_answers=diagnosis["student_answers"]
    )

    return {
        "success": True,
        "message": "Quiz evaluated dynamically. Gap Report generated.",
        "gap_report": saved_report
    }
