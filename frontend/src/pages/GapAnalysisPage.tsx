import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  RotateCcw,
  MessageSquare,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { Student, GapReport } from '../types';

interface GapAnalysisPageProps {
  student: Student;
  gapReport: GapReport | null;
  onNavigate: (tab: string, context?: any) => void;
  onStartQuizForTopic: (topic: string) => void;
}

export const GapAnalysisPage: React.FC<GapAnalysisPageProps> = ({
  student,
  gapReport,
  onNavigate,
  onStartQuizForTopic
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'weak' | 'medium' | 'strong'>('all');

  if (!gapReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">No Knowledge Gap Diagnosis Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Take a diagnostic assessment so the Study Doctor can test your understanding and pinpoint your exact blind spots.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Take Diagnostic Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = gapReport.topic_breakdown || {};
  const weakTopics = gapReport.weak_topics || [];
  const mediumTopics = gapReport.medium_topics || [];
  const strongTopics = gapReport.strong_topics || [];

  const totalTopics = Object.keys(breakdown).length || (weakTopics.length + mediumTopics.length + strongTopics.length);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Diagnosis Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Diagnostic Knowledge Report
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Knowledge Gap Diagnosis</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              "The Study Doctor" has evaluated your responses against syllabus standards to identify what you actually
              do not know, so you don't waste time revising what you've already mastered.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('revision_plan')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Personalized Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor Summary Note */}
        {gapReport.doctor_summary && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Doctor's Clinical Diagnosis
              </span>
              <p className="text-sm font-medium text-indigo-950 mt-1 leading-relaxed">
                {gapReport.doctor_summary}
              </p>
            </div>
          </div>
        )}

        {/* 3 Pill Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Assessment Score</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {Math.round(gapReport.overall_score)}%
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {gapReport.correct_count} of {gapReport.total_questions} correct
            </p>
          </div>

          <div
            onClick={() => setFilterTab('weak')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              filterTab === 'weak' ? 'bg-rose-100/70 border-rose-400' : 'bg-rose-50 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <span className="text-xs font-bold text-rose-700 uppercase">🔴 Weak Topics</span>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{weakTopics.length}</p>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">Urgent revision required</p>
          </div>

          <div
            onClick={() => setFilterTab('medium')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              filterTab === 'medium' ? 'bg-amber-100/70 border-amber-400' : 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <span className="text-xs font-bold text-amber-700 uppercase">🟡 Moderate Topics</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{mediumTopics.length}</p>
            <p className="text-xs text-amber-700 mt-0.5 font-medium">Practice & review</p>
          </div>

          <div
            onClick={() => setFilterTab('strong')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              filterTab === 'strong' ? 'bg-emerald-100/70 border-emerald-400' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            <span className="text-xs font-bold text-emerald-700 uppercase">🟢 Strong Topics</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{strongTopics.length}</p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium">Exam ready</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: `All Topics (${totalTopics})` },
          { key: 'weak', label: `🔴 Weak (${weakTopics.length})` },
          { key: 'medium', label: `🟡 Moderate (${mediumTopics.length})` },
          { key: 'strong', label: `🟢 Strong (${strongTopics.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topics Detailed Cards Grid */}
      <div className="space-y-4">
        {Object.entries(breakdown)
          .filter(([topic, info]: [string, any]) => {
            const status = info.status || (info.score < 50 ? 'weak' : info.score < 75 ? 'medium' : 'strong');
            if (filterTab === 'weak') return status === 'weak' || weakTopics.includes(topic);
            if (filterTab === 'medium') return status === 'medium' || mediumTopics.includes(topic);
            if (filterTab === 'strong') return status === 'strong' || strongTopics.includes(topic);
            return true;
          })
          .map(([topicName, info]: [string, any]) => {
            const score = info.score !== undefined ? info.score : 0;
            const status = info.status || (score < 50 ? 'weak' : score < 75 ? 'medium' : 'strong');

            const isWeak = status === 'weak' || weakTopics.includes(topicName);
            const isMedium = status === 'medium' || mediumTopics.includes(topicName);
            const isStrong = status === 'strong' || strongTopics.includes(topicName);

            let statusColor = 'border-emerald-200 bg-emerald-50/20';
            let statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            let barColor = 'bg-emerald-500';

            if (isWeak) {
              statusColor = 'border-rose-200 bg-rose-50/20';
              statusBadge = 'bg-rose-50 text-rose-800 border-rose-200';
              barColor = 'bg-rose-500';
            } else if (isMedium) {
              statusColor = 'border-amber-200 bg-amber-50/20';
              statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
              barColor = 'bg-amber-500';
            }

            return (
              <div
                key={topicName}
                className={`p-6 rounded-2xl border bg-white shadow-sm space-y-4 transition-all hover:shadow-md ${statusColor}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase ${statusBadge}`}>
                        {status}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{topicName}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">{Math.round(score)}% Mastery</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {info.correct_questions !== undefined
                          ? `${info.correct_questions} / ${info.total_questions || 1} correct`
                          : 'Evaluated'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
                </div>

                {/* Reason & diagnosis */}
                {info.reason && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      Root Cause of Gap:
                    </span>
                    <p className="leading-relaxed">{info.reason}</p>
                  </div>
                )}

                {/* Recommended focus */}
                {info.recommended_focus && (
                  <p className="text-xs text-slate-500 font-medium">
                    <strong className="text-slate-700">Recommended Action:</strong> {info.recommended_focus}
                  </p>
                )}

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    Priority: {isWeak ? '🔴 High (Focus First)' : isMedium ? '🟡 Moderate (Practice)' : '🟢 Safe'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('ai_tutor', { initialMessage: `Explain the key concepts of ${topicName} from my notes and why I might have gotten questions wrong.` })}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      Explain with AI Tutor
                    </button>

                    <button
                      onClick={() => onStartQuizForTopic(topicName)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Test Only This Topic
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

