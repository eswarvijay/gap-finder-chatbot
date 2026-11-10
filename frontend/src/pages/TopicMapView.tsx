import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  Layers,
  FileQuestion,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { apiClient } from '../api/client';
import { TopicMapItem, Student } from '../types';

interface TopicMapViewProps {
  student: Student;
  currentSubject: string;
  setCurrentSubject: (subj: string) => void;
  onNavigateNext: () => void;
}

export const TopicMapView: React.FC<TopicMapViewProps> = ({
  student,
  currentSubject,
  setCurrentSubject,
  onNavigateNext,
}) => {
  const [topics, setTopics] = useState<TopicMapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTopicMap();
  }, [student.id]);

  const fetchTopicMap = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTopicMap(student.id);
      if (data) {
        setTopics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.generateTopicMap(student.id, currentSubject || 'General Studies');
      if (res.topic_map && res.topic_map.topic_data) {
        setTopics(res.topic_map.topic_data);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate topic map.');
    } finally {
      setGenerating(false);
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">High Yield</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium Yield</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/30">Standard</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Blueprint Extraction</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Curriculum Topic Map & Exam Weightage
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Groq extracts the hierarchical syllabus structure from your uploaded files and cross-references past question papers to compute exam frequencies and priority weightages.
          </p>
        </div>

        {/* Dynamic Subject & Generate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              placeholder="Subject / Course"
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 font-semibold"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{generating ? 'Analyzing with Groq...' : 'Generate Topic Map'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-xs text-slate-400">Loading topic hierarchy...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Topic Map Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Generate Topic Map" to parse your uploaded syllabus or curriculum and link past paper frequencies dynamically.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            {generating ? 'Analyzing...' : 'Generate Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Identified Topics</span>
              <span className="text-xl font-extrabold text-white font-mono">{topics.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">High-Yield Units</span>
              <span className="text-xl font-extrabold text-rose-400 font-mono">
                {topics.filter((t) => t.importance?.toLowerCase() === 'high').length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Total Subtopics</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {topics.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Exam Correlation</span>
              <span className="text-xl font-extrabold text-indigo-400 font-mono">Dynamic</span>
            </div>
          </div>

          {/* Topic Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t, idx) => (
              <div
                key={t.id || idx}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Topic {idx + 1}</span>
                    <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {getImportanceBadge(t.importance)}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                {/* Subtopics Pills */}
                {t.subtopics && t.subtopics.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Key Subtopics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.subtopics.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weightage & Frequency Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Past Exams:</span>
                    <span className="text-slate-200 font-semibold font-mono">
                      {t.exam_frequency} {t.exam_frequency === 1 ? 'Frequency' : 'Frequencies'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400">Weightage:</span>
                    <span className="font-bold text-emerald-400 font-mono">{t.exam_weightage_pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Proceed CTA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ready for your Diagnostic Checkup?</h4>
              <p className="text-xs text-slate-400">
                GapFinder AI will now synthesize grounded diagnostic questions with exact citations from these topics.
              </p>
            </div>
            <button
              onClick={onNavigateNext}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <span>Step 3: Take Diagnostic Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
