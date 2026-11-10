import React from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Stethoscope
} from 'lucide-react';
import { ProgressData, Student } from '../types';

interface ProgressDashboardViewProps {
  progress: ProgressData | null;
  student: Student | null;
  targetSubject: string;
  onRetest: () => void;
  loading?: boolean;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  progress,
  student,
  targetSubject,
  onRetest,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading progress history...</p>
        </div>
      </div>
    );
  }

  const attempts = progress?.attempts || [];
  const hasData = progress?.has_data && attempts.length > 0;
  const initialScore = progress?.initial_score ?? 0;
  const latestScore = progress?.latest_score ?? 0;
  const delta = progress?.improvement_pct ?? 0;
  const topicTrends = progress?.topic_trends || {};

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  Adaptive Learning Curve
                </span>
                <span className="text-xs text-slate-400">
                  {attempts.length} Attempt(s) Logged
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Diagnostic Progress & Mastery Dashboard</h1>
              <p className="text-xs text-slate-400">Tracking improvement for: <span className="text-emerald-400 font-semibold">{targetSubject}</span></p>
            </div>

            <button
              onClick={onRetest}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Another Diagnostic Test</span>
            </button>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Total Attempts</span>
              <p className="text-2xl font-black text-white">{attempts.length}</p>
              <span className="text-[10px] text-slate-500">Diagnostic quizzes</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Baseline Score</span>
              <p className="text-2xl font-black text-slate-300">{initialScore}%</p>
              <span className="text-[10px] text-slate-500">First attempt</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Latest Mastery</span>
              <p className={`text-2xl font-black ${
                latestScore >= 70 ? 'text-emerald-400' : latestScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>{latestScore}%</p>
              <span className="text-[10px] text-slate-500">Most recent attempt</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Improvement Delta</span>
              <p className={`text-2xl font-black flex items-center ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {delta >= 0 ? `+${delta}%` : `${delta}%`}
                {delta > 0 && <ArrowUpRight className="w-5 h-5 ml-0.5" />}
              </p>
              <span className="text-[10px] text-slate-500">Across attempts</span>
            </div>
          </div>

          {/* Doctor Summary Note */}
          {progress?.summary && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
              <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{progress.summary}</span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!hasData && (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Diagnostic History Recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Take your first diagnostic quiz to establish a baseline score and measure your progress across attempts.
            </p>
          </div>
        )}

        {/* Attempt-by-Attempt Timeline */}
        {hasData && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Historical Attempt Logs</span>
            </h2>

            <div className="space-y-3">
              {attempts.map((att, aIdx) => (
                <div
                  key={aIdx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                      #{att.attempt_number}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Diagnostic Assessment {att.attempt_number}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {att.created_at ? new Date(att.created_at).toLocaleString() : 'Recent'} • {att.correct_count} of {att.total_questions} questions correct
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/40">
                        🔴 {att.weak_count} Weak
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40">
                        🟡 {att.medium_count} Med
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        🟢 {att.strong_count} Strong
                      </span>
                    </div>

                    <span className="text-lg font-black text-white font-mono">{att.overall_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Mastery Transitions */}
        {hasData && Object.keys(topicTrends).length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Topic-Level Progression (🔴 → 🟡 → 🟢)</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(topicTrends).map(([topic, history], tIdx) => (
                <div key={tIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{topic}</span>

                  <div className="flex items-center space-x-2">
                    {history.map((step, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          step.status === 'strong'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                            : step.status === 'medium'
                            ? 'bg-amber-950 text-amber-400 border-amber-800/50'
                            : 'bg-rose-950 text-rose-400 border-rose-800/50'
                        }`}
                        title={`Attempt ${step.attempt}: ${step.score}%`}
                      >
                        A{step.attempt}: {step.score}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

