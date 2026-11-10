import json
import sqlite3
import uuid
import hashlib
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sklearn.feature_extraction.text import HashingVectorizer
from app.config import SUPABASE_URL, SUPABASE_KEY, SQLITE_DB_PATH

# 384-dimensional normalized vector generator for pgvector
embedding_hasher = HashingVectorizer(n_features=384, norm='l2')

def generate_embedding_384(text: str) -> List[float]:
    """Generates 384-dimensional normalized vector embedding for Supabase pgvector."""
    try:
        return embedding_hasher.transform([text]).toarray()[0].tolist()
    except Exception:
        return [0.0] * 384

def hash_password(password: str) -> str:
    """Secure password hashing with random salt and SHA-256."""
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256(f"{salt}{password}".encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: Optional[str]) -> bool:
    """Verifies password against stored salt:hash."""
    if not stored_hash or ":" not in stored_hash:
        return False
    salt, hashed = stored_hash.split(":", 1)
    computed = hashlib.sha256(f"{salt}{password}".encode('utf-8')).hexdigest()
    return computed == hashed

# Supabase Client initialization
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[DB] Supabase client initialized.")
    except Exception as e:
        print(f"[DB Notice] Supabase connection: {e}. Using local SQLite database.")
        supabase_client = None


def init_sqlite_db():
    """Initializes clean SQLite schema for local persistence."""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        avatar_url TEXT,
        target_subject TEXT DEFAULT 'General',
        password_hash TEXT,
        exam_name TEXT,
        exam_date TEXT,
        daily_study_hours REAL DEFAULT 2.0,
        prep_duration_days INTEGER DEFAULT 5,
        onboarding_completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    for col_def in [
        "ALTER TABLE students ADD COLUMN target_subject TEXT DEFAULT 'General';",
        "ALTER TABLE students ADD COLUMN password_hash TEXT;",
        "ALTER TABLE students ADD COLUMN exam_name TEXT;",
        "ALTER TABLE students ADD COLUMN exam_date TEXT;",
        "ALTER TABLE students ADD COLUMN daily_study_hours REAL DEFAULT 2.0;",
        "ALTER TABLE students ADD COLUMN prep_duration_days INTEGER DEFAULT 5;",
        "ALTER TABLE students ADD COLUMN onboarding_completed INTEGER DEFAULT 0;",
    ]:
        try:
            cursor.execute(col_def)
        except Exception:
            pass

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        chunk_text TEXT NOT NULL,
        citation TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_materials (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        material_type TEXT NOT NULL,
        source_filename TEXT,
        file_content TEXT,
        chunk_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS topic_maps (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic_data TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diagnostic_quizzes (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        questions TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gap_reports (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        quiz_id TEXT,
        attempt_number INTEGER NOT NULL DEFAULT 1,
        overall_score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        topic_breakdown TEXT NOT NULL,
        weak_topics TEXT NOT NULL,
        medium_topics TEXT NOT NULL,
        strong_topics TEXT NOT NULL,
        doctor_summary TEXT,
        student_answers TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revision_plans (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        gap_report_id TEXT NOT NULL,
        available_days INTEGER NOT NULL DEFAULT 5,
        daily_hours REAL NOT NULL DEFAULT 2.0,
        total_hours REAL NOT NULL DEFAULT 10.0,
        plan_schedule TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        topic TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        citations TEXT,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()


init_sqlite_db()


class DatabaseService:
    """Unified database service supporting Supabase with seamless local SQLite fallback."""

    # 1. Students / Authentication
    @staticmethod
    def register_student(full_name: str, email: str, password: str, target_subject: str = "General Studies") -> Dict[str, Any]:
        email = email.strip().lower()
        full_name = full_name.strip()
        now = datetime.now(timezone.utc).isoformat()
        pwd_hash = hash_password(password)
        student_id = str(uuid.uuid4())
        avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={full_name}"

        # Check existing in Supabase
        if supabase_client:
            try:
                res = supabase_client.table("students").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    raise ValueError("An account with this email address already exists. Please log in.")
                record = {
                    "id": student_id,
                    "email": email,
                    "full_name": full_name,
                    "avatar_url": avatar_url,
                    "target_subject": target_subject,
                    "created_at": now
                }
                insert_res = supabase_client.table("students").insert(record).execute()
                if insert_res.data:
                    return insert_res.data[0]
            except ValueError:
                raise
            except Exception as e:
                print(f"[DB] Supabase register notice: {e}")

        # Check existing in SQLite
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT id FROM students WHERE email = ?", (email,))
        if cur.fetchone():
            conn.close()
            raise ValueError("An account with this email address already exists. Please log in.")

        cur.execute(
            """INSERT INTO students (
                id, email, full_name, avatar_url, target_subject, password_hash,
                daily_study_hours, prep_duration_days, onboarding_completed, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (student_id, email, full_name, avatar_url, target_subject, pwd_hash, 2.0, 5, 0, now)
        )
        conn.commit()
        conn.close()
        return {
            "id": student_id,
            "email": email,
            "full_name": full_name,
            "avatar_url": avatar_url,
            "target_subject": target_subject,
            "daily_study_hours": 2.0,
            "prep_duration_days": 5,
            "onboarding_completed": False,
            "created_at": now
        }

    @staticmethod
    def authenticate_student(email: str, password: Optional[str] = None, full_name: Optional[str] = None) -> Dict[str, Any]:
        email = email.strip().lower()
        
        # 1. Check Supabase
        if supabase_client:
            try:
                res = supabase_client.table("students").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        # 2. Check SQLite
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM students WHERE email = ?", (email,))
        row = cur.fetchone()
        conn.close()

        if row:
            student = dict(row)
            if password and student.get("password_hash"):
                if not verify_password(password, student.get("password_hash")):
                    raise ValueError("Incorrect password. Please verify your credentials.")
            return student

        # If it's a demo account or auto-created student
        return DatabaseService.get_or_create_student(email, full_name or "Student")

    @staticmethod
    def get_student_by_id(student_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("students").select("*").eq("id", student_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def update_student_profile(student_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        clean_data = {k: v for k, v in data.items() if v is not None}
        if supabase_client:
            try:
                supabase_client.table("students").update(clean_data).eq("id", student_id).execute()
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        set_clauses = [f"{k} = ?" for k in clean_data.keys()]
        values = list(clean_data.values()) + [student_id]
        if set_clauses:
            cur.execute(f"UPDATE students SET {', '.join(set_clauses)} WHERE id = ?", values)
            conn.commit()
        conn.close()
        return DatabaseService.get_student_by_id(student_id) or {"id": student_id, **clean_data}

    @staticmethod
    def get_or_create_student(email: str = "student@gapfinder.ai", full_name: str = "Student", target_subject: str = "General") -> Dict[str, Any]:
        email = email.strip() or "student@gapfinder.ai"
        full_name = full_name.strip() or "Student"
        now = datetime.now(timezone.utc).isoformat()

        if supabase_client:
            try:
                res = supabase_client.table("students").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
                new_user = {
                    "id": str(uuid.uuid4()),
                    "email": email,
                    "full_name": full_name,
                    "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={full_name}",
                    "target_subject": target_subject
                }
                insert_res = supabase_client.table("students").insert(new_user).execute()
                if insert_res.data:
                    return insert_res.data[0]
            except Exception:
                pass

        # SQLite fallback
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM students WHERE email = ?", (email,))
        row = cur.fetchone()
        if row:
            student = dict(row)
            conn.close()
            return student

        student_id = str(uuid.uuid4())
        avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={full_name}"
        cur.execute(
            "INSERT INTO students (id, email, full_name, avatar_url, target_subject, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (student_id, email, full_name, avatar_url, target_subject, now)
        )
        conn.commit()
        conn.close()
        return {"id": student_id, "email": email, "full_name": full_name, "avatar_url": avatar_url, "target_subject": target_subject, "created_at": now}

    # 2. Study Materials
    @staticmethod
    def save_study_material(student_id: str, title: str, material_type: str, file_content: str, filename: str = "", chunk_count: int = 0) -> Dict[str, Any]:
        mat_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": mat_id,
            "student_id": student_id,
            "title": title,
            "material_type": material_type,
            "source_filename": filename,
            "file_content": file_content,
            "chunk_count": chunk_count,
            "created_at": now
        }
        if supabase_client:
            try:
                res = supabase_client.table("study_materials").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO study_materials (id, student_id, title, material_type, source_filename, file_content, chunk_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (mat_id, student_id, title, material_type, filename, file_content, chunk_count, now)
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def save_document_chunks(material_id: str, student_id: str, chunks: List[Any]):
        """Saves chunks and generates 384-dim embeddings for pgvector."""
        now = datetime.now(timezone.utc).isoformat()
        if supabase_client:
            try:
                records = []
                for idx, c in enumerate(chunks):
                    emb = generate_embedding_384(c.text)
                    records.append({
                        "id": str(uuid.uuid4()),
                        "material_id": material_id,
                        "student_id": student_id,
                        "chunk_index": idx,
                        "chunk_text": c.text[:4000],
                        "citation": c.citation,
                        "embedding": emb,
                        "created_at": now
                    })
                if records:
                    supabase_client.table("document_chunks").insert(records).execute()
            except Exception as e:
                print(f"[DB Notice] Supabase chunk save: {e}")

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        for idx, c in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO document_chunks (id, material_id, student_id, chunk_index, chunk_text, citation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (chunk_id, material_id, student_id, idx, c.text, c.citation, now)
            )
        conn.commit()
        conn.close()

    @staticmethod
    def delete_study_material(material_id: str, student_id: str) -> bool:
        if supabase_client:
            try:
                supabase_client.table("document_chunks").delete().eq("material_id", material_id).execute()
                supabase_client.table("study_materials").delete().eq("id", material_id).eq("student_id", student_id).execute()
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM document_chunks WHERE material_id = ?", (material_id,))
        cur.execute("DELETE FROM study_materials WHERE id = ? AND student_id = ?", (material_id, student_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def get_study_materials(student_id: str) -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("study_materials").select("id, student_id, title, material_type, source_filename, chunk_count, created_at").eq("student_id", student_id).order("created_at", desc=True).execute()
                if res.data is not None:
                    return res.data
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT id, student_id, title, material_type, source_filename, chunk_count, created_at FROM study_materials WHERE student_id = ? ORDER BY created_at DESC", (student_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_all_materials_content(student_id: str) -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("study_materials").select("*").eq("student_id", student_id).execute()
                if res.data:
                    return res.data
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM study_materials WHERE student_id = ?", (student_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    # 3. Topic Maps
    @staticmethod
    def save_topic_map(student_id: str, subject: str, topic_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        map_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": map_id,
            "student_id": student_id,
            "subject": subject,
            "topic_data": topic_data,
            "created_at": now
        }
        if supabase_client:
            try:
                res = supabase_client.table("topic_maps").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO topic_maps (id, student_id, subject, topic_data, created_at) VALUES (?, ?, ?, ?, ?)",
            (map_id, student_id, subject, json.dumps(topic_data), now)
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def get_latest_topic_map(student_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("topic_maps").select("*").eq("student_id", student_id).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM topic_maps WHERE student_id = ? ORDER BY created_at DESC LIMIT 1", (student_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = dict(row)
            if isinstance(d.get("topic_data"), str):
                d["topic_data"] = json.loads(d["topic_data"])
            return d
        return None

    # 4. Diagnostic Quizzes
    @staticmethod
    def save_quiz(student_id: str, title: str, subject: str, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        quiz_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": quiz_id,
            "student_id": student_id,
            "title": title,
            "subject": subject,
            "questions": questions,
            "created_at": now
        }
        if supabase_client:
            try:
                res = supabase_client.table("diagnostic_quizzes").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO diagnostic_quizzes (id, student_id, title, subject, questions, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (quiz_id, student_id, title, subject, json.dumps(questions), now)
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def get_quiz(quiz_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("diagnostic_quizzes").select("*").eq("id", quiz_id).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM diagnostic_quizzes WHERE id = ?", (quiz_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = dict(row)
            if isinstance(d.get("questions"), str):
                d["questions"] = json.loads(d["questions"])
            return d
        return None

    # 5. Gap Reports
    @staticmethod
    def save_gap_report(
        student_id: str,
        quiz_id: Optional[str],
        overall_score: float,
        total_questions: int,
        correct_count: int,
        topic_breakdown: Dict[str, Any],
        weak_topics: List[str],
        medium_topics: List[str],
        strong_topics: List[str],
        doctor_summary: str,
        student_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        attempt_number = DatabaseService.get_student_attempt_count(student_id) + 1

        record = {
            "id": report_id,
            "student_id": student_id,
            "quiz_id": quiz_id,
            "attempt_number": attempt_number,
            "overall_score": round(overall_score, 2),
            "total_questions": total_questions,
            "correct_count": correct_count,
            "topic_breakdown": topic_breakdown,
            "weak_topics": weak_topics,
            "medium_topics": medium_topics,
            "strong_topics": strong_topics,
            "doctor_summary": doctor_summary,
            "student_answers": student_answers,
            "created_at": now
        }

        if supabase_client:
            try:
                res = supabase_client.table("gap_reports").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO gap_reports (
                id, student_id, quiz_id, attempt_number, overall_score, total_questions,
                correct_count, topic_breakdown, weak_topics, medium_topics, strong_topics,
                doctor_summary, student_answers, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                report_id, student_id, quiz_id, attempt_number, round(overall_score, 2), total_questions,
                correct_count, json.dumps(topic_breakdown), json.dumps(weak_topics), json.dumps(medium_topics),
                json.dumps(strong_topics), doctor_summary, json.dumps(student_answers), now
            )
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def get_student_attempt_count(student_id: str) -> int:
        if supabase_client:
            try:
                res = supabase_client.table("gap_reports").select("id", count="exact").eq("student_id", student_id).execute()
                if res.count is not None:
                    return res.count
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM gap_reports WHERE student_id = ?", (student_id,))
        count = cur.fetchone()[0]
        conn.close()
        return count

    @staticmethod
    def get_latest_gap_report(student_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("gap_reports").select("*").eq("student_id", student_id).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM gap_reports WHERE student_id = ? ORDER BY created_at DESC LIMIT 1", (student_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = dict(row)
            for k in ["topic_breakdown", "weak_topics", "medium_topics", "strong_topics", "student_answers"]:
                if isinstance(d.get(k), str):
                    d[k] = json.loads(d[k])
            return d
        return None

    @staticmethod
    def get_all_gap_reports(student_id: str) -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("gap_reports").select("*").eq("student_id", student_id).order("attempt_number", desc=False).execute()
                if res.data is not None:
                    return res.data
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM gap_reports WHERE student_id = ? ORDER BY attempt_number ASC", (student_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        for d in rows:
            for k in ["topic_breakdown", "weak_topics", "medium_topics", "strong_topics", "student_answers"]:
                if isinstance(d.get(k), str):
                    d[k] = json.loads(d[k])
        return rows

    # 6. Revision Plans
    @staticmethod
    def save_revision_plan(
        student_id: str,
        gap_report_id: str,
        available_days: int,
        daily_hours: float,
        total_hours: float,
        plan_schedule: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        plan_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": plan_id,
            "student_id": student_id,
            "gap_report_id": gap_report_id,
            "available_days": available_days,
            "daily_hours": daily_hours,
            "total_hours": total_hours,
            "plan_schedule": plan_schedule,
            "status": "active",
            "created_at": now
        }

        if supabase_client:
            try:
                supabase_client.table("revision_plans").update({"status": "updated"}).eq("student_id", student_id).execute()
                res = supabase_client.table("revision_plans").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE revision_plans SET status = 'updated' WHERE student_id = ?", (student_id,))
        cur.execute(
            """INSERT INTO revision_plans (
                id, student_id, gap_report_id, available_days, daily_hours, total_hours, plan_schedule, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (plan_id, student_id, gap_report_id, available_days, daily_hours, total_hours, json.dumps(plan_schedule), "active", now)
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def get_latest_revision_plan(student_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("revision_plans").select("*").eq("student_id", student_id).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM revision_plans WHERE student_id = ? ORDER BY created_at DESC LIMIT 1", (student_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = dict(row)
            if isinstance(d.get("plan_schedule"), str):
                d["plan_schedule"] = json.loads(d["plan_schedule"])
            return d
        return None

    @staticmethod
    def toggle_revision_task(student_id: str, plan_id: str, day_number: int, task_index: int, completed: bool) -> Optional[Dict[str, Any]]:
        plan = DatabaseService.get_latest_revision_plan(student_id)
        if not plan:
            return None
        schedule = plan.get("plan_schedule", [])
        for day in schedule:
            if day.get("day_number") == day_number:
                tasks = day.get("tasks", [])
                if 0 <= task_index < len(tasks):
                    tasks[task_index]["completed"] = completed

        if supabase_client:
            try:
                supabase_client.table("revision_plans").update({"plan_schedule": schedule}).eq("id", plan["id"]).execute()
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE revision_plans SET plan_schedule = ? WHERE id = ?", (json.dumps(schedule), plan["id"]))
        conn.commit()
        conn.close()
        plan["plan_schedule"] = schedule
        return plan

    # 7. Chat Messages
    @staticmethod
    def save_chat_message(student_id: str, role: str, content: str, topic: Optional[str] = None, citations: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": msg_id,
            "student_id": student_id,
            "topic": topic,
            "role": role,
            "content": content,
            "citations": citations or [],
            "created_at": now
        }
        if supabase_client:
            try:
                res = supabase_client.table("chat_messages").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_messages (id, student_id, topic, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (msg_id, student_id, topic, role, content, json.dumps(citations or []), now)
        )
        conn.commit()
        conn.close()
        return record

    @staticmethod
    def get_chat_history(student_id: str, limit: int = 25) -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("chat_messages").select("*").eq("student_id", student_id).order("created_at", desc=False).limit(limit).execute()
                if res.data is not None:
                    return res.data
            except Exception:
                pass

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM chat_messages WHERE student_id = ? ORDER BY created_at ASC LIMIT ?", (student_id, limit))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        for d in rows:
            if isinstance(d.get("citations"), str):
                d["citations"] = json.loads(d["citations"])
        return rows
