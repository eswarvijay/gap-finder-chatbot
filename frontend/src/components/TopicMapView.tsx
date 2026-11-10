import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  BookOpen,
  FileText,
  AlertCircle,
  HelpCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { TopicMapItem, Student, StudyMaterial } from '../types';

interface TopicMapViewProps {
  topicMap: TopicMapItem[] | null;
  student: Student | null;
  targetSubject: string;
  materials: StudyMaterial[];
  onGenerateMap: (subject: string) => Promise<void>;
  onTestTopic: (topicName: string) => void;
  loading?: boolean;
}

export const TopicMapView: React.FC<TopicMapViewProps> = ({
  topicMap,
  student,
  targetSubject,
  materials,
  onGenerateMap,
  onTestTopic,
  loading = false,
}) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateMap(targetSubject);
    } finally {
      setGenerating(false);
    }
  };

  const topics = topicMap || [];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-400 border border-teal-800/50">
                  Curriculum Breakdown & Exam Weightages
                </span>
                <span className="text-xs text-slate-400">
                  {topics.length} Topics Extracted
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Syllabus Topic Map</h1>
              <p className="text-xs text-slate-400">
                Extracted structure and past-paper correlations for: <span className="text-emerald-400 font-semibold">{targetSubject}</span>
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{generating ? 'Analyzing Syllabus...' : 'Extract / Refresh Map'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Connects your uploaded course syllabus and past exam papers to highlight high-yield exam topics.
            </span>
          </div>
        </div>

        {/* Empty State */}
        {topics.length === 0 && !generating && (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Topic Map Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click <strong>"Extract / Refresh Map"</strong> above to parse your syllabus into structured subtopics and exam frequency weightages.
            </p>
          </div>
        )}

        {/* Topic Grid */}
        {topics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t, idx) => (
              <div
                key={t.id || idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>{t.name}</span>
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      t.importance === 'High'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 font-bold'
                        : t.importance === 'Medium'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {t.importance} Yield ({t.exam_weightage_pct || 15}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                  {/* Subtopics */}
                  {t.subtopics && t.subtopics.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Key Subtopics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.subtopics.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Past Exam Frequency: {t.exam_frequency || 4}x
                  </span>

                  <button
                    onClick={() => onTestTopic(t.name)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <span>Test This Topic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

