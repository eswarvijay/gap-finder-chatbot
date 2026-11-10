-- =================================================================
-- GapFinder AI - Complete Supabase PostgreSQL & pgvector Schema
-- Project URL: https://supabase.com/dashboard/project/ltjbvubehlxisschptlb/sql/new
-- =================================================================

-- 1. Enable Required Extensions (UUID & pgvector)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Students & Profile Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    target_subject TEXT DEFAULT 'General Studies',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Study Materials (Syllabus, Notes, Past Exam Papers)
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    material_type TEXT NOT NULL CHECK (material_type IN ('syllabus', 'notes', 'past_paper')),
    source_filename TEXT,
    file_content TEXT,
    chunk_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Document Chunks & Vector Store (pgvector for Semantic RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    citation TEXT NOT NULL,
    embedding vector(384), -- 384-dim semantic vector embedding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Extracted Topic Maps (Curriculum structure & exam weightages)
CREATE TABLE IF NOT EXISTS public.topic_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Diagnostic Quizzes & Questions (With source citations)
CREATE TABLE IF NOT EXISTS public.diagnostic_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Gap Reports (Doctor's Diagnosis: 🔴 Weak, 🟡 Medium, 🟢 Strong)
CREATE TABLE IF NOT EXISTS public.gap_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.diagnostic_quizzes(id) ON DELETE SET NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    overall_score NUMERIC(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    topic_breakdown JSONB NOT NULL,
    weak_topics JSONB DEFAULT '[]'::JSONB,
    medium_topics JSONB DEFAULT '[]'::JSONB,
    strong_topics JSONB DEFAULT '[]'::JSONB,
    doctor_summary TEXT,
    student_answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Personalized Adaptive Revision Plans
CREATE TABLE IF NOT EXISTS public.revision_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    gap_report_id UUID REFERENCES public.gap_reports(id) ON DELETE CASCADE,
    available_days INT NOT NULL DEFAULT 5,
    daily_hours NUMERIC(4,1) NOT NULL DEFAULT 2.0,
    total_hours NUMERIC(5,1) NOT NULL DEFAULT 10.0,
    plan_schedule JSONB NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'updated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. "Explain This Topic" Chat Messages & In-Chat History
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    topic TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_materials_student ON public.study_materials(student_id);
CREATE INDEX IF NOT EXISTS idx_chunks_material ON public.document_chunks(material_id);
CREATE INDEX IF NOT EXISTS idx_gap_reports_student ON public.gap_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_revision_plans_student ON public.revision_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_student ON public.chat_messages(student_id);

-- 11. Vector Semantic Match Function for pgvector RAG
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_student_id uuid
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  citation text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.chunk_text,
    dc.citation,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.student_id = filter_student_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 12. Enable Open RLS Access for Client/Publishable Key
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_maps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
