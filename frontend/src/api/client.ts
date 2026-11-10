import axios from 'axios';
import {
  Student,
  StudyMaterial,
  TopicMapItem,
  Quiz,
  GapReport,
  RevisionPlan,
  ChatMessage,
  ProgressData
} from '../types';

let envUrl = import.meta.env.VITE_API_URL;
if (envUrl && envUrl.includes('gapfinder-backend.onrender.com')) {
  envUrl = 'https://gap-finder-chatbot.onrender.com';
}
export const API_BASE = envUrl
  ? `${envUrl.replace(/\/+$/, '')}/api`
  : (import.meta.env.PROD ? 'https://gap-finder-chatbot.onrender.com/api' : '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // 1. Auth & Student Profile
  register: async (full_name: string, email: string, password: string): Promise<Student> => {
    const res = await api.post<Student>('/auth/register', {
      full_name,
      email,
      password,
    });
    return res.data;
  },

  login: async (email: string, password?: string): Promise<Student> => {
    const res = await api.post<Student>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  loginDemo: async (email?: string, full_name?: string): Promise<Student> => {
    const res = await api.post<Student>('/auth/login', {
      email: email || 'demo.student@gapfinder.ai',
      full_name: full_name || 'Alex Mercer (Demo Student)',
    });
    return res.data;
  },

  getStudentAccount: async (): Promise<Student> => {
    const res = await api.get<Student>('/auth/demo');
    return res.data;
  },

  getProfile: async (studentId: string): Promise<Student> => {
    const res = await api.get<Student>(`/auth/me/${studentId}`);
    return res.data;
  },

  updateProfile: async (studentId: string, data: Partial<Student>): Promise<Student> => {
    const res = await api.put<Student>(`/auth/profile/${studentId}`, data);
    return res.data;
  },

  completeOnboarding: async (data: {
    student_id: string;
    target_subject: string;
    exam_name?: string;
    exam_date?: string;
    daily_study_hours: number;
    prep_duration_days: number;
  }): Promise<Student> => {
    const res = await api.post<Student>('/auth/onboarding', data);
    return res.data;
  },

  // 2. Study Materials Upload (PDF / TXT)
  uploadMaterialFile: async (
    studentId: string,
    title: string,
    materialType: 'syllabus' | 'notes' | 'past_paper',
    file: File
  ): Promise<{ success: boolean; message: string; material: StudyMaterial }> => {
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('title', title);
    formData.append('material_type', materialType);
    formData.append('file', file);

    const res = await api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadMaterialText: async (
    studentId: string,
    title: string,
    materialType: 'syllabus' | 'notes' | 'past_paper',
    content: string,
    filename?: string
  ): Promise<{ success: boolean; message: string; material: StudyMaterial }> => {
    const res = await api.post('/materials/text', {
      student_id: studentId,
      title,
      material_type: materialType,
      content,
      filename,
    });
    return res.data;
  },

  getMaterials: async (studentId: string): Promise<StudyMaterial[]> => {
    const res = await api.get<{ materials: StudyMaterial[] }>(`/materials/${studentId}`);
    return res.data.materials;
  },

  deleteMaterial: async (materialId: string, studentId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/materials/${materialId}`, {
      params: { student_id: studentId },
    });
    return res.data;
  },

  // 3. Topic Map
  generateTopicMap: async (studentId: string, subject = 'General Studies'): Promise<{ topic_map: { topic_data: TopicMapItem[] } }> => {
    const res = await api.post('/topic-map/generate', {
      student_id: studentId,
      subject,
    });
    return res.data;
  },

  getTopicMap: async (studentId: string): Promise<TopicMapItem[] | null> => {
    const res = await api.get<{ topic_map: { topic_data: TopicMapItem[] } | null }>(`/topic-map/${studentId}`);
    return res.data.topic_map ? res.data.topic_map.topic_data : null;
  },

  // 4. Diagnostic Quiz
  generateQuiz: async (studentId: string, numQuestions = 5, subject = 'General Studies', focusTopic?: string): Promise<Quiz> => {
    const res = await api.post<{ quiz: Quiz }>('/quiz/generate', {
      student_id: studentId,
      num_questions: numQuestions,
      subject,
      focus_topic: focusTopic,
    });
    return res.data.quiz;
  },

  getQuiz: async (quizId: string): Promise<Quiz> => {
    const res = await api.get<{ quiz: Quiz }>(`/quiz/${quizId}`);
    return res.data.quiz;
  },

  submitQuiz: async (
    studentId: string,
    quizId: string,
    answers: { question_id: string; selected_option_index: number }[]
  ): Promise<GapReport> => {
    const res = await api.post<{ gap_report: GapReport }>('/quiz/submit', {
      student_id: studentId,
      quiz_id: quizId,
      answers,
    });
    return res.data.gap_report;
  },

  // 5. Gap Diagnosis & Revision Plan
  getLatestGapReport: async (studentId: string): Promise<GapReport | null> => {
    const res = await api.get<{ gap_report: GapReport | null }>(`/diagnosis/${studentId}/latest`);
    return res.data.gap_report;
  },

  generateRevisionPlan: async (
    studentId: string,
    availableDays = 5,
    dailyHours = 2.0
  ): Promise<RevisionPlan> => {
    const res = await api.post<{ revision_plan: RevisionPlan }>('/diagnosis/plan', {
      student_id: studentId,
      available_days: availableDays,
      daily_hours: dailyHours,
    });
    return res.data.revision_plan;
  },

  getActiveRevisionPlan: async (studentId: string): Promise<RevisionPlan | null> => {
    const res = await api.get<{ revision_plan: RevisionPlan | null }>(`/diagnosis/${studentId}/plan`);
    return res.data.revision_plan;
  },

  toggleRevisionTask: async (
    studentId: string,
    planId: string,
    dayNumber: number,
    taskIndex: number,
    completed: boolean
  ): Promise<{ success: boolean; revision_plan: RevisionPlan }> => {
    const res = await api.post('/diagnosis/task/toggle', {
      student_id: studentId,
      plan_id: planId,
      day_number: dayNumber,
      task_index: taskIndex,
      completed,
    });
    return res.data;
  },

  // 6. Conversational Study Doctor Chat
  sendChatMessage: async (
    studentId: string,
    message: string,
    topic?: string
  ): Promise<{ reply: string; citations: any[]; retrieval_used: boolean; model_used?: string }> => {
    const res = await api.post('/chat', {
      student_id: studentId,
      message,
      topic,
    });
    return res.data;
  },

  getChatHistory: async (studentId: string): Promise<ChatMessage[]> => {
    const res = await api.get<{ messages: ChatMessage[] }>(`/chat/history/${studentId}`);
    return res.data.messages;
  },

  // 7. Progress & Analytics
  getProgress: async (studentId: string): Promise<ProgressData> => {
    const res = await api.get<ProgressData>(`/progress/${studentId}`);
    return res.data;
  },
};
