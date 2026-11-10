export interface Student {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  target_subject?: string;
  exam_name?: string;
  exam_date?: string;
  daily_study_hours?: number;
  prep_duration_days?: number;
  onboarding_completed?: boolean;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  student_id: string;
  title: string;
  material_type: 'syllabus' | 'notes' | 'past_paper';
  source_filename?: string;
  chunk_count: number;
  created_at: string;
}

export interface TopicMapItem {
  id: string;
  name: string;
  description: string;
  subtopics: string[];
  exam_frequency: number;
  exam_weightage_pct: number;
  importance: 'High' | 'Medium' | 'Low';
  source_citation?: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  question: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
  source_citation: string;
  difficulty?: string;
  question_type?: string;
}

export interface Quiz {
  id: string;
  student_id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface EvaluatedAnswer {
  question_id: string;
  question: string;
  selected_option_index: number;
  selected_option_text: string;
  correct_option_index: number;
  correct_option_text: string;
  is_correct: boolean;
  explanation: string;
  source_citation: string;
  topic: string;
}

export interface TopicDiagnosis {
  status: 'weak' | 'medium' | 'strong';
  score: number;
  total_questions: number;
  correct_questions: number;
  reason: string;
  recommended_focus: string;
}

export interface GapReport {
  id: string;
  student_id: string;
  quiz_id?: string;
  attempt_number: number;
  overall_score: number;
  total_questions: number;
  correct_count: number;
  topic_breakdown: Record<string, TopicDiagnosis>;
  weak_topics: string[];
  medium_topics: string[];
  strong_topics: string[];
  doctor_summary: string;
  student_answers: EvaluatedAnswer[];
  created_at: string;
}

export interface RevisionPlanTask {
  time_allocation: string;
  topic: string;
  priority: string;
  action: string;
  milestone: string;
  completed?: boolean;
}

export interface RevisionPlanDay {
  day_number: number;
  title: string;
  total_hours: number;
  tasks: RevisionPlanTask[];
}

export interface RevisionPlan {
  id: string;
  student_id: string;
  gap_report_id: string;
  available_days: number;
  daily_hours: number;
  total_hours: number;
  plan_schedule: RevisionPlanDay[];
  status: string;
  created_at: string;
}

export interface Citation {
  source_title: string;
  citation: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  student_id: string;
  topic?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface ProgressAttempt {
  attempt_number: number;
  overall_score: number;
  correct_count: number;
  total_questions: number;
  weak_count: number;
  medium_count: number;
  strong_count: number;
  created_at: string;
}

export interface ProgressData {
  has_data: boolean;
  total_attempts: number;
  attempts: ProgressAttempt[];
  initial_score?: number;
  latest_score?: number;
  improvement_pct?: number;
  topic_trends?: Record<string, { attempt: number; score: number; status: string }[]>;
  summary: string;
}

