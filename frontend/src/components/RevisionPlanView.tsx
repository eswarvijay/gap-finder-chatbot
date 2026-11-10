import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import { RevisionPlan, GapReport } from '../types';

interface RevisionPlanViewProps {
  plan: RevisionPlan | null;
  gapReport: GapReport | null;
  targetSubject: string;
  onGeneratePlan: (days: number, dailyHours: number) => Promise<void>;
  onRetest: () => void;
  loading?: boolean;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({
  plan,
  gapReport,
  targetSubject,
  onGeneratePlan,
  onRetest,
  loading = false,
}) => {
  const [days, setDays] = useState(plan?.available_days || 5);
  const [dailyHours, setDailyHours] = useState(plan?.daily_hours || 2.0);
  const [generating, setGenerating] = useState(false);

  const handleUpdate = async () => {
    setGenerating(true);
    try {
      await onGeneratePlan(days, dailyHours);
    } finally {
      setGenerating(false);
    }
  };

  const schedule = plan?.plan_schedule || [];
  const totalHours = (days * dailyHours).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header & Constraint Configuration Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
                  Adaptive Prescription
                </span>
                <span className="text-xs text-slate-400">
                  Prioritizes: 🔴 Weakest + High Exam-Yield First
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Personalized Revision Treatment Plan</h1>
              <p className="text-xs text-slate-400">Subject: <span className="text-emerald-400 font-semibold">{targetSubject}</span></p>
            </div>

            <button
              onClick={onRetest}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retest to Update Plan</span>
            </button>
          </div>

          {/* Interactive Sliders for Time Allocation ("I have 5 days, 2 hours a day") */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Available Revision Days:</span>
                </span>
                <span className="font-bold text-white font-mono text-sm">{days} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 day (Cram)</span>
                <span>7 days (Standard)</span>
                <span>14 days (Deep)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daily Study Time:</span>
                </span>
                <span className="font-bold text-white font-mono text-sm">{dailyHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>30 min</span>
                <span>2.0 hrs</span>
                <span>6.0 hrs</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold">Total Target Commitment</span>
                <p className="text-xl font-black text-white">{totalHours} Hours</p>
                <p className="text-[10px] text-slate-400">Paced revision across {days} days</p>
              </div>

              <button
                onClick={handleUpdate}
                disabled={generating || loading}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{generating ? 'Re-optimizing...' : 'Re-calculate Schedule'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daily Paced Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Day-by-Day Prioritized Revision Schedule</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-adapts as quiz scores improve
            </span>
          </div>

          {schedule.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Click "Re-calculate Schedule" above to generate your customized plan!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {schedule.map((dayItem, dIdx) => (
                <div
                  key={dIdx}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-bold text-xs flex items-center justify-center font-mono">
                        D{dayItem.day_number}
                      </div>
                      <span className="text-sm font-bold text-white">{dayItem.title || `Day ${dayItem.day_number}`}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                        ⏱️ {dayItem.total_hours} hrs
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {dayItem.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{task.topic}</span>
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            task.priority.includes('CRITICAL') || task.priority.includes('Weak')
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 font-bold'
                              : task.priority.includes('HIGH')
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60 font-medium'
                              : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 pl-3.5">
                          <strong>Action:</strong> {task.action}
                        </p>

                        {task.milestone && (
                          <div className="pl-3.5 text-[11px] text-emerald-400/90 font-mono flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>Milestone: {task.milestone}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

