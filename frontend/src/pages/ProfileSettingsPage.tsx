import React, { useState } from 'react';
import {
  User,
  Mail,
  BookOpen,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  LogOut,
  Cpu,
  Layers,
  Database,
  Sparkles,
  Shield,
  Loader2
} from 'lucide-react';
import { Student } from '../types';
import { apiClient } from '../api/client';

interface ProfileSettingsPageProps {
  student: Student;
  onProfileUpdated: (student: Student) => void;
  onSwitchDemo: (email: string, name: string) => void;
  onLogout: () => void;
  onOpenRAGTransparency?: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  student,
  onProfileUpdated,
  onSwitchDemo,
  onLogout,
  onOpenRAGTransparency
}) => {
  const [fullName, setFullName] = useState(student.full_name || '');
  const [targetSubject, setTargetSubject] = useState(student.target_subject || 'Physics');
  const [examName, setExamName] = useState(student.exam_name || 'Final Semester Exam');
  const [examDate, setExamDate] = useState(student.exam_date || '2026-05-15');
  const [dailyHours, setDailyHours] = useState<number>(student.daily_study_hours || 2.0);
  const [prepDays, setPrepDays] = useState<number>(student.prep_duration_days || 7);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      const updated = await apiClient.updateProfile(student.id, {
        full_name: fullName,
        target_subject: targetSubject,
        exam_name: examName,
        exam_date: examDate,
        daily_study_hours: dailyHours,
        prep_duration_days: prepDays
      });
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const demoAccounts = [
    {
      name: 'Alex Mercer',
      email: 'demo.student@gapfinder.ai',
      role: 'Physics & Mechanics Aspirant',
      subject: 'Physics'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@gapfinder.ai',
      role: 'Computer Science & Algorithms Aspirant',
      subject: 'Computer Science'
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@gapfinder.ai',
      role: 'Biology & Life Sciences Aspirant',
      subject: 'Biology'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
              {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{fullName || 'Student'}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {student.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3 h-3" />
                Target Subject: {targetSubject}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">Study Profile & Exam Settings</h2>

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile updated successfully!
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Subject
              </label>
              <input
                type="text"
                required
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Daily Study Hours ({dailyHours} hrs)
              </label>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Preparation Duration ({prepDays} days)
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={prepDays}
                onChange={(e) => setPrepDays(parseInt(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Demo Switcher for Hackathon Judges */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Demo Persona Switcher (For Evaluation & Testing)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch immediately between sample students with real indexed materials, past papers, and diagnoses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {demoAccounts.map((acc) => {
            const isActive = student.email === acc.email;

            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => onSwitchDemo(acc.email, acc.name)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{acc.name}</span>
                    {isActive && (
                      <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{acc.role}</p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 mt-3 block">
                  Subject: {acc.subject}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Architecture & RAG Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Backend AI & Database Architecture
          </h2>
          {onOpenRAGTransparency && (
            <button
              onClick={onOpenRAGTransparency}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              Open Technical Transparency View &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Database Engine</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-slate-800">Supabase PostgreSQL</strong>
            </div>
            <p className="text-slate-500 text-[11px] mt-1">7 relational tables with Foreign Keys</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Vector Embeddings</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-slate-800">384-Dim pgvector</strong>
            </div>
            <p className="text-slate-500 text-[11px] mt-1">L2-normalized cosine chunk retrieval</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">LLM Reasoning Engine</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-slate-800">Groq (Llama-3.3-70B)</strong>
            </div>
            <p className="text-slate-500 text-[11px] mt-1">Sub-second generation latency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

