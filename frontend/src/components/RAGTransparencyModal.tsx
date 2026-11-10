import React from 'react';
import { X, Database, ArrowRight, ShieldCheck, CheckCircle2, FileText, Cpu, BookOpen } from 'lucide-react';

interface RAGTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RAGTransparencyModal: React.FC<RAGTransparencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Architecture: Retrieval vs Generation Boundary</h2>
              <p className="text-xs text-slate-400">Strict separation preventing AI hallucinations with verifiable source citations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Architecture Pipeline Diagram */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Pipeline Data Flow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              
              {/* Step 1: Retrieval */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Phase 1: Retrieval
                  </span>
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Deterministic Search</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts raw chunks from the student's syllabus & textbook notes. Runs TF-IDF & vector cosine ranking.
                </p>
                <div className="mt-3 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-blue-300 font-mono">
                  No LLM used here. 0% hallucination risk.
                </div>
              </div>

              {/* Step 2: Boundary Wall */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Phase 2: Context Injection
                  </span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Provenance & Citations</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only the top ranked chunks with explicit tags (e.g. <code>Chapter 3, Sec 2</code>) are injected into the system prompt.
                </p>
                <div className="mt-3 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-mono">
                  Strict boundary: Model instructed to cite only injected chunks.
                </div>
              </div>

              {/* Step 3: Generation */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Phase 3: Generation
                  </span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Groq LLM Synthesis</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Groq formats pedagogical MCQs, explains why wrong choices are incorrect, and drafts the personalized revision plan.
                </p>
                <div className="mt-3 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono">
                  Grounded strictly in injected citations.
                </div>
              </div>

            </div>
          </div>

          {/* Feature Matrix: Retrieval vs Generation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Feature-by-Feature Separation Matrix</h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3 text-blue-400">Where Retrieval Is Used</th>
                    <th className="p-3 text-emerald-400">Where Generation Is Used</th>
                    <th className="p-3 text-slate-300">How Separation Is Kept</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-400">
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-slate-200">1. Topic Map</td>
                    <td className="p-3">Extracts raw text hierarchy from Syllabus & past papers</td>
                    <td className="p-3">Groq organizes subtopics & counts frequency</td>
                    <td className="p-3">Syllabus text is fed directly without conversational memory</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-slate-200">2. Diagnostic Quiz</td>
                    <td className="p-3">TF-IDF retrieves exact chapter chunks per topic</td>
                    <td className="p-3">Groq drafts 4 options and reasoning</td>
                    <td className="p-3">Mandatory <code>source_citation</code> field verified against chunk metadata</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-slate-200">3. Answer Evaluation</td>
                    <td className="p-3">Compares selected answer against verified key</td>
                    <td className="p-3">Synthesizes "why you were wrong" explanation</td>
                    <td className="p-3">Score calculation is 100% mathematical (no LLM grading drift)</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-slate-200">4. Gap Report (🔴 🟡 🟢)</td>
                    <td className="p-3">Aggregates quantitative scores by topic</td>
                    <td className="p-3">Generates clinical "Doctor's Diagnosis" summary</td>
                    <td className="p-3">Thresholds (&lt;50% Weak, 50-79% Medium, &gt;=80% Strong) are hardcoded</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-slate-200">5. "Explain Topic" Chat</td>
                    <td className="p-3">Queries study materials for top 3 matching snippets</td>
                    <td className="p-3">Synthesizes tailored pedagogical explanation</td>
                    <td className="p-3">Explicit guardrail prompt: Refuses to answer if snippet lacks info</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Got it, close inspector
          </button>
        </div>

      </div>
    </div>
  );
};

