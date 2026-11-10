import React from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Activity
} from 'lucide-react';
import { Student, ProgressData } from '../types';

interface ProgressDashboardPageProps {
  student: Student;
  progressData: ProgressData | null;
  onNavigate: (tab: string) => void;
}

export const ProgressDashboardPage: React.FC<ProgressDashboardPageProps> = ({
  student,
  progressData,
  onNavigate
}) => {
  if (!progressData || !progressData.has_data || progressData.attempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">No Assessment History Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Complete your first diagnostic test to establish your baseline score and track your learning curve over time.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Take Your First Diagnostic Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const attempts = progressData.attempts;
  const initialScore = progressData.initial_score ?? attempts[0].overall_score;
  const latestScore = progressData.latest_score ?? attempts[attempts.length - 1].overall_score;
  const improvement = progressData.improvement_pct ?? (latestScore - initialScore);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Progress & Mastery Analytics
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Learning Curve & Gap Closure</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Track how your revision translates to real mastery. Notice how weak areas convert into strong pillars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Diagnostic Assessment
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tests</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{attempts.length}</p>
            <p className="text-xs text-slate-500 mt-1">Diagnostic assessments logged</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Baseline</span>
            <p className="text-3xl font-black text-slate-700 mt-1">{Math.round(initialScore)}%</p>
            <p className="text-xs text-slate-500 mt-1">Attempt #1 score</p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Current Score</span>
            <p className="text-3xl font-black text-indigo-600 mt-1">{Math.round(latestScore)}%</p>
            <p className="text-xs text-indigo-700 mt-1 font-medium">Latest diagnostic attempt</p>
          </div>

          <div className={`p-5 rounded-2xl border ${improvement >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${improvement >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Mastery Growth
            </span>
            <p className={`text-3xl font-black mt-1 ${improvement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {improvement >= 0 ? `+${Math.round(improvement)}%` : `${Math.round(improvement)}%`}
            </p>
            <p className={`text-xs mt-1 font-medium ${improvement >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {improvement >= 0 ? 'Knowledge gaps closing!' : 'Additional revision recommended'}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Attempt-by-Attempt Performance Record
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 rounded-l-lg">Attempt</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Correct / Total</th>
                <th className="py-3 px-4">🔴 Weak</th>
                <th className="py-3 px-4">🟡 Moderate</th>
                <th className="py-3 px-4">🟢 Strong</th>
                <th className="py-3 px-4 rounded-r-lg">Progress Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((att, idx) => {
                const prevScore = idx > 0 ? attempts[idx - 1].overall_score : null;
                const delta = prevScore !== null ? att.overall_score - prevScore : null;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Attempt #{att.attempt_number || idx + 1}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {att.created_at ? new Date(att.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-indigo-600">{Math.round(att.overall_score)}%</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {att.correct_count} / {att.total_questions}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{att.weak_count}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{att.medium_count}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{att.strong_count}</td>
                    <td className="py-3.5 px-4">
                      {delta !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {delta >= 0 ? `+${Math.round(delta)}%` : `${Math.round(delta)}%`}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spaced Repetition & Study Doctor Feedback */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Spaced Repetition
          </div>
          <h3 className="text-2xl font-bold">Ready to test what you revised?</h3>
          <p className="text-indigo-200 text-sm max-w-lg leading-relaxed">
            Taking a diagnostic test after revising weak topics reinforces neural pathways and updates your personalized plan with your new mastery levels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('revision_plan')}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
          >
            Review Today's Tasks
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            Start Retake Quiz
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

