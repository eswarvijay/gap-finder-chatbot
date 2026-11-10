import json
import re
from typing import List, Dict, Any, Optional
from app.config import GROQ_API_KEY, GROQ_MODEL

# Groq Client Initialization
groq_client = None
active_model = GROQ_MODEL

if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        
        # Verify and auto-resolve available chat model
        available_models = [m.id for m in groq_client.models.list().data]
        if GROQ_MODEL in available_models:
            active_model = GROQ_MODEL
        elif "openai/gpt-oss-120b" in available_models:
            active_model = "openai/gpt-oss-120b"
        elif "qwen/qwen3.8-27b" in available_models:
            active_model = "qwen/qwen3.8-27b"
        elif "llama-3.3-70b-versatile" in available_models:
            active_model = "llama-3.3-70b-versatile"
        elif available_models:
            active_model = available_models[0]
            
        print(f"[AI Service] Groq initialized. Active model: '{active_model}'. Available models: {available_models}")
    except Exception as e:
        print(f"[AI Service Warning] Failed to initialize Groq client: {e}.")


def extract_json_from_text(text: str) -> Any:
    """Safely extracts JSON from LLM text that might have markdown code blocks or conversational wrappers."""
    text = text.strip()
    
    # Try direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try extracting inside ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass

    # Try finding first [ or { to matching ] or }
    match_obj = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
    if match_obj:
        try:
            return json.loads(match_obj.group(1).strip())
        except Exception:
            pass

    raise ValueError(f"Could not extract valid JSON from response: {text[:200]}...")


class AIService:
    """Handles all AI generation tasks using Groq with structured outputs and intelligent conversational assistance."""

    @staticmethod
    def _call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        """Invokes Groq LLM with system and user prompts."""
        if not groq_client:
            raise ValueError("Groq API key not configured or client failed to connect.")

        completion = groq_client.chat.completions.create(
            model=active_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return completion.choices[0].message.content or ""

    # =========================================================================
    # 1. TOPIC MAP EXTRACTION
    # =========================================================================
    @staticmethod
    def generate_topic_map(syllabus_text: str, past_papers_text: str, subject: str = "General Studies") -> List[Dict[str, Any]]:
        """Extracts structured topics, subtopics, and exam weightage linking past papers."""
        system_prompt = """You are an expert curriculum analyzer.
Extract the syllabus topics and correlate with past question papers.
You MUST output ONLY a valid JSON array of topics with this exact structure:
[
  {
    "id": "topic_1",
    "name": "Topic Name",
    "description": "Concise summary of key concepts",
    "subtopics": ["Subtopic A", "Subtopic B", "Subtopic C"],
    "exam_frequency": 3,
    "exam_weightage_pct": 25.0,
    "importance": "High",
    "source_citation": "Unit / Chapter citation"
  }
]
Output strictly raw JSON without explanations."""

        user_prompt = f"""Subject: {subject}

SYLLABUS CONTENT:
{syllabus_text[:5000]}

PAST EXAM PAPERS / QUESTIONS:
{past_papers_text[:5000]}

Generate the JSON array of topics now:"""

        if groq_client:
            try:
                res = AIService._call_groq(system_prompt, user_prompt, temperature=0.1)
                data = extract_json_from_text(res)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "topics" in data:
                    return data["topics"]
            except Exception as e:
                print(f"[Groq topic map error] {e}")

        # Fallback only if Groq is offline
        return [
            {
                "id": "topic_1",
                "name": f"{subject} Core Concepts",
                "description": "Fundamental definitions, laws, and principles",
                "subtopics": ["Definitions & Axioms", "Primary Derivations", "Formulas"],
                "exam_frequency": 4,
                "exam_weightage_pct": 40.0,
                "importance": "High",
                "source_citation": "Module 1"
            },
            {
                "id": "topic_2",
                "name": f"{subject} Applied Problem Solving",
                "description": "Calculations, algorithms, and practical applications",
                "subtopics": ["Numerical Problems", "Edge Cases", "Analytical Questions"],
                "exam_frequency": 3,
                "exam_weightage_pct": 35.0,
                "importance": "High",
                "source_citation": "Module 2"
            },
            {
                "id": "topic_3",
                "name": f"{subject} Advanced Applications",
                "description": "Case studies, comparative analysis, and integrations",
                "subtopics": ["Trade-offs", "Real-world Architectures", "Optimizations"],
                "exam_frequency": 2,
                "exam_weightage_pct": 25.0,
                "importance": "Medium",
                "source_citation": "Module 3"
            }
        ]

    # =========================================================================
    # 2. GROUNDED DIAGNOSTIC QUIZ GENERATION
    # =========================================================================
    @staticmethod
    def generate_diagnostic_quiz(retrieved_chunks: List[Dict[str, Any]], num_questions: int = 5, subject: str = "General Studies") -> List[Dict[str, Any]]:
        """Generates diagnostic multiple choice questions grounded strictly in retrieved chunks with citations."""
        system_prompt = """You are a diagnostic test creator.
Generate diagnostic multiple-choice questions grounded in the provided study material.
MANDATORY RULES:
1. Every question must be grounded in the provided excerpts.
2. Every question must include a 'source_citation' string pointing to the chapter or section.
3. Every question must have 4 options, the 0-based index of the correct option, and a clear explanation.
4. Output ONLY a valid JSON array of questions:
[
  {
    "id": "q1",
    "topic": "Topic Name",
    "subtopic": "Subtopic Name",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option_index": 2,
    "explanation": "Detailed explanation of why Option C is correct and others are wrong.",
    "source_citation": "Chapter / Section Name",
    "difficulty": "Medium"
  }
]
Output strictly raw JSON."""

        context_str = ""
        for idx, chunk in enumerate(retrieved_chunks):
            context_str += f"\n--- EXCERPT {idx+1} [Citation: {chunk.get('citation', 'Notes')}] ---\n{chunk.get('text', '')}\n"

        user_prompt = f"""Subject: {subject}
Generate {num_questions} grounded diagnostic multiple-choice questions using these source materials:

{context_str[:6000]}

Generate the JSON array of questions now:"""

        if groq_client:
            try:
                res = AIService._call_groq(system_prompt, user_prompt, temperature=0.2)
                data = extract_json_from_text(res)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "questions" in data:
                    return data["questions"]
            except Exception as e:
                print(f"[Groq quiz error] {e}")

        # Fallback questions
        return [
            {
                "id": "q_diag_1",
                "topic": "Core Fundamentals",
                "subtopic": "Key Principles",
                "question": f"In {subject}, which of the following is considered the primary guiding principle based on your study material?",
                "options": [
                    "Static allocation without dynamic adaptation",
                    "Minimizing resource contention while ensuring consistency",
                    "Ignoring edge cases during high load",
                    "Sequential processing only"
                ],
                "correct_option_index": 1,
                "explanation": "Based on foundational principles, optimizing resource utilization while maintaining consistency is essential.",
                "source_citation": "Module 1 - Fundamentals",
                "difficulty": "Medium"
            }
        ]

    # =========================================================================
    # 3. ANSWER EVALUATION & GAP DIAGNOSIS ("DOCTOR FOR STUDYING")
    # =========================================================================
    @staticmethod
    def evaluate_quiz_and_diagnose(
        questions: List[Dict[str, Any]],
        student_answers: List[Dict[str, int]]
    ) -> Dict[str, Any]:
        """Evaluates answers and generates the mandatory Gap Report (Weak 🔴, Medium 🟡, Strong 🟢) with reasons."""
        ans_map = {a.get("question_id"): a.get("selected_option_index") for a in student_answers}

        total_questions = len(questions)
        correct_count = 0
        evaluated_items = []
        topic_stats: Dict[str, Dict[str, Any]] = {}

        for q in questions:
            qid = q.get("id")
            selected = ans_map.get(qid)
            correct_idx = q.get("correct_option_index", 0)
            is_correct = (selected == correct_idx)
            if is_correct:
                correct_count += 1

            topic = q.get("topic", "General")
            if topic not in topic_stats:
                topic_stats[topic] = {
                    "total": 0,
                    "correct": 0,
                    "incorrect_subtopics": [],
                    "citations": []
                }
            topic_stats[topic]["total"] += 1
            if is_correct:
                topic_stats[topic]["correct"] += 1
            else:
                sub = q.get("subtopic") or q.get("question")[:40]
                topic_stats[topic]["incorrect_subtopics"].append(sub)
                topic_stats[topic]["citations"].append(q.get("source_citation", ""))

            evaluated_items.append({
                "question_id": qid,
                "question": q.get("question"),
                "selected_option_index": selected,
                "selected_option_text": q.get("options", [])[selected] if selected is not None and selected < len(q.get("options", [])) else "Unanswered",
                "correct_option_index": correct_idx,
                "correct_option_text": q.get("options", [])[correct_idx] if correct_idx < len(q.get("options", [])) else "",
                "is_correct": is_correct,
                "explanation": q.get("explanation"),
                "source_citation": q.get("source_citation"),
                "topic": topic
            })

        overall_score = (correct_count / total_questions * 100.0) if total_questions > 0 else 0.0

        # Categorize: 🔴 Weak (< 50%), 🟡 Medium (50% - 79%), 🟢 Strong (>= 80%)
        topic_breakdown: Dict[str, Any] = {}
        weak_topics: List[str] = []
        medium_topics: List[str] = []
        strong_topics: List[str] = []

        for topic, stats in topic_stats.items():
            tot = stats["total"]
            corr = stats["correct"]
            score = (corr / tot * 100.0) if tot > 0 else 0.0

            if score < 50.0:
                status = "weak"
                weak_topics.append(topic)
                inc_str = ", ".join(set(stats["incorrect_subtopics"])) if stats["incorrect_subtopics"] else "fundamental concepts"
                reason = f"You got {tot - corr} of {tot} questions wrong, primarily on {inc_str}."
                recommended_focus = f"High Priority: Re-read {stats['citations'][0] if stats['citations'] else 'the chapter notes'} and practice problem variations."
            elif score < 80.0:
                status = "medium"
                medium_topics.append(topic)
                inc_str = ", ".join(set(stats["incorrect_subtopics"])) if stats["incorrect_subtopics"] else "edge cases"
                reason = f"Partially understood ({corr}/{tot} correct). Missed conceptual edge-cases on {inc_str}."
                recommended_focus = "Moderate Priority: Quick review of formulas and key distinctions."
            else:
                status = "strong"
                strong_topics.append(topic)
                reason = f"Excellent mastery ({corr}/{tot} correct). Concepts are well understood."
                recommended_focus = "Low Priority: Maintain through periodic spaced review."

            topic_breakdown[topic] = {
                "status": status,
                "score": round(score, 1),
                "total_questions": tot,
                "correct_questions": corr,
                "reason": reason,
                "recommended_focus": recommended_focus
            }

        # Dynamic Doctor Summary using Groq
        doctor_summary = ""
        if groq_client:
            try:
                doc_prompt = f"""As an expert diagnostic study doctor, synthesize a 2-sentence clinical diagnosis for a student who scored {overall_score:.0f}%.
Weak topics: {weak_topics}
Medium topics: {medium_topics}
Strong topics: {strong_topics}
Give an encouraging, direct diagnosis focusing on what they must fix first."""
                doctor_summary = AIService._call_groq("You are a supportive, precise diagnostic tutor.", doc_prompt, temperature=0.3)
            except Exception:
                pass

        if not doctor_summary:
            if weak_topics:
                doctor_summary = f"Diagnosis: Critical conceptual gaps detected in {len(weak_topics)} topic(s): {', '.join(weak_topics)}. While your foundation in other areas is steady, your revision should prioritize these weak spots first."
            else:
                doctor_summary = f"Diagnosis: Strong overall understanding ({overall_score:.0f}% score). Ready for advanced exam practice!"

        return {
            "overall_score": round(overall_score, 1),
            "total_questions": total_questions,
            "correct_count": correct_count,
            "topic_breakdown": topic_breakdown,
            "weak_topics": weak_topics,
            "medium_topics": medium_topics,
            "strong_topics": strong_topics,
            "doctor_summary": doctor_summary.strip(),
            "student_answers": evaluated_items
        }

    # =========================================================================
    # 4. PERSONALIZED ADAPTIVE REVISION PLANNER
    # =========================================================================
    @staticmethod
    def generate_revision_plan(
        gap_report: Dict[str, Any],
        topic_map: Optional[List[Dict[str, Any]]],
        available_days: int = 5,
        daily_hours: float = 2.0
    ) -> List[Dict[str, Any]]:
        """Creates an actionable revision plan ordered by: Weakest Topics + Highest Exam Weightage first."""
        ranked_topics = []
        breakdown = gap_report.get("topic_breakdown", {})
        
        weight_map = {t.get("name"): t.get("exam_weightage_pct", 15.0) for t in (topic_map or [])}

        for topic_name, data in breakdown.items():
            score = data.get("score", 50.0)
            weight = weight_map.get(topic_name, 20.0)
            priority_score = (100 - score) * 0.6 + weight * 0.4
            ranked_topics.append({
                "topic": topic_name,
                "status": data.get("status"),
                "score": score,
                "weight": weight,
                "priority_score": priority_score,
                "reason": data.get("reason"),
                "recommended_focus": data.get("recommended_focus")
            })

        ranked_topics.sort(key=lambda x: x["priority_score"], reverse=True)

        plan_schedule = []
        for day in range(1, available_days + 1):
            day_tasks = []
            if day == 1 and ranked_topics:
                top = ranked_topics[0]
                day_tasks.append({
                    "time_allocation": f"{daily_hours:.1f} hrs",
                    "topic": top["topic"],
                    "priority": "CRITICAL (🔴 Weakest High-Yield Topic)",
                    "action": f"Deep Dive Revision: {top['recommended_focus']}",
                    "milestone": f"Master core mechanisms and solve 3 previous exam questions on {top['topic']}."
                })
            elif day == 2 and len(ranked_topics) > 1:
                second = ranked_topics[1]
                day_tasks.append({
                    "time_allocation": f"{daily_hours:.1f} hrs",
                    "topic": second["topic"],
                    "priority": f"HIGH ({'🔴 Weak' if second['status'] == 'weak' else '🟡 Medium'})",
                    "action": f"Focused Study: {second['recommended_focus']}",
                    "milestone": f"Review problem variations and edge cases for {second['topic']}."
                })
            elif day < available_days:
                target = ranked_topics[min(day - 1, len(ranked_topics) - 1)] if ranked_topics else {"topic": "General Revision", "recommended_focus": "Review notes"}
                day_tasks.append({
                    "time_allocation": f"{daily_hours * 0.7:.1f} hrs",
                    "topic": target["topic"],
                    "priority": "MEDIUM (🟡 Reinforcement)",
                    "action": f"Review & Practice: {target['recommended_focus']}",
                    "milestone": "Solve timed practice questions."
                })
                day_tasks.append({
                    "time_allocation": f"{daily_hours * 0.3:.1f} hrs",
                    "topic": "Spaced Recall",
                    "priority": "RETENTION",
                    "action": "Quick 20-min active recall check of previous days' weak spots.",
                    "milestone": "Ensure retention without regression."
                })
            else:
                day_tasks.append({
                    "time_allocation": f"{daily_hours * 0.6:.1f} hrs",
                    "topic": "Diagnostic Retest",
                    "priority": "VERIFICATION",
                    "action": "Take Retest in GapFinder AI to verify weak areas have transitioned to 🟡 or 🟢.",
                    "milestone": "Verify improvement across attempts in Progress Dashboard."
                })
                day_tasks.append({
                    "time_allocation": f"{daily_hours * 0.4:.1f} hrs",
                    "topic": "Final Polish",
                    "priority": "CONFIDENCE (🟢 Strong)",
                    "action": "High-level summary formula skim.",
                    "milestone": "Exam ready with zero remaining blindspots."
                })

            plan_schedule.append({
                "day_number": day,
                "title": f"Day {day} Revision Schedule",
                "total_hours": daily_hours,
                "tasks": day_tasks
            })

        return plan_schedule

    # =========================================================================
    # 5. CONVERSATIONAL STUDY DOCTOR CHATBOT (RAG + INTENT ROUTING)
    # =========================================================================
    @staticmethod
    def chat_with_tutor(
        user_message: str,
        retrieved_chunks: List[Dict[str, Any]],
        chat_history: List[Dict[str, str]] = None,
        student_name: str = "Student",
        latest_gap_report: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Conversational Study Doctor Chatbot.
        Can answer questions, run quizzes, diagnose weaknesses, explain concepts with citations,
        and provide tailored pedagogical advice.
        """
        citations = []
        for c in retrieved_chunks:
            citations.append({
                "source_title": c.get("source_title", "Uploaded Material"),
                "citation": c.get("citation", "Document Chunk"),
                "snippet": c.get("text", "")[:250] + "..."
            })

        # Format context excerpts
        context_str = ""
        for idx, chunk in enumerate(retrieved_chunks):
            context_str += f"\n--- EXCERPT {idx+1} [Citation: {chunk.get('citation', '')}] ---\n{chunk.get('text', '')}\n"

        diagnosis_context = ""
        if latest_gap_report:
            diagnosis_context = f"\nSTUDENT'S LATEST DIAGNOSIS:\n- Score: {latest_gap_report.get('overall_score')}%\n- Weak Topics: {latest_gap_report.get('weak_topics')}\n- Medium Topics: {latest_gap_report.get('medium_topics')}\n- Strong Topics: {latest_gap_report.get('strong_topics')}\n"

        system_prompt = f"""You are GapFinder AI — a personalized 'Doctor for Studying' and intelligent diagnostic tutor.
You are helping {student_name}.
{diagnosis_context}
YOUR CORE PRINCIPLES:
1. When explaining topics, ground your answers in the provided study material excerpts. Always mention the source citation (e.g. '[Source: Chapter X, Section Y]').
2. If the student asks you to test them or quiz them, generate a clear conceptual question.
3. If the student asks about their weak spots or gaps, explain their diagnostic status kindly and give a treatment recommendation.
4. If the student asks general study questions or greets you, be engaging, sharp, encouraging, and ask what they would like to diagnose today.
5. Keep explanations structured with markdown bullet points, clear bold headings, and concrete takeaways.
6. If a specific technical fact is missing from the provided excerpts, state what is in the material and advise them to upload the relevant chapter.
"""

        messages_payload = [{"role": "system", "content": system_prompt}]
        
        # Add past 4 messages for context
        if chat_history:
            for m in chat_history[-4:]:
                messages_payload.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        # Add current user prompt with injected context
        augmented_prompt = f"""{user_message}

AVAILABLE SOURCE MATERIAL EXCERPTS:
{context_str if context_str.strip() else 'No specific material uploaded yet.'}
"""
        messages_payload.append({"role": "user", "content": augmented_prompt})

        if groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model=active_model,
                    messages=messages_payload,
                    temperature=0.3
                )
                answer = completion.choices[0].message.content or ""
                return {
                    "answer": answer,
                    "citations": citations,
                    "retrieval_used": len(retrieved_chunks) > 0,
                    "model_used": active_model
                }
            except Exception as e:
                print(f"[Groq chat error] {e}")

        # Fallback if offline
        best_chunk = retrieved_chunks[0] if retrieved_chunks else None
        if best_chunk:
            answer = f"Based on your study notes ({best_chunk.get('citation', 'Notes')}):\n\n{best_chunk.get('text', '')}"
        else:
            answer = f"Hello {student_name}! I am your GapFinder AI Study Assistant. I'm ready to test you on any syllabus, diagnose your knowledge gaps, or explain difficult concepts. What would you like to explore?"

        return {
            "answer": answer,
            "citations": citations,
            "retrieval_used": len(retrieved_chunks) > 0,
            "model_used": active_model
        }
