import React from 'react';
import {
  Stethoscope,
  MessageSquare,
  Activity,
  HelpCircle,
  Calendar,
  Layers,
  TrendingUp,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { Student } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  student: Student | null;
  targetSubject: string;
  backendOnline: boolean | null;
  onOpenRAGModal: () => void;
  onOpenDemoModal: () => void;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  student,
  targetSubject,
  backendOnline,
  onOpenRAGModal,
  onOpenDemoModal,
  onOpenUploadModal,
}) => {
  const navItems = [
    { id: 'chat', label: '💬 AI Study Doctor', icon: MessageSquare },
    { id: 'gap_report', label: '🩺 Gap Report (🔴 🟡 🟢)', icon: Activity },
    { id: 'quiz', label: '📝 Diagnostic Quiz', icon: HelpCircle },
    { id: 'revision_plan', label: '📅 Revision Plan', icon: Calendar },
    { id: 'progress', label: '📈 Progress', icon: TrendingUp },
    { id: 'topic_map', label: '🗺️ Topic Map', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Subject Badge */}
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => setActiveTab('chat')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white flex-shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">GapFinder<span className="text-emerald-400">.AI</span></span>
                  <span className="text-[9px] font-semibold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-800/60 uppercase">
                    PS 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Target Subject Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 text-[11px] font-semibold">{targetSubject}</span>
            </div>

            {backendOnline === true && (
              <span className="hidden md:inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span>🟢 Groq Active</span>
              </span>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* RAG Inspector Button */}
            <button
              onClick={onOpenRAGModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/50 transition-colors shadow-sm"
              title="View RAG Architecture & Citations Proof"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="hidden xl:inline">RAG Inspector</span>
            </button>

            {/* Student Profile / Demo Switcher */}
            {student && (
              <button
                onClick={onOpenDemoModal}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                title="Switch demo account (For Hackathon Judges)"
              >
                <img
                  src={student.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'}
                  alt={student.full_name}
                  className="w-6 h-6 rounded-lg bg-slate-800 border border-emerald-500/40"
                />
                <div className="hidden sm:block text-left pr-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-semibold text-slate-200 leading-none truncate max-w-[100px]">{student.full_name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </div>
                  <span className="text-[9px] text-emerald-400/90 font-mono">Judge / Demo</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-1.5 space-x-1 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
