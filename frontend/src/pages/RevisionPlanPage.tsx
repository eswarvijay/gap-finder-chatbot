import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, RevisionPlan } from '../types';
import { apiClient } from '../api/client';

interface RevisionPlanPageProps {
  student: Student;
  revisionPlan: RevisionPlan | null;
  onNavigate: (tab: string, context?: any) => void;
  onPlanUpdated: (plan: RevisionPlan) => void;
}

export const RevisionPlanPage: React.FC<RevisionPlanPageProps> = ({
  student,
  revisionPlan,
  onNavigate,
  onPlanUpdated
}) => {
  const [availableDays, setAvailableDays] = useState<number>(revisionPlan?.available_days || student.prep_duration_days || 5);
  const [dailyHours, setDailyHours] = useState<number>(revisionPlan?.daily_hours || student.daily_study_hours || 2.0);
  const [generating, setGenerating] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const plan = await apiClient.generateRevisionPlan(student.id, availableDays, dailyHours);
      onPlanUpdated(plan);
    } catch (err: any) {
      console.error('Failed to generate revision plan:', err);
      alert('Could not generate revision plan. Please complete a diagnostic quiz first.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (dayNumber: number, taskIndex: number, currentCompleted: boolean) => {
    if (!revisionPlan) return;
    const taskKey = `${dayNumber}-${taskIndex}`;
    setTogglingTaskId(taskKey);

    try {
      const nextCompleted = !currentCompleted;
      const res = await apiClient.toggleRevisionTask(
        student.id,
        revisionPlan.id,
        dayNumber,
        taskIndex,
        nextCompleted
      );

      if (res && res.revision_plan) {
        onPlanUpdated(res.revision_plan);
        if (nextCompleted) {
          confetti({
            particleCount: 40,
            spread: 45,
            origin: { y: 0.7 }
          });
        }
      }
    } catch (err) {
      console.error('Error toggling revision task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Compute total and completed tasks
  let totalTasks = 0;
  let completedTasks = 0;
  if (revisionPlan?.plan_schedule) {
    for (const day of revisionPlan.plan_schedule) {
      for (const t of day.tasks || []) {
        totalTasks += 1;
        if (t.completed) completedTasks += 1;
      }
    }
  }
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!revisionPlan || !revisionPlan.plan_schedule || revisionPlan.plan_schedule.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">No Revision Treatment Plan Active</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Generate your personalized revision roadmap. GapFinder will prioritize your diagnosed weak topics first to maximize exam readiness.
          </p>

          <div className="max-w-md mx-auto pt-4 space-y-4 text-left">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Available Days Until Exam</span>
                <span className="text-indigo-600">{availableDays} days</span>
              </div>
              <input
                type="range"
                min="2"
                max="21"
                value={availableDays}
                onChange={(e) => setAvailableDays(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Daily Study Allocation</span>
                <span className="text-indigo-600">{dailyHours} hours/day</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <button
              disabled={generating}
              onClick={handleGeneratePlan}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Personalized Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Revision Roadmap
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner with Controls */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Prescribed Treatment Schedule
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Personalized Revision Plan</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Targeting diagnosed knowledge gaps first. Check off tasks as you complete them to track your revision velocity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Assessment
            </button>
          </div>
        </div>

        {/* Schedule Customization Sliders */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Timeline:</span>
              <span className="font-bold text-indigo-600">{availableDays} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="21"
              value={availableDays}
              onChange={(e) => setAvailableDays(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Daily Commitment:</span>
              <span className="font-bold text-indigo-600">{dailyHours} Hours/Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <button
              disabled={generating}
              onClick={handleGeneratePlan}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Adapting Schedule...
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Apply Schedule Adjustments
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">
              Revision Plan Completion ({completedTasks} / {totalTasks} Tasks Done)
            </span>
            <span className="text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Day by Day Plan Schedule */}
      <div className="space-y-6">
        {revisionPlan.plan_schedule.map((day) => {
          const dayTasks = day.tasks || [];
          const dayCompleted = dayTasks.filter((t) => t.completed).length;

          return (
            <div
              key={day.day_number}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    D{day.day_number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{day.title}</h3>
                    <p className="text-xs text-slate-500">
                      Target: {day.total_hours} Hours • {dayCompleted} of {dayTasks.length} tasks completed
                    </p>
                  </div>
                </div>

                {dayCompleted === dayTasks.length && dayTasks.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Day Complete
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {dayTasks.map((task, tIdx) => {
                  const isDone = !!task.completed;
                  const taskKey = `${day.day_number}-${tIdx}`;
                  const isToggling = togglingTaskId === taskKey;

                  const priorityBadge =
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : task.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <div
                      key={tIdx}
                      className={`p-5 transition flex items-start gap-4 ${
                        isDone ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleTask(day.day_number, tIdx, isDone)}
                        className={`mt-1 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 hover:border-indigo-500 bg-white'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        ) : isDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : null}
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                            {task.priority || 'Normal'} Priority
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {task.topic}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.time_allocation}
                          </span>
                        </div>

                        <p
                          className={`text-sm font-medium leading-relaxed ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.action}
                        </p>

                        {task.milestone && (
                          <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Goal: {task.milestone}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          onNavigate('ai_tutor', {
                            initialMessage: `Guide me through this revision task for ${task.topic}: "${task.action}". Break it down into clear steps from my study materials.`
                          })
                        }
                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/50 transition shrink-0"
                      >
                        Ask AI Tutor
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

