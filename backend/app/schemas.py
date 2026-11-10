from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str = Field(default="demo.student@gapfinder.ai")
    password: Optional[str] = None
    full_name: Optional[str] = "Alex Mercer (Demo Student)"


class OnboardingRequest(BaseModel):
    student_id: str
    target_subject: str = "General Studies"
    exam_name: Optional[str] = None
    exam_date: Optional[str] = None
    daily_study_hours: float = 2.0
    prep_duration_days: int = 5


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_subject: Optional[str] = None
    exam_name: Optional[str] = None
    exam_date: Optional[str] = None
    daily_study_hours: Optional[float] = None
    prep_duration_days: Optional[int] = None


class ToggleTaskRequest(BaseModel):
    student_id: str
    plan_id: str
    day_number: int
    task_index: int
    completed: bool


class StudentResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    target_subject: Optional[str] = "General"
    exam_name: Optional[str] = None
    exam_date: Optional[str] = None
    daily_study_hours: Optional[float] = 2.0
    prep_duration_days: Optional[int] = 5
    onboarding_completed: Optional[bool] = False
    created_at: str


class TextMaterialUploadRequest(BaseModel):
    student_id: str
    title: str
    material_type: str  # syllabus | notes | past_paper
    content: str
    filename: Optional[str] = None


class SubtopicItem(BaseModel):
    name: str
    key_points: List[str] = []


class TopicMapItem(BaseModel):
    id: str
    name: str
    description: str
    subtopics: List[str] = []
    exam_frequency: int = 1  # How often this appears in past papers
    exam_weightage_pct: float = 10.0  # Weight in exams
    importance: str = "Medium"  # High | Medium | Low
    source_citation: Optional[str] = None


class TopicMapGenerateRequest(BaseModel):
    student_id: str
    subject: Optional[str] = "Operating Systems"


class QuizQuestion(BaseModel):
    id: str
    topic: str
    subtopic: Optional[str] = None
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    source_citation: str  # e.g. "Chapter 3, Section 2 - Page Replacement Algorithms"
    difficulty: str = "Medium"  # Easy | Medium | Hard


class QuizGenerateRequest(BaseModel):
    student_id: str
    num_questions: int = 6
    subject: Optional[str] = "Operating Systems"
    focus_topic: Optional[str] = None


class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_index: int


class QuizSubmitRequest(BaseModel):
    student_id: str
    quiz_id: Optional[str] = None
    answers: List[AnswerSubmission]


class TopicDiagnosis(BaseModel):
    status: str  # weak | medium | strong
    score: float
    total_questions: int
    correct_questions: int
    reason: str
    recommended_focus: str


class GapReportResponse(BaseModel):
    id: str
    student_id: str
    attempt_number: int
    overall_score: float
    total_questions: int
    correct_count: int
    topic_breakdown: Dict[str, TopicDiagnosis]
    weak_topics: List[str]
    medium_topics: List[str]
    strong_topics: List[str]
    doctor_summary: str
    created_at: str


class PlanGenerateRequest(BaseModel):
    student_id: str
    available_days: int = 5
    daily_hours: float = 2.0


class ChatRequest(BaseModel):
    student_id: str
    message: str
    topic: Optional[str] = None

