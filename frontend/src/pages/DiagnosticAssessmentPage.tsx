import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Loader2,
  RotateCcw,
  Check,
  Award
} from 'lucide-react';
import { Student, StudyMaterial, Quiz, QuizQuestion, GapReport } from '../types';
import { apiClient } from '../api/client';

interface DiagnosticAssessmentPageProps {
  student: Student;
  materials: StudyMaterial[];
  targetSubject: string;
  onAssessmentCompleted: (report: GapReport) => void;
  onNavigate: (tab: string) => void;
  preselectedTopic?: string;
}

export const DiagnosticAssessmentPage: React.FC<DiagnosticAssessmentPageProps> = ({
  student,
  materials,
  targetSubject,
  onAssessmentCompleted,
  onNavigate,
  preselectedTopic
}) => {
  // Setup configuration state
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [selectedFocusTopic, setSelectedFocusTopic] = useState<string>(preselectedTopic || '');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600); // 10 mins default
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeRemainingSeconds === 0 && timerActive) {
      // Auto submit when time runs out
      handleConfirmSubmit();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemainingSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const quiz = await apiClient.generateQuiz(
        student.id,
        numQuestions,
        targetSubject || 'General Studies',
        selectedFocusTopic || undefined
      );

      if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        throw new Error('No questions could be generated. Please upload study materials first.');
      }

      setActiveQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setFlaggedQuestions({});
      setTimeRemainingSeconds(quiz.questions.length * 120); // 2 mins per question
      setTimerActive(true);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setGenerateError(
        err.response?.data?.detail || err.message || 'Failed to generate diagnostic test. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleConfirmSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setTimerActive(false);
    setShowReviewModal(false);

    try {
      const answersPayload = activeQuiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1
      }));

      const report = await apiClient.submitQuiz(student.id, activeQuiz.id, answersPayload);
      onAssessmentCompleted(report);
      onNavigate('results');
    } catch (err: any) {
      console.error('Submit quiz error:', err);
      alert('Error submitting assessment. Please try again.');
      setSubmitting(false);
    }
  };

  // View 1: Assessment Setup Screen
  if (!activeQuiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Diagnostic Assessment</h1>
              <p className="text-sm text-slate-500">
                AI evaluates your knowledge gaps grounded exclusively in your uploaded materials.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subject</span>
              <p className="text-base font-bold text-slate-800">{targetSubject || 'General Studies'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grounding Materials</span>
              <p className="text-base font-bold text-slate-800">
                {materials.length} Document{materials.length === 1 ? '' : 's'} Indexed
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RAG Security</span>
              <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Answer keys locked on server
              </p>
            </div>
          </div>

          {materials.length === 0 && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">No study materials uploaded yet</p>
                <p className="text-xs text-amber-700 mt-1">
                  For strict material-grounded questions and source citations, please upload your syllabus or notes
                  first. Otherwise, standard curriculum questions will be tested.
                </p>
                <button
                  onClick={() => onNavigate('materials')}
                  className="mt-2 text-xs font-bold text-amber-900 underline hover:text-amber-700"
                >
                  Upload Study Materials &rarr;
                </button>
              </div>
            </div>
          )}

          {generateError && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {generateError}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Number of Diagnostic Questions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumQuestions(count)}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition flex flex-col items-center justify-center gap-1 ${
                      numQuestions === count
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg font-bold">{count} Questions</span>
                    <span className="text-xs text-slate-500">~{count * 2} minutes</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Focus Area (Optional)
              </label>
              <input
                type="text"
                value={selectedFocusTopic}
                onChange={(e) => setSelectedFocusTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Kinematics, Newton's Laws (or leave empty for broad diagnosis)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Leave blank to diagnose your entire syllabus evenly, or enter a specific chapter to drill down.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={handleStartAssessment}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Questions from Materials...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Begin Diagnostic Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature guarantee highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">100% Material Grounded</h4>
            <p className="text-xs text-slate-500 mt-1">
              Questions are created from your uploaded notes and textbooks, not random AI memory.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Pinpoint Gap Diagnosis</h4>
            <p className="text-xs text-slate-500 mt-1">
              Classifies topics into 🔴 Weak, 🟡 Moderate, 🟢 Strong with exact reasons.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
              <Check className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Personalized Prescription</h4>
            <p className="text-xs text-slate-500 mt-1">
              Generates a day-by-day revision treatment plan adapted to your available study hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Active Test Taking Experience (1 Question at a time)
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Subject, Timer, Flag, and Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{activeQuiz.subject}</span>
          <h2 className="text-lg font-bold text-slate-900">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h2>
        </div>

        {/* Question Navigation Pill Grid */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {activeQuiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isFlagged = flaggedQuestions[q.id];
            const isCurrent = idx === currentQuestionIndex;

            let btnClasses = 'w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ';
            if (isCurrent) {
              btnClasses += 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2';
            } else if (isFlagged) {
              btnClasses += 'bg-amber-100 text-amber-700 border border-amber-300';
            } else if (isAnswered) {
              btnClasses += 'bg-emerald-50 text-emerald-700 border border-emerald-300';
            } else {
              btnClasses += 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={btnClasses}
                title={`Question ${idx + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 text-sm font-semibold">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => handleToggleFlag(currentQuestion!.id)}
            className={`p-2 rounded-xl border transition ${
              flaggedQuestions[currentQuestion!.id]
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Flag for review"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                {currentQuestion.topic}
              </span>
              {currentQuestion.subtopic && (
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  {currentQuestion.subtopic}
                </span>
              )}
            </div>
            {currentQuestion.difficulty && (
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Difficulty: {currentQuestion.difficulty}
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Source Citation Indicator (answer kept confidential) */}
          {currentQuestion.source_citation && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Grounded in: <strong className="text-slate-700">{currentQuestion.source_citation}</strong></span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-800'}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
              >
                Review Summary ({answeredCount}/{totalQuestions})
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
                >
                  Submit Assessment
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Summary Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review Before Grading</h3>
                <p className="text-xs text-slate-500">Check your answers before submitting</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <p className="text-2xl font-black text-emerald-600">{answeredCount}</p>
                <p className="text-xs text-slate-500 font-medium">Answered</p>
              </div>
              <div>
                <p className="text-2xl font-black text-rose-500">{totalQuestions - answeredCount}</p>
                <p className="text-xs text-slate-500 font-medium">Unanswered</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-500">{flaggedCount}</p>
                <p className="text-xs text-slate-500 font-medium">Flagged</p>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                You have {totalQuestions - answeredCount} unanswered questions. Unanswered questions will be scored as 0.
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
              >
                Return to Test
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

