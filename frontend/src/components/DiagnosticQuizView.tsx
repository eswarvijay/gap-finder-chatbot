import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Stethoscope,
  BookOpen,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, GapReport, Student, StudyMaterial } from '../types';

interface DiagnosticQuizViewProps {
  quiz: Quiz | null;
  student: Student | null;
  targetSubject: string;
  materials: StudyMaterial[];
  onGenerateQuiz: (subject: string, numQuestions: number) => Promise<Quiz>;
  onSubmitQuiz: (quizId: string, answers: { question_id: string; selected_option_index: number }[]) => Promise<GapReport>;
  onViewDiagnosis: (report: GapReport) => void;
  loading?: boolean;
}

export const DiagnosticQuizView: React.FC<DiagnosticQuizViewProps> = ({
  quiz,
  student,
  targetSubject,
  materials,
  onGenerateQuiz,
  onSubmitQuiz,
  onViewDiagnosis,
  loading = false,
}) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(quiz);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<GapReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [numQuestions, setNumQuestions] = useState(4);

  const handleGenerate = async () => {
    setGenerating(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const q = await onGenerateQuiz(targetSubject, numQuestions);
      setActiveQuiz(q);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (qid: string, idx: number) => {
    if (quizResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qid]: idx,
    }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answers = activeQuiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const report = await onSubmitQuiz(activeQuiz.id, answers);
      setQuizResult(report);

      if (report.overall_score >= 70) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Control Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  Grounding: Student Materials
                </span>
                <span className="text-xs text-slate-400">
                  {materials.length} Document(s) Ingested
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Diagnostic Quiz Studio</h1>
              <p className="text-xs text-slate-400">
                Grounded in your uploaded material for: <span className="text-emerald-400 font-semibold">{targetSubject}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Questions:</span>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{generating ? 'Retrieving & Generating...' : 'Generate Grounded Quiz'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              All questions are generated directly from retrieved document chunks and display provenance citations.
            </span>
          </div>
        </div>

        {/* Empty State / Not Generated Yet */}
        {!activeQuiz && !generating && (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Active Diagnostic Quiz</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click <strong>"Generate Grounded Quiz"</strong> above to test your understanding of {targetSubject} and discover your blindspots.
              </p>
            </div>
          </div>
        )}

        {/* Active Quiz Card */}
        {activeQuiz && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{activeQuiz.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800">
                  {activeQuiz.questions.length} Questions
                </span>
              </h2>

              {quizResult && (
                <button
                  onClick={() => onViewDiagnosis(quizResult)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800/60 flex items-center space-x-1.5 shadow-md transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                  <span>View Full Clinical Gap Report →</span>
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {activeQuiz.questions.map((q, qIdx) => {
                const selected = selectedAnswers[q.id];
                const isSubmitted = !!quizResult;
                const isCorrect = isSubmitted && selected === q.correct_option_index;
                const isWrong = isSubmitted && selected !== undefined && selected !== q.correct_option_index;

                return (
                  <div
                    key={q.id || qIdx}
                    className={`p-5 rounded-2xl border space-y-3 transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/50'
                          : isWrong
                          ? 'bg-rose-950/20 border-rose-500/50'
                          : 'bg-slate-900 border-slate-800'
                        : 'bg-slate-900 border-slate-800 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">
                        Question {qIdx + 1} • <span className="text-emerald-400">{q.topic}</span>
                      </span>

                      {q.source_citation && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-indigo-900/40">
                          {q.source_citation}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-white leading-relaxed">{q.question}</p>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selected === oIdx;
                        const isRight = oIdx === q.correct_option_index;

                        let style = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700';
                        if (isSubmitted) {
                          if (isRight) style = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold';
                          else if (isChosen && !isRight) style = 'bg-rose-950/80 border-rose-500 text-rose-300 line-through';
                          else style = 'opacity-40 border-slate-900';
                        } else if (isChosen) {
                          style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            disabled={isSubmitted}
                            className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${style}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                            {isSubmitted && isChosen && !isRight && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-emerald-400">Answer Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission Action Bar */}
            {!quizResult && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(selectedAnswers).length === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                  <span>{submitting ? 'Evaluating & Diagnosing...' : 'Submit Answers & Get Doctor Diagnosis'}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

