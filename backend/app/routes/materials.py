from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional
from app.schemas import TextMaterialUploadRequest
from app.database import DatabaseService
from app.rag_engine import RAGEngine

router = APIRouter(prefix="/api/materials", tags=["Study Materials Upload"])


@router.post("/upload")
async def upload_material_file(
    student_id: str = Form(...),
    title: str = Form(...),
    material_type: str = Form(...),  # syllabus | notes | past_paper
    file: UploadFile = File(...)
):
    """Handles PDF or plain text uploads, extracts text, chunks, and stores."""
    if material_type not in ["syllabus", "notes", "past_paper"]:
        raise HTTPException(status_code=400, detail="Invalid material_type. Must be 'syllabus', 'notes', or 'past_paper'.")

    contents = await file.read()
    filename = file.filename or "upload.txt"
    print(f"\n[Materials API] Received upload request: filename='{filename}', title='{title}', type='{material_type}', size={len(contents)} bytes")
    extracted_text = ""

    if filename.lower().endswith(".pdf"):
        try:
            extracted_text, _ = RAGEngine.extract_text_from_pdf(contents)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    else:
        try:
            extracted_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = contents.decode("latin-1", errors="ignore")

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="The uploaded file contains no readable text. (Note: scanned image PDFs without an OCR text layer cannot be parsed directly. Please upload a standard text PDF or TXT file.)"
        )

    chunks = RAGEngine.chunk_material(extracted_text, title, material_type)
    chunk_count = len(chunks)

    saved = DatabaseService.save_study_material(
        student_id=student_id,
        title=title,
        material_type=material_type,
        file_content=extracted_text,
        filename=filename,
        chunk_count=chunk_count
    )

    # Save chunks and vector embeddings into Supabase pgvector & local SQLite
    DatabaseService.save_document_chunks(
        material_id=saved["id"],
        student_id=student_id,
        chunks=chunks
    )

    return {
        "success": True,
        "message": f"Successfully indexed '{title}' ({material_type}) into {chunk_count} RAG chunks.",
        "material": saved
    }


@router.post("/text")
def upload_text_material(req: TextMaterialUploadRequest):
    """Directly uploads raw text material (syllabus, notes, past paper)."""
    if req.material_type not in ["syllabus", "notes", "past_paper"]:
        raise HTTPException(status_code=400, detail="Invalid material_type.")

    chunks = RAGEngine.chunk_material(req.content, req.title, req.material_type)
    saved = DatabaseService.save_study_material(
        student_id=req.student_id,
        title=req.title,
        material_type=req.material_type,
        file_content=req.content,
        filename=req.filename or "text_input.txt",
        chunk_count=len(chunks)
    )

    DatabaseService.save_document_chunks(
        material_id=saved["id"],
        student_id=req.student_id,
        chunks=chunks
    )

    return {
        "success": True,
        "message": f"Successfully stored '{req.title}' with {len(chunks)} chunks.",
        "material": saved
    }


@router.get("/{student_id}")
def list_student_materials(student_id: str):
    """Lists all materials uploaded by the student."""
    materials = DatabaseService.get_study_materials(student_id)
    return {"materials": materials, "count": len(materials)}


@router.delete("/{material_id}")
def delete_material_endpoint(material_id: str, student_id: str = Query(...)):
    """Deletes an uploaded document and its associated vector chunks."""
    DatabaseService.delete_study_material(material_id, student_id)
    return {"success": True, "message": "Document and associated chunks deleted successfully."}
