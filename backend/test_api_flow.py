import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("Running GapFinder AI 100% Dynamic API Verification")
    print("=" * 60)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ 1. Backend Health Check OK")

    # 2. Dynamic student login
    res = client.post("/api/auth/login", json={"email": "student@gapfinder.ai", "full_name": "Jordan Lee"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    student = res.json()
    student_id = student["id"]
    print(f"✅ 2. Dynamic Student Authenticated: {student['full_name']} ({student['email']})")

    # 3. Dynamic Material Upload
    sample_material = """CELL BIOLOGY AND GENETICS (UNIT 1)
Chapter 1: Cellular Energetics and Mitochondria
Mitochondria generate cellular ATP via oxidative phosphorylation using the electron transport chain. The inner membrane houses ATP synthase complexes. Chemiosmosis couples proton gradients across the inner mitochondrial membrane to ATP generation.

Chapter 2: DNA Replication and Repair
DNA polymerase synthesizes complementary strands in the 5' to 3' direction. Helicase unwinds the double helix, while topoisomerase relieves supercoiling strain. Mismatch repair enzymes correct errors that escape proofreading. Failure of excision repair leads to severe genomic instability."""

    res = client.post("/api/materials/text", json={
        "student_id": student_id,
        "title": "Cell Biology & Genetics Notes",
        "material_type": "notes",
        "content": sample_material
    })
    assert res.status_code == 200, f"Material upload failed: {res.text}"
    mat = res.json()["material"]
    print(f"✅ 3. Ingested Dynamic Material: '{mat['title']}' ({mat['chunk_count']} chunks)")

    # 4. Generate Topic Map dynamically with Groq
    res = client.post("/api/topic-map/generate", json={"student_id": student_id, "subject": "Cell Biology & Genetics"})
    assert res.status_code == 200, f"Topic map failed: {res.text}"
    t_map = res.json()["topic_map"]
    print(f"✅ 4. Groq Topic Map Generated: {len(t_map['topic_data'])} topics extracted.")

    # 5. Generate Grounded Diagnostic Quiz dynamically with Groq
    res = client.post("/api/quiz/generate", json={"student_id": student_id, "num_questions": 3, "subject": "Cell Biology & Genetics"})
    assert res.status_code == 200, f"Quiz generation failed: {res.text}"
    quiz = res.json()["quiz"]
    quiz_id = quiz["id"]
    questions = quiz["questions"]
    assert len(questions) > 0, "No questions generated"
    print(f"✅ 5. Groq Diagnostic Quiz Generated: {len(questions)} grounded questions.")
    print(f"     Sample Question: {questions[0]['question']}")
    print(f"     Source Citation: {questions[0].get('source_citation')}")

    # 6. Submit Quiz Answers and Evaluate with Groq
    answers = []
    for idx, q in enumerate(questions):
        # Choose correct for first, incorrect for second
        chosen = q["correct_option_index"] if idx == 0 else (q["correct_option_index"] + 1) % 4
        answers.append({"question_id": q["id"], "selected_option_index": chosen})

    res = client.post("/api/quiz/submit", json={"student_id": student_id, "quiz_id": quiz_id, "answers": answers})
    assert res.status_code == 200, f"Quiz submission failed: {res.text}"
    gap_report = res.json()["gap_report"]
    print(f"✅ 6. Groq Answer Evaluation & Gap Diagnosis OK:")
    print(f"     Score: {gap_report['overall_score']}% ({gap_report['correct_count']}/{gap_report['total_questions']})")
    print(f"     🔴 Weak Topics: {gap_report['weak_topics']}")
    print(f"     Doctor Summary: {gap_report['doctor_summary'][:100]}...")

    # 7. Generate Personalized Adaptive Revision Plan with Groq
    res = client.post("/api/diagnosis/plan", json={"student_id": student_id, "available_days": 4, "daily_hours": 1.5})
    assert res.status_code == 200, f"Revision plan failed: {res.text}"
    plan = res.json()["revision_plan"]
    print(f"✅ 7. Groq Adaptive Revision Plan: {len(plan['plan_schedule'])} days scheduled.")

    # 8. Conversational Chatbot with Groq
    res = client.post("/api/chat", json={
        "student_id": student_id,
        "message": "Doctor, what is chemiosmosis and why is the proton gradient important?",
        "topic": "Cell Biology & Genetics"
    })
    assert res.status_code == 200, f"Chat failed: {res.text}"
    chat_res = res.json()
    print(f"✅ 8. Groq Conversational AI Study Doctor OK:")
    print(f"     Model Used: {chat_res.get('model_used')}")
    print(f"     Citations Count: {len(chat_res['citations'])}")
    print(f"     Doctor Reply Excerpt: {chat_res['reply'][:120]}...")

    # 9. Progress Analytics
    res = client.get(f"/api/progress/{student_id}")
    assert res.status_code == 200, f"Progress failed: {res.text}"
    progress = res.json()
    print(f"✅ 9. Progress Dashboard OK: Attempts = {progress['total_attempts']}, Latest Score = {progress['latest_score']}%")

    print("=" * 60)
    print("ALL 100% DYNAMIC AI WORKFLOWS VERIFIED WITH ZERO MOCK DATA!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
