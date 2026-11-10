import React, { useState } from 'react';
import {
  Stethoscope,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Student } from '../types';

interface OnboardingPageProps {
  student: Student;
  onComplete: (updated: Student) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ student, onComplete }) => {
  const [targetSubject, setTargetSubject] = useState(student.target_subject || 'Physics');
  const [examName, setExamName] = useState(student.exam_name || '');
  const [examDate, setExamDate] = useState(student.exam_date || '');
  const [dailyHours, setDailyHours] = useState(student.daily_study_hours || 2.0);
  const [prepDays, setPrepDays] = useState(student.prep_duration_days || 5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await apiClient.completeOnboarding({
        student_id: student.id,
        target_subject: targetSubject.trim() || 'General Studies',
        exam_name: examName.trim() || undefined,
        exam_date: examDate || undefined,
        daily_study_hours: dailyHours,
        prep_duration_days: prepDays,
      });
      onComplete(updated);
    } catch (err) {
      console.error(err);
      // Fallback
      onComplete({
        ...student,
        target_subject: targetSubject,
        exam_name: examName,
        daily_study_hours: dailyHours,
        prep_duration_days: prepDays,
        onboarding_completed: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      
      {/* Brand & Stepper */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Step 1 of 1: Personalizing Your Study Doctor</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          What Are You Preparing For?
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We customize your diagnostic quiz questions and revision schedule based on your target exam and study availability.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Subject / Course */}
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Primary Subject or Course <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  placeholder="e.g. College Physics, Cell Biology, Operating Systems"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                You can upload syllabus and notes for this subject on the next screen.
              </p>
            </div>

            {/* Optional Exam Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Examination Name (Optional)
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Midterm, Finals, MCAT"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Available Daily Study Hours */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Available Daily Study Time:</span>
                </span>
                <span className="font-bold text-indigo-600 font-mono text-sm">{dailyHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>30 min/day</span>
                <span>2 hrs/day</span>
                <span>6 hrs/day</span>
              </div>
            </div>

            {/* Preparation Duration Days */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-600" />
                  <span>Target Revision Window:</span>
                </span>
                <span className="font-bold text-violet-600 font-mono text-sm">{prepDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={prepDays}
                onChange={(e) => setPrepDays(parseInt(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 day (Rapid Cram)</span>
                <span>5 days (Recommended)</span>
                <span>14 days (Deep Mastery)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !targetSubject.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Setting Up Workspace...' : 'Complete Setup & Open Dashboard'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

