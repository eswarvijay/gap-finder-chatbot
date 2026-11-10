import React from 'react';
import {
  HelpCircle,
  Activity,
  Calendar,
  FolderOpen,
  Layers,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { Student, StudyMaterial, GapReport, RevisionPlan, ProgressData } from '../types';

interface DashboardOverviewProps {
  student: Student;
  targetSubject: string;
  materials: StudyMaterial[];
  gapReport: GapReport | null;
  revisionPlan: RevisionPlan | null;
  progress: ProgressData | null;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  student,
  targetSubject,
  materials,
  gapReport,
  revisionPlan,
  progress,
  onNavigate,
}) => {
  const attempts = progress?.attempts || [];
  const weakCount = gapReport?.weak_topics?.length || 0;
  const mediumCount = gapReport?.medium_topics?.length || 0;
  const strongCount = gapReport?.strong_topics?.length || 0;
  const latestScore = gapReport?.overall_score ?? (progress?.latest_score ?? null);

  const upcomingTasks = revisionPlan?.plan_schedule?.[0]?.tasks || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      
      {/* Welcome Banner Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Doctor Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {student.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Ready to find what you don't know in <strong>{targetSubject}</strong>? Take a diagnostic quiz to reveal your hidden blindspots before your exam.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => onNavigate('quiz')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Start Diagnostic Assessment</span>
          </button>
          <button
            onClick={() => onNavigate('materials')}
            className="px-4 py-3 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Attach Study Notes</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Materials</span>
            <FolderOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{materials.length}</p>
          <span className="text-[11px] text-slate-500">Ingested documents</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assessments</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{attempts.length}</p>
          <span className="text-[11px] text-slate-500">Completed diagnostic tests</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Latest Mastery</span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <p className={`text-2xl font-black ${
            latestScore !== null && latestScore >= 70 ? 'text-emerald-600' : latestScore !== null && latestScore >= 50 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {latestScore !== null ? `${latestScore}%` : 'Pending'}
          </p>
          <span className="text-[11px] text-slate-500">Diagnostic score</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weak Topics</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{weakCount}</p>
          <span className="text-[11px] text-slate-500">Topics needing revision</span>
        </div>

      </div>

      {/* 2-Column Section: Clinical Gap Breakdown & Revision Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Clinical Knowledge Gap Status Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Knowledge Gap Diagnosis</h3>
              </div>
              <button
                onClick={() => onNavigate('gap_analysis')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Full Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {gapReport ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">Physician Finding:</strong>
                  {gapReport.doctor_summary}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">🔴 Weak</span>
                    <span className="text-lg font-black text-rose-800">{weakCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                    <span className="text-[10px] font-bold uppercase text-amber-700 block">🟡 Medium</span>
                    <span className="text-lg font-black text-amber-800">{mediumCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">🟢 Strong</span>
                    <span className="text-lg font-black text-emerald-800">{strongCount}</span>
                  </div>
                </div>

                {gapReport.weak_topics?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Priority Focus Areas:</span>
                    {gapReport.weak_topics.slice(0, 2).map((t, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-xs text-rose-900 font-medium">
                        • {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No diagnostic baseline taken yet.</p>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Take your first test now →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('gap_analysis')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Inspect All Knowledge Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Personalized Revision Tasks Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Revision Treatment</h3>
              </div>
              <button
                onClick={() => onNavigate('revision_plan')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{t.topic}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        {t.time_allocation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{t.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No revision plan generated yet.</p>
                <button
                  onClick={() => onNavigate('revision_plan')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Generate personalized roadmap →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('revision_plan')}
            className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Open Study Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Historical Attempts Table */}
      {attempts.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Assessment History & Attempt Progression</span>
            </h3>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View Analytics →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-2">Attempt</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Performance</th>
                  <th className="pb-2">Breakdown</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">#{a.attempt_number}</td>
                    <td className="py-2.5 font-bold font-mono text-indigo-600">{a.overall_score}%</td>
                    <td className="py-2.5 text-slate-600">{a.correct_count} / {a.total_questions} questions correct</td>
                    <td className="py-2.5">
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                        <span className="text-rose-600 font-bold">🔴 {a.weak_count}</span>
                        <span className="text-amber-600 font-bold">🟡 {a.medium_count}</span>
                        <span className="text-emerald-600 font-bold">🟢 {a.strong_count}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

