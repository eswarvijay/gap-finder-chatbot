import React, { useState } from 'react';
import {
  Stethoscope,
  LayoutDashboard,
  FolderOpen,
  Layers,
  HelpCircle,
  Activity,
  Calendar,
  MessageSquare,
  TrendingUp,
  User,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  GraduationCap,
  Cpu,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Student, StudyMaterial } from '../types';

interface DashboardLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  student: Student;
  targetSubject: string;
  materials: StudyMaterial[];
  backendOnline: boolean | null;
  onOpenRAGModal: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigate,
  student,
  targetSubject,
  materials,
  backendOnline,
  onOpenRAGModal,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'materials', label: 'My Materials', icon: FolderOpen, badge: materials.length },
    { id: 'topic_map', label: 'Topic Map', icon: Layers },
    { id: 'quiz', label: 'Diagnostic Assessment', icon: HelpCircle, highlight: true },
    { id: 'gap_analysis', label: 'Gap Analysis', icon: Activity, pill: '🔴 🟡 🟢' },
    { id: 'revision_plan', label: 'Revision Roadmap', icon: Calendar },
    { id: 'ai_tutor', label: 'AI Study Assistant', icon: MessageSquare },
    { id: 'progress', label: 'Progress & Mastery', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* SaaS Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-30 ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16 overflow-hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4">
          <div
            onClick={() => onNavigate('overview')}
            className="flex items-center space-x-2.5 cursor-pointer truncate"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <span className="text-base font-black tracking-tight text-slate-900">GapFinder<span className="text-indigo-600">.AI</span></span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase leading-none">Diagnostic Platform</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Active Subject Indicator */}
        {sidebarOpen && (
          <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Subject</span>
            <div className="flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="font-bold text-xs text-slate-800 truncate">{targetSubject || 'General Studies'}</span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title={item.label}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>

                {sidebarOpen && (
                  <div className="flex items-center space-x-1">
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.pill && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                        {item.pill}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1.5">
          {sidebarOpen && (
            <button
              onClick={onOpenRAGModal}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>RAG Inspector</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Workspace:</span>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                {targetSubject}
              </span>
              {backendOnline === true && (
                <span className="hidden md:inline-flex items-center space-x-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Groq AI Online</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Diagnostic Quiz CTA */}
            <button
              onClick={() => onNavigate('quiz')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Take Diagnostic Quiz</span>
            </button>

            {/* Profile Pill */}
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <img
                src={student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.full_name}`}
                alt={student.full_name}
                className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200"
              />
              <div className="hidden lg:block text-left pr-1">
                <span className="font-bold text-xs text-slate-800 block leading-tight">{student.full_name}</span>
                <span className="text-[10px] text-slate-400 leading-none">{student.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content View */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>

      </div>
    </div>
  );
};

