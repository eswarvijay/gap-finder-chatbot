import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  RotateCcw,
  MessageSquare,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { GapReport, Student } from '../types';

interface GapReportViewProps {
  report: GapReport | null;
  student: Student | null;
  targetSubject: string;
  onRetest: () => void;
  onGeneratePlan: () => void;
  onOpenChat: (prompt?: string) => void;
  loading?: boolean;
}

export const GapReportView: React.FC<GapReportViewProps> = ({
  report,
  student,
  targetSubject,
  onRetest,
  onGeneratePlan,
  onOpenChat,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your diagnostic gap report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">No Diagnostic Baseline Yet</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Before we can diagnose what you don't know, we need to test your understanding of <strong>{targetSubject}</strong>.
            </p>
          </div>
          <button
            onClick={onRetest}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Take Diagnostic Quiz on {targetSubject}</span>
          </button>
        </div>
      </div>
    );
  }

  const breakdown = report.topic_breakdown || {};
  const weakTopics = report.weak_topics || [];
  const mediumTopics = report.medium_topics || [];
  const strongTopics = report.strong_topics || [];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Card: Score & Clinical Diagnosis */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-400 border border-rose-800/50">
                  Attempt #{report.attempt_number}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Doctor's Clinical Gap Diagnosis</h1>
              <p className="text-xs text-slate-400">Subject: <span className="text-emerald-400 font-semibold">{targetSubject}</span></p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-2xl font-black text-white">{report.overall_score}%</span>
                <p className="text-[11px] text-slate-400">
                  {report.correct_count} of {report.total_questions} correct
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border shadow-lg ${
                report.overall_score >= 70
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                  : report.overall_score >= 50
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/50'
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/50'
              }`}>
                {report.overall_score >= 70 ? '🟢' : report.overall_score >= 50 ? '🟡' : '🔴'}
              </div>
            </div>
          </div>

          {/* Doctor's Summary */}
          {report.doctor_summary && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Stethoscope className="w-4 h-4" />
                <span>Physician's Clinical Finding</span>
              </div>
              <p className="text-slate-300">{report.doctor_summary}</p>
            </div>
          )}

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onGeneratePlan}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Generate Adaptive Revision Plan</span>
            </button>

            <button
              onClick={onRetest}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retest Diagnostics</span>
            </button>

            <button
              onClick={() => onOpenChat(`Explain my weakest topic in ${targetSubject} based on my diagnostic report.`)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all border border-slate-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Discuss Gaps with Study Doctor</span>
            </button>
          </div>
        </div>

        {/* 3 Clinical Columns: 🔴 Weak, 🟡 Medium, 🟢 Strong */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* 🔴 Weak Topics */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-950 pb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Weak Topics ({weakTopics.length})</span>
              </span>
              <span className="text-[10px] text-rose-400/80 font-mono">Needs Serious Work</span>
            </div>

            {weakTopics.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No critical weaknesses detected!</p>
            ) : (
              <div className="space-y-2.5">
                {weakTopics.map((topicName, idx) => {
                  const data = (breakdown[topicName] || {}) as any;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{topicName}</span>
                        <span className="text-[10px] font-mono text-rose-400 font-bold">{data.score || 0}%</span>
                      </div>
                      {data.reason && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          <strong>Why:</strong> {data.reason}
                        </p>
                      )}
                      {data.recommended_focus && (
                        <p className="text-[10px] text-rose-300/90 font-mono">
                          Rx: {data.recommended_focus}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🟡 Medium Topics */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-950 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Topics ({mediumTopics.length})</span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">Partly Understood</span>
            </div>

            {mediumTopics.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No borderline topics found.</p>
            ) : (
              <div className="space-y-2.5">
                {mediumTopics.map((topicName, idx) => {
                  const data = (breakdown[topicName] || {}) as any;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{topicName}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{data.score || 50}%</span>
                      </div>
                      {data.reason && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          <strong>Why:</strong> {data.reason}
                        </p>
                      )}
                      {data.recommended_focus && (
                        <p className="text-[10px] text-amber-300/90 font-mono">
                          Rx: {data.recommended_focus}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🟢 Strong Topics */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Strong Topics ({strongTopics.length})</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Mastered</span>
            </div>

            {strongTopics.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No mastered topics yet. Keep revising!</p>
            ) : (
              <div className="space-y-2.5">
                {strongTopics.map((topicName, idx) => {
                  const data = (breakdown[topicName] || {}) as any;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{topicName}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{data.score || 100}%</span>
                      </div>
                      {data.reason && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          <strong>Status:</strong> {data.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Grounded Question-by-Question Audit with Citations */}
        {report.student_answers && report.student_answers.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Question-by-Question Diagnostic Provenance</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Grounded RAG Citations</span>
            </div>

            <div className="space-y-3">
              {report.student_answers.map((ans, aIdx) => (
                <div
                  key={aIdx}
                  className={`p-4 rounded-xl border space-y-2 ${
                    ans.is_correct
                      ? 'bg-emerald-950/15 border-emerald-900/40'
                      : 'bg-rose-950/15 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      Q{aIdx + 1} • {ans.topic}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-indigo-900/40">
                      {ans.source_citation || 'Curriculum Section'}
                    </span>
                  </div>

                  <p className="text-xs text-white font-medium">{ans.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Your Answer:</span>
                      <span className={`font-semibold ${ans.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ans.selected_option_text || 'No answer selected'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Correct Answer:</span>
                      <span className="font-semibold text-emerald-400">{ans.correct_option_text}</span>
                    </div>
                  </div>

                  {ans.explanation && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300">
                      <strong className="text-emerald-400">Explanation:</strong> {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
