import React, { useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  ChevronDown,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GapReport } from '../types';

interface AssessmentResultsPageProps {
  report: GapReport;
  onNavigate: (tab: string) => void;
  onRetake: () => void;
}

export const AssessmentResultsPage: React.FC<AssessmentResultsPageProps> = ({
  report,
  onNavigate,
  onRetake
}) => {
  useEffect(() => {
    if (report.overall_score >= 60) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [report.overall_score]);

  const weakCount = report.weak_topics?.length || 0;
  const mediumCount = report.medium_topics?.length || 0;
  const strongCount = report.strong_topics?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Score Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Assessment Complete • Attempt #{report.attempt_number || 1}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Diagnostic Results</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Here is what you know, what needs practice, and the exact gaps preventing exam mastery.
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-center">
              <div className="text-4xl font-black text-indigo-600">
                {Math.round(report.overall_score)}%
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Overall Score</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {report.correct_count} / {report.total_questions}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Questions Correct</div>
            </div>
          </div>
        </div>

        {/* Doctor Summary Note */}
        {report.doctor_summary && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Study Doctor Diagnosis</h4>
              <p className="text-sm text-indigo-950 font-medium mt-0.5 leading-relaxed">
                {report.doctor_summary}
              </p>
            </div>
          </div>
        )}

        {/* Knowledge Gap Distribution */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/70 text-center">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">🔴 Weak Topics</span>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{weakCount}</p>
            <p className="text-xs text-rose-800 mt-1">Needs urgent attention</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-center">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">🟡 Moderate Topics</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{mediumCount}</p>
            <p className="text-xs text-amber-800 mt-1">Review required</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">🟢 Strong Topics</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{strongCount}</p>
            <p className="text-xs text-emerald-800 mt-1">Ready for exam</p>
          </div>
        </div>

        {/* Navigation Action CTA */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Diagnostic Test
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('gap_analysis')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
            >
              View Full Gap Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('revision_plan')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
            >
              Open Personalized Revision Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Topic Breakdown Bar Section */}
      {report.topic_breakdown && Object.keys(report.topic_breakdown).length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Topic-Wise Diagnostic Breakdown
          </h2>

          <div className="space-y-3">
            {Object.entries(report.topic_breakdown).map(([topic, data]: [string, any]) => {
              const score = data.score !== undefined ? data.score : 0;
              const status = data.status || (score < 50 ? 'weak' : score < 75 ? 'medium' : 'strong');
              const barColor = status === 'weak' ? 'bg-rose-500' : status === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
              const badgeClass =
                status === 'weak'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : status === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div key={topic} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{topic}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase ${badgeClass}`}>
                        {status}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{Math.round(score)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
                  </div>
                  {data.reason && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      <strong className="text-slate-700">Diagnosis:</strong> {data.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Graded Question Review */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Detailed Question Explanations & Citations
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {report.student_answers?.length || 0} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {report.student_answers && report.student_answers.map((ans, idx) => {
            const isCorrect = ans.is_correct;
            return (
              <div
                key={ans.question_id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {ans.topic}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct (+1)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect (0)
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3 leading-snug">
                  {ans.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div
                    className={`p-3 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/80 border-rose-200 text-rose-900'
                    }`}
                  >
                    <span className="font-semibold block text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">
                      Your Answer
                    </span>
                    <p className="font-bold">{ans.selected_option_text || 'None selected'}</p>
                  </div>

                  {!isCorrect && (
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                      <span className="font-semibold block text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">
                        Correct Answer
                      </span>
                      <p className="font-bold">{ans.correct_option_text}</p>
                    </div>
                  )}
                </div>

                {/* AI Explanation */}
                {ans.explanation && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1.5">
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Why this answer is right / wrong:
                    </span>
                    <p className="leading-relaxed text-slate-700">{ans.explanation}</p>
                  </div>
                )}

                {/* Grounding Source Citation */}
                {ans.source_citation && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Source Material Citation: <strong className="text-slate-700">{ans.source_citation}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

