from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest
from app.database import DatabaseService
from app.rag_engine import RAGEngine
from app.groq_service import AIService

router = APIRouter(prefix="/api/chat", tags=["'Explain This Topic' RAG Assistant"])


@router.post("")
def chat_explain_topic(req: ChatRequest):
    """
    Conversational RAG Study Doctor Chatbot.
    Answers dynamically using Groq LLM, grounded in uploaded student materials,
    aware of current student weaknesses and diagnosis.
    """
    materials = DatabaseService.get_all_materials_content(req.student_id)
    student = DatabaseService.get_or_create_student("demo.student@gapfinder.ai", "Student")
    student_name = student.get("full_name", "Student")

    # Fetch latest gap report for clinical context
    latest_gap_report = DatabaseService.get_latest_gap_report(req.student_id)

    # Extract all chunks if materials exist
    all_chunks = []
    if materials:
        for m in materials:
            chunks = RAGEngine.chunk_material(m["file_content"], m["title"], m["material_type"])
            all_chunks.extend(chunks)

    # Search top relevant chunks
    query = f"{req.topic or ''} {req.message}".strip()
    top_chunks = RAGEngine.retrieve_relevant_chunks(query, all_chunks, top_k=4) if all_chunks else []

    # Get recent history
    raw_history = DatabaseService.get_chat_history(req.student_id, limit=6)
    formatted_history = [{"role": m.get("role"), "content": m.get("content")} for m in raw_history]

    # Generate grounded explanation
    result = AIService.chat_with_tutor(
        user_message=req.message,
        retrieved_chunks=top_chunks,
        chat_history=formatted_history,
        student_name=student_name,
        latest_gap_report=latest_gap_report
    )

    # Save user message and assistant reply to DB
    DatabaseService.save_chat_message(
        student_id=req.student_id,
        role="user",
        content=req.message,
        topic=req.topic
    )

    saved_msg = DatabaseService.save_chat_message(
        student_id=req.student_id,
        role="assistant",
        content=result["answer"],
        topic=req.topic,
        citations=result["citations"]
    )

    return {
        "reply": result["answer"],
        "citations": result["citations"],
        "retrieval_used": result["retrieval_used"],
        "model_used": result.get("model_used"),
        "message_id": saved_msg["id"]
    }


@router.get("/history/{student_id}")
def get_chat_history_endpoint(student_id: str):
    """Returns conversation history for this student."""
    messages = DatabaseService.get_chat_history(student_id)
    return {"messages": messages}
