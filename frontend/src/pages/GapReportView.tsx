import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
  HelpCircle,
  FileQuestion
} from 'lucide-react';
import { apiClient } from '../api/client';
import { GapReport, Student } from '../types';

interface GapReportViewProps {
  student: Student;
  currentSubject: string;
  onNavigateToPlan: () => void;
  onNavigateToQuiz: () => void;
}

export const GapReportView: React.FC<GapReportViewProps> = ({
  student,
  currentSubject,
  onNavigateToPlan,
  onNavigateToQuiz,
}) => {
  const [report, setReport] = useState<GapReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'weak' | 'medium' | 'strong'>('all');

  useEffect(() => {
    fetchLatestReport();
  }, [student.id]);

  const fetchLatestReport = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLatestGapReport(student.id);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'weak':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>🔴 Weak (Needs Work)</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>🟡 Medium (Partly Understood)</span>
          </span>
        );
      case 'strong':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>🟢 Strong (Mastered)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Knowledge Diagnosis</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Diagnostic Gap Report & Treatment Prescription
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            The study doctor's diagnosis for {currentSubject}: maps where your actual blindspots exist, explains the root causes of errors, and categorizes each topic.
          </p>
        </div>

        {report && (
          <button
            onClick={onNavigateToPlan}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Build Revision Plan</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          <p className="text-xs text-slate-400">Loading diagnostic gap evaluation...</p>
        </div>
      ) : !report ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Activity className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Diagnosis Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Take a diagnostic quiz first so GapFinder AI can evaluate your answers and diagnose your weak areas.
          </p>
          <button
            onClick={onNavigateToQuiz}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            Take Diagnostic Quiz Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Doctor's Summary Prescription Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-500/30 p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400">Doctor's Diagnosis • Attempt #{report.attempt_number}</span>
                  <h2 className="text-lg font-bold text-white">Diagnostic Summary</h2>
                </div>
              </div>

              {/* Overall Score Dial */}
              <div className="flex items-center space-x-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overall Mastery</span>
                  <span className="text-xs text-slate-300">{report.correct_count} of {report.total_questions} Questions Correct</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {report.overall_score}%
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {report.doctor_summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
                <span className="text-xs text-rose-300 font-semibold block">🔴 Weak Topics</span>
                <span className="text-xl font-bold font-mono text-rose-400">{report.weak_topics.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
                <span className="text-xs text-amber-300 font-semibold block">🟡 Medium Topics</span>
                <span className="text-xl font-bold font-mono text-amber-400">{report.medium_topics.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="text-xs text-emerald-300 font-semibold block">🟢 Strong Topics</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{report.strong_topics.length}</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: `All Topics (${Object.keys(report.topic_breakdown || {}).length})` },
              { id: 'weak', label: `🔴 Weak (${report.weak_topics.length})` },
              { id: 'medium', label: `🟡 Medium (${report.medium_topics.length})` },
              { id: 'strong', label: `🟢 Strong (${report.strong_topics.length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-slate-200 text-slate-950 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Topic Diagnosis Breakdown Cards */}
          <div className="space-y-4">
            {Object.entries(report.topic_breakdown || {})
              .filter(([_, data]) => {
                if (activeFilter === 'all') return true;
                return data.status === activeFilter;
              })
              .map(([topicName, data]) => {
                const isWeak = data.status === 'weak';
                const isMedium = data.status === 'medium';

                return (
                  <div
                    key={topicName}
                    className={`bg-slate-900 border rounded-2xl p-6 transition-all space-y-4 ${
                      isWeak
                        ? 'border-rose-500/40 bg-gradient-to-r from-slate-900 to-rose-950/10'
                        : isMedium
                        ? 'border-amber-500/30 bg-gradient-to-r from-slate-900 to-amber-950/10'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">{topicName}</h3>
                        <p className="text-xs text-slate-400">
                          Performance: {data.correct_questions} of {data.total_questions} questions correct ({data.score}%)
                        </p>
                      </div>
                      <div>{getStatusBadge(data.status)}</div>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(data.score, 6)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Diagnostic Root Cause</span>
                        <p className="text-slate-200">{data.reason}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Prescribed Treatment</span>
                        <p className="text-slate-300">{data.recommended_focus}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Next Step Callout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Generate Your Personalized Revision Plan</h4>
              <p className="text-xs text-slate-400">
                Prioritizes your weakest topics first and fits into your available days and study hours.
              </p>
            </div>
            <button
              onClick={onNavigateToPlan}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <span>Build Revision Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
