import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Sparkles,
  GraduationCap,
  Atom,
  Dna,
  Cpu,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { Student } from '../types';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  onSelectStudent: (email: string, fullName: string) => Promise<void>;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSelectStudent,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const demoProfiles = [
    {
      id: 'alex',
      name: 'Alex Mercer (Demo Student)',
      email: 'demo.student@gapfinder.ai',
      subject: 'Computer Science & OS',
      role: 'Hackathon Judge Account',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-500',
    },
    {
      id: 'jordan',
      name: 'Jordan Lee',
      email: 'jordan.lee@gapfinder.ai',
      subject: 'College Physics & Mechanics',
      role: 'Engineering Aspirant',
      icon: Atom,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@gapfinder.ai',
      subject: 'Cell Biology & Genetics',
      role: 'Medical Entrance Aspirant',
      icon: Dna,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const handleSelect = async (email: string, name: string) => {
    setLoading(true);
    try {
      await onSelectStudent(email, name);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;
    await handleSelect(customEmail, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Student Account & Demo Switcher</h3>
              <p className="text-[11px] text-slate-400">Pre-seeded accounts for Hackathon evaluators & judges</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pre-configured Demo Accounts */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            1-Click Demo Profiles (For Judges & Testers):
          </span>

          {demoProfiles.map((p) => {
            const Icon = p.icon;
            const isSelected = currentStudent?.email === p.email;

            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.email, p.name)}
                disabled={loading}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                        {p.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 block font-mono">{p.subject}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && <span className="text-[10px] font-mono text-emerald-400 font-bold">Active</span>}
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Or Login with Custom Student Credentials:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your Full Name"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="student@school.edu"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !customEmail.trim() || !customName.trim()}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-40"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login Custom Student</span>
          </button>
        </form>
      </div>
    </div>
  );
};

