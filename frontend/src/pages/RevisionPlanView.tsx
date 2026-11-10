import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { apiClient } from '../api/client';
import { RevisionPlan, Student } from '../types';

interface RevisionPlanViewProps {
  student: Student;
  currentSubject: string;
  onNavigateToTutor: () => void;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({
  student,
  currentSubject,
  onNavigateToTutor,
}) => {
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Time customization inputs
  const [availableDays, setAvailableDays] = useState(5);
  const [dailyHours, setDailyHours] = useState(2.0);

  useEffect(() => {
    fetchActivePlan();
  }, [student.id]);

  const fetchActivePlan = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getActiveRevisionPlan(student.id);
      setPlan(data);
      if (data) {
        setAvailableDays(data.available_days);
        setDailyHours(data.daily_hours);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const newPlan = await apiClient.generateRevisionPlan(
        student.id,
        availableDays,
        dailyHours
      );
      setPlan(newPlan);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate revision plan.');
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority.includes('CRITICAL') || priority.includes('🔴')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">{priority}</span>;
    }
    if (priority.includes('HIGH')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">{priority}</span>;
    }
    if (priority.includes('CONFIDENCE') || priority.includes('🟢') || priority.includes('POLISH')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">{priority}</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">{priority}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Prioritized Adaptive Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Personalized Revision Treatment Plan
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Prioritizes your weakest high-yield topics first for {currentSubject || 'your exam'}, dynamically calibrated to your exact schedule and daily hours.
          </p>
        </div>

        {plan && (
          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Total Commitment:</span>
            <span className="font-bold text-white font-mono">{plan.total_hours} Hours</span>
          </div>
        )}
      </div>

      {/* Time Constraint Customization Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Available Days Before Exam
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={30}
                value={availableDays}
                onChange={(e) => setAvailableDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Daily Study Hours
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.5"
                min={0.5}
                max={12}
                value={dailyHours}
                onChange={(e) => setDailyHours(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">Hours/day</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pb-2">
            Total Target: <span className="font-bold text-white font-mono">{(availableDays * dailyHours).toFixed(1)} Hours</span>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{generating ? 'Calculating Schedule...' : 'Recalibrate Revision Plan'}</span>
          </button>
        </form>
      </div>

      {/* Main Plan Display */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-xs text-slate-400">Loading personalized revision plan...</p>
        </div>
      ) : !plan ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Revision Plan Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Recalibrate Revision Plan" above to create an optimized schedule targeting your diagnostic weak spots.
          </p>
          <button
            onClick={() => handleGeneratePlan()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Generate My Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Day Cards Timeline */}
          <div className="space-y-4">
            {plan.plan_schedule.map((day) => (
              <div
                key={day.day_number}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold font-mono text-xs flex items-center justify-center">
                      D{day.day_number}
                    </span>
                    <h3 className="text-sm font-bold text-white">{day.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Allocated: {day.total_hours} Hours</span>
                  </div>
                </div>

                {/* Tasks inside this day */}
                <div className="space-y-3">
                  {day.tasks.map((task, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-white">{task.topic}</span>
                          {getPriorityBadge(task.priority)}
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {task.time_allocation}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong className="text-slate-200">Action:</strong> {task.action}
                        </p>

                        <div className="text-[11px] text-emerald-400/90 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Milestone: {task.milestone}</span>
                        </div>
                      </div>

                      <button
                        onClick={onNavigateToTutor}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold border border-slate-800 transition-colors flex-shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI Doctor</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Have questions about any milestone?</h4>
              <p className="text-xs text-slate-400">
                Ask the AI Study Doctor to explain any concept, formula, or problem step-by-step.
              </p>
            </div>
            <button
              onClick={onNavigateToTutor}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open AI Study Doctor Chat</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
