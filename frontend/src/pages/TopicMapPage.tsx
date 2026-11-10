import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TopicMapItem, Student, StudyMaterial, GapReport } from '../types';

interface TopicMapPageProps {
  student: Student;
  topicMap: TopicMapItem[] | null;
  materials: StudyMaterial[];
  targetSubject: string;
  gapReport: GapReport | null;
  onGenerateMap: (subject: string) => Promise<void>;
  onTestTopic: (topicName: string) => void;
}

export const TopicMapPage: React.FC<TopicMapPageProps> = ({
  student,
  topicMap,
  materials,
  targetSubject,
  gapReport,
  onGenerateMap,
  onTestTopic,
}) => {
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicMapItem | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateMap(targetSubject);
    } finally {
      setGenerating(false);
    }
  };

  const topics = topicMap || [];
  const breakdown = gapReport?.topic_breakdown || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Curriculum Architecture
            </span>
            <span className="text-xs text-slate-400">{topics.length} Topics Extracted</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Syllabus Topic Map</h1>
          <p className="text-xs text-slate-500">
            Structural hierarchy and exam weightages extracted from: <strong className="text-slate-800">{targetSubject}</strong>
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{generating ? 'Analyzing Curriculum...' : 'Extract / Refresh Topic Map'}</span>
        </button>
      </div>

      {/* Main Grid: Topic Hierarchy + Details Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Structured Topic Cards */}
        <div className="lg:col-span-2 space-y-4">
          {topics.length === 0 && !generating && (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Topic Map Extracted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Extract / Refresh Topic Map" to parse your syllabus into structured chapters, subtopics, and exam weightages.
              </p>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Extract Topic Map Now
              </button>
            </div>
          )}

          {topics.map((t, idx) => {
            const diag = breakdown[t.name];
            const isSelected = selectedTopic?.name === t.name;

            return (
              <div
                key={t.id || idx}
                onClick={() => setSelectedTopic(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-4">{t.description}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      t.importance === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : t.importance === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.importance} Yield ({t.exam_weightage_pct || 15}%)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Past Papers: {t.exam_frequency || 3}x
                    </span>
                  </div>
                </div>

                {/* Subtopics Pills */}
                {t.subtopics && t.subtopics.length > 0 && (
                  <div className="pl-4 pt-1 flex flex-wrap gap-1.5">
                    {t.subtopics.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer with Mastery & Test Trigger */}
                <div className="pl-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {diag ? (
                      <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                        diag.status === 'strong'
                          ? 'bg-emerald-100 text-emerald-800'
                          : diag.status === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {diag.status === 'strong' ? '🟢 Mastered' : diag.status === 'medium' ? '🟡 Medium' : '🔴 Weak'} ({diag.score}%)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not yet diagnosed</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestTopic(t.name);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                  >
                    <span>Test This Topic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Interactive Detail & Learning Resources */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-20">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Topic Inspector</span>
              <h3 className="font-bold text-base text-slate-900 mt-0.5">
                {selectedTopic ? selectedTopic.name : 'Select a topic to view details'}
              </h3>
            </div>

            {selectedTopic ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Syllabus Scope:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedTopic.description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Exam Weightage:</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedTopic.exam_weightage_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Past Question Frequency:</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedTopic.exam_frequency} questions found</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Yield Priority:</span>
                    <span className="font-bold text-indigo-600 font-mono">{selectedTopic.importance}</span>
                  </div>
                </div>

                {selectedTopic.subtopics && selectedTopic.subtopics.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block">Covered Subtopics:</span>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600">
                      {selectedTopic.subtopics.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => onTestTopic(selectedTopic.name)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Run Focused Diagnostic Quiz on {selectedTopic.name}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <p>Click on any topic card from the syllabus list on the left to inspect its exam yield and subtopics.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

