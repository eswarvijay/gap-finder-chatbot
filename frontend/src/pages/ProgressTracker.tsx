import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Activity
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ProgressData, Student } from '../types';

interface ProgressTrackerProps {
  student: Student;
  currentSubject: string;
  onRetest: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  student,
  currentSubject,
  onRetest,
}) => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [student.id]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const progress = await apiClient.getProgress(student.id);
      setData(progress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'weak':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">🔴 Weak</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 Med</span>;
      case 'strong':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 Strong</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">-</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery Progression Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Progress & Diagnostic Delta Dashboard
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Measures your diagnostic jump across attempts in {currentSubject || 'your studies'} to confirm personalized revision successfully eliminated your blindspots.
          </p>
        </div>

        <button
          onClick={onRetest}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Launch Next Retest</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-xs text-slate-400">Loading progress history...</p>
        </div>
      ) : !data || !data.has_data || data.total_attempts === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Activity className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Assessment History Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Take your first diagnostic quiz to establish your baseline score. Every subsequent retest tracks your measurable score increase!
          </p>
          <button
            onClick={onRetest}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            Take Baseline Diagnostic Test
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Attempts</span>
              <div className="text-2xl font-black text-white font-mono">{data.total_attempts}</div>
              <span className="text-[11px] text-slate-500">Diagnostic evaluations</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Baseline Score (Attempt 1)</span>
              <div className="text-2xl font-black text-slate-300 font-mono">{data.initial_score}%</div>
              <span className="text-[11px] text-slate-500">Initial diagnostic baseline</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Latest Score</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{data.latest_score}%</div>
              <span className="text-[11px] text-slate-500">Most recent checkup</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 space-y-1">
              <span className="text-xs text-emerald-400 font-semibold">Diagnostic Delta Jump</span>
              <div className="text-2xl font-black text-emerald-300 font-mono flex items-center">
                <span>{data.improvement_pct && data.improvement_pct > 0 ? `+${data.improvement_pct}%` : `${data.improvement_pct}%`}</span>
                {data.improvement_pct && data.improvement_pct > 0 && <ArrowUpRight className="w-5 h-5 ml-1" />}
              </div>
              <span className="text-[11px] text-emerald-400/80">Measurable score gain</span>
            </div>

          </div>

          {/* Progress Narrative Callout */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="leading-relaxed">{data.summary}</span>
          </div>

          {/* Attempts History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Diagnostic Attempt History</h3>
              <span className="text-xs text-slate-400">Chronological Progression</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Attempt</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Questions Correct</th>
                    <th className="p-3.5">Topic Breakdown</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                  {data.attempts.map((att) => (
                    <tr key={att.attempt_number} className="hover:bg-slate-850/50">
                      <td className="p-3.5 font-bold text-white">Attempt #{att.attempt_number}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-1 rounded-md font-bold ${
                          att.overall_score >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : att.overall_score >= 50
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {att.overall_score}%
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {att.correct_count} / {att.total_questions}
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="text-rose-400 font-semibold">{att.weak_count} Weak</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{att.medium_count} Med</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{att.strong_count} Strong</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(att.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Topic Evolution Matrix (Weak -> Med -> Strong) */}
          {data.topic_trends && Object.keys(data.topic_trends).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Topic Mastery Evolution</h3>
                <p className="text-xs text-slate-400">
                  Visual proof of closing diagnostic gaps across attempts
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(data.topic_trends).map(([topic, history]) => (
                  <div
                    key={topic}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-white max-w-sm">{topic}</span>

                    <div className="flex items-center space-x-2">
                      {history.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center space-x-1.5">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Att {h.attempt}</span>
                            {getStatusBadge(h.status)}
                          </div>
                          {hIdx < history.length - 1 && (
                            <span className="text-slate-600 font-bold">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retest CTA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ready to verify further improvement?</h4>
              <p className="text-xs text-slate-400">
                Take another diagnostic test to measure if your weak topics moved into the Strong (🟢) zone.
              </p>
            </div>
            <button
              onClick={onRetest}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Launch Next Retest</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
