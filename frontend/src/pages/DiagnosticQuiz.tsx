import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
  Check,
  Award,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../api/client';
import { Quiz, Student, GapReport } from '../types';

interface DiagnosticQuizProps {
  student: Student;
  currentSubject: string;
  setCurrentSubject: (subj: string) => void;
  onQuizSubmitted: (report: GapReport) => void;
  onNavigateToReport: () => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({
  student,
  currentSubject,
  setCurrentSubject,
  onQuizSubmitted,
  onNavigateToReport,
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [latestReport, setLatestReport] = useState<GapReport | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    setHasEvaluated(false);
    setLatestReport(null);
    setSelectedAnswers({});

    try {
      const newQuiz = await apiClient.generateQuiz(student.id, numQuestions, currentSubject || 'General Studies');
      setQuiz(newQuiz);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate diagnostic quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (hasEvaluated) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || quiz.questions.length === 0) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < quiz.questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${quiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const submissionList = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const report = await apiClient.submitQuiz(student.id, quiz.id, submissionList);
      setLatestReport(report);
      setHasEvaluated(true);
      onQuizSubmitted(report);

      if (report.overall_score >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to evaluate quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Diagnostic Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Diagnostic Test Engine
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Groq generates multiple-choice questions grounded in your course materials. Every question features an exact source citation so you know where the concept originates.
          </p>
        </div>

        {/* Dynamic Subject & Question Count Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              placeholder="Subject / Exam"
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 font-semibold"
            />
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{generating ? 'Generating Questions with Groq...' : 'Generate New Test'}</span>
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      {!quiz ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Active Diagnostic Test</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Generate New Test" to have Groq build a grounded diagnostic test on {currentSubject || 'your subject'}.
          </p>
          <button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            {generating ? 'Synthesizing...' : 'Start Assessment'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Evaluation Banner (Post-submission) */}
          {hasEvaluated && latestReport && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Diagnostic Test Evaluated!</h3>
                    <p className="text-xs text-slate-300">
                      Score: <span className="font-extrabold text-emerald-400 font-mono text-sm">{latestReport.overall_score}%</span> ({latestReport.correct_count} of {latestReport.total_questions} correct)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGenerateQuiz}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Generate Another Test</span>
                  </button>

                  <button
                    onClick={onNavigateToReport}
                    className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <span>View Doctor's Gap Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-5">
            {quiz.questions.map((q, qIndex) => {
              const selectedIdx = selectedAnswers[q.id];
              const isSubmitted = hasEvaluated;
              const isCorrect = isSubmitted && selectedIdx === q.correct_option_index;
              const isWrong = isSubmitted && selectedIdx !== undefined && selectedIdx !== q.correct_option_index;

              return (
                <div
                  key={q.id || qIndex}
                  className={`bg-slate-900/90 rounded-2xl p-6 border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/50 bg-emerald-950/10'
                        : isWrong
                        ? 'border-rose-500/50 bg-rose-950/10'
                        : 'border-slate-800'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Meta Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{q.topic}</span>
                      {q.subtopic && (
                        <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {q.subtopic}
                        </span>
                      )}
                    </div>

                    {/* Source Citation Badge */}
                    {q.source_citation && (
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[10px] font-mono">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>{q.source_citation}</span>
                      </div>
                    )}
                  </div>

                  {/* Question Stem */}
                  <h3 className="text-sm font-semibold text-white leading-relaxed mb-4">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((optText, oIdx) => {
                      const isOptionSelected = selectedIdx === oIdx;
                      const isCorrectOption = oIdx === q.correct_option_index;

                      let optionStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                      if (isSubmitted) {
                        if (isCorrectOption) {
                          optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                        } else if (isOptionSelected && !isCorrectOption) {
                          optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                        } else {
                          optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-medium shadow-sm';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          disabled={hasEvaluated}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${optionStyle}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-5 h-5 rounded-full border text-[11px] font-mono flex items-center justify-center flex-shrink-0 ${
                              isOptionSelected
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                                : 'border-slate-700 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{optText}</span>
                          </div>

                          {isSubmitted && isCorrectOption && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isCorrectOption && (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Block (Post-submission) */}
                  {isSubmitted && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs animate-fade-in">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Explanation:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      {q.source_citation && (
                        <div className="text-[10px] text-slate-500 font-mono pt-1">
                          Source: {q.source_citation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz CTA */}
          {!hasEvaluated && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Answered <span className="font-bold text-white font-mono">{Object.keys(selectedAnswers).length}</span> of{' '}
                <span className="font-bold text-white font-mono">{quiz.questions.length}</span> questions
              </div>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{submitting ? 'Diagnosing with Groq...' : 'Submit Answers & Diagnose Gaps'}</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
