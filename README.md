# GapFinder AI (Find What the Student Doesn’t Know)
> **Hackathon Problem Statement 2026** — *The 100% Dynamic "Doctor for Studying" Diagnostic & Adaptive Revision Platform*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Cloud-f55036.svg)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres%20+%20pgvector-3ecf8e.svg)](https://supabase.com/)
[![React Vite](https://img.shields.io/badge/Frontend-React%20+%20Tailwind-61dafb.svg)](https://vitejs.dev/)

---

## 📌 Problem & Purpose

Students often study everything equally and still miss what they don’t know. Most study apps wait for the student to ask a question — but a student cannot ask about a gap they don't know they have.

**GapFinder AI** operates as a **"Doctor for Studying"**:
It doesn't wait for questions. It ingests study materials, tests the student with grounded questions, diagnoses weak spots into **🔴 Weak**, **🟡 Medium**, and **🟢 Strong**, and prescribes an adaptive, time-fitted treatment plan that automatically updates as the student improves.

The core loop:
$$\text{Upload} \longrightarrow \text{Test} \longrightarrow \text{Diagnose Weak Spots} \longrightarrow \text{Plan Revision} \longrightarrow \text{Re-Test} \longrightarrow \text{Plan Updates}$$

---

## 🌟 Expected Features & Verification

| # | Expected Feature | Implementation in GapFinder AI |
|---|---|---|
| **1** | **Material Upload** | Ingests Syllabus, Textbook Chapters, Notes, and Past Papers (PDF or text). Real-time chunking and vector indexing. |
| **2** | **Topic Map** | Parses curriculum hierarchy and links past-paper question frequency to calculate exam weightages. |
| **3** | **Diagnostic Quiz** | Generated dynamically from retrieved chunks, grounded in source material with citations (`[Source: Chapter X, Section Y]`). |
| **4** | **Answer Evaluation** | Evaluates answers and explains why each choice is right or wrong with source references. |
| **5** | **Gap Report (The Main Output)** | Categorizes every topic into **🔴 Weak**, **🟡 Medium**, and **🟢 Strong** with specific diagnostic reasons. |
| **6** | **Personalized Revision Plan** | Prioritizes weakest and high-yield topics first; interactive sliders for available days and daily study hours. |
| **7** | **Explain-This-Topic Assistant** | Conversational tutor answering strictly from uploaded excerpts with provenance citations. |
| **8** | **Progress Dashboard** | Tracks improvement across attempts (e.g., *Attempt 1: 33% → Attempt 2: 75%*) and topic mastery evolution. |
| **9** | **Login & Demo Accounts** | 1-click accounts ready for Hackathon judges & testers: Alex Mercer (CS), Jordan Lee (Physics), Priya Sharma (Biology). |
| **10**| **Mandatory AI Feature (RAG Transparency)** | Dedicated visual inspector explaining retrieval vector search vs. LLM generation and how citations are validated. |

---

## 🚀 Quick Start Guide

### 1. Environment Configuration (`.env`)
Configured in `.env`:
```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b

SUPABASE_URL=https://ltjbvubehlxisschptlb.supabase.co
SUPABASE_KEY=sb_publishable_...
```

### 2. Start Both Services in 1-Click
Run the launcher script from the project root:
```bash
run_app.bat
```
*(Or in PowerShell: `.\run_app.ps1`)*

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🗄️ Database Architecture (Supabase & pgvector)

All database schema definitions are pre-packaged in [`supabase_schema.sql`](./supabase_schema.sql):
- **`students`**: Profiles, targets, and auth metadata.
- **`study_materials`**: Uploaded syllabi, notes, and past papers.
- **`document_chunks`**: Document chunks with **`embedding vector(384)`** for semantic similarity search.
- **`topic_maps`**: Extracted curriculum structure and exam weightages.
- **`diagnostic_quizzes`**: Generated grounded multiple-choice questions.
- **`gap_reports`**: Diagnostic evaluations (**🔴 Weak**, **🟡 Medium**, **🟢 Strong**).
- **`revision_plans`**: Time-adapted daily study schedules.
- **`chat_messages`**: Conversational history with provenance citations.

*(Seamless SQLite local fallback included in `backend/gapfinder.db` so the app is always resilient).*

---

## 🔬 RAG vs. Generation Separation (Mandatory AI Criterion)

1. **Retrieval Phase (Deterministic):**
   - User query / topic is tokenized and matched against document chunks using TF-IDF and vector cosine similarity.
   - Top-ranked chunks are retrieved along with their exact file provenance and page/section numbers.
   - Retrieval contains **zero hallucinated content**.

2. **Grounding Boundary:**
   - The retrieved passages are packaged into a bounded context with explicit `[Citation: ...]` tags.
   - System prompt instructs the model to generate questions and explanations strictly within these boundaries.

3. **Generation Phase (LLM):**
   - Groq (`openai/gpt-oss-120b`) synthesizes clear conceptual explanations and multiple-choice options.
   - Every question and answer statement includes its provenance citation for student verification.

---

## ☁️ Cloud Deployment (Vercel + Render)

The project is structured as a monorepo so you only need **one single GitHub repository**:

- **Frontend (Vercel)**:
  1. Import repository on [Vercel.com](https://vercel.com).
  2. Set **Root Directory** to `frontend`.
  3. Add environment variable: `VITE_API_URL = https://your-backend.onrender.com`.
  4. Click **Deploy**.

- **Backend (Render)**:
  1. Create a Web Service on [Render.com](https://render.com) pointing to the same repository.
  2. Set **Root Directory** to `backend`.
  3. Build Command: `pip install -r requirements.txt`.
  4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
  5. Add environment variables: `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`.

