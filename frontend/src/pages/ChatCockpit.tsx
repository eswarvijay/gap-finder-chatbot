import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  BookOpen,
  Sparkles,
  Stethoscope,
  Activity,
  Calendar,
  HelpCircle,
  TrendingUp,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ChatMessage, Student, GapReport, StudyMaterial } from '../types';

interface ChatCockpitProps {
  student: Student;
  currentSubject: string;
  setCurrentSubject: (subj: string) => void;
  onNavigateToTab: (tab: string) => void;
  onTakeQuiz: () => void;
  onViewGapReport: () => void;
  onViewRevisionPlan: () => void;
}

export const ChatCockpit: React.FC<ChatCockpitProps> = ({
  student,
  currentSubject,
  setCurrentSubject,
  onNavigateToTab,
  onTakeQuiz,
  onViewGapReport,
  onViewRevisionPlan,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [latestReport, setLatestReport] = useState<GapReport | null>(null);
  
  // Dynamic Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'syllabus' | 'notes' | 'past_paper'>('notes');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCockpitData();
  }, [student.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadCockpitData = async () => {
    try {
      const [history, mats, rep] = await Promise.all([
        apiClient.getChatHistory(student.id),
        apiClient.getMaterials(student.id),
        apiClient.getLatestGapReport(student.id)
      ]);

      setMaterials(mats || []);
      setLatestReport(rep);

      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Dynamic initial greeting
        const greeting = `Hello ${student.full_name}! 👋 I am **GapFinder AI**, your personal **"Doctor for Studying"** powered by Groq.

### 🩺 How I Help You Ace Your Exams:
Most study tools wait for you to ask a question. **A student cannot ask about a gap they don't know they have.**

1. **Attach or Upload your Material** (Syllabus, Notes, or Past Question Papers).
2. Ask me to **test you with a Diagnostic Quiz** grounded in your materials.
3. I will diagnose your blindspots into **🔴 Weak**, **🟡 Medium**, and **🟢 Strong** topics.
4. I will prescribe your **Personalized Adaptive Revision Plan**.

What subject or exam are you preparing for today? You can type your topic, attach documents using the 📎 paperclip, or click a quick action below!`;

        setMessages([
          {
            id: 'welcome-dynamic',
            student_id: student.id,
            role: 'assistant',
            content: greeting,
            created_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load cockpit data:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      student_id: student.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.sendChatMessage(student.id, text, currentSubject);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        student_id: student.id,
        role: 'assistant',
        content: res.reply,
        citations: res.citations,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh diagnosis in background
      apiClient.getLatestGapReport(student.id).then((rep) => setLatestReport(rep));
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          student_id: student.id,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your query with Groq. Please check your network or try again.',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    setUploading(true);
    try {
      const res = await apiClient.uploadMaterialFile(
        student.id,
        uploadTitle,
        uploadType,
        uploadFile
      );

      setUploadModalOpen(false);
      setUploadTitle('');
      setUploadFile(null);

      const mats = await apiClient.getMaterials(student.id);
      setMaterials(mats);

      // Bot announces ingestion
      const notifyMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        student_id: student.id,
        role: 'assistant',
        content: `📄 **Successfully indexed "${res.material.title}"!**\n\nI have parsed and indexed this document into **${res.material.chunk_count} RAG chunks** with source citation tracking.\n\nYou can now ask me to:\n- 📝 *"Test me on this material"*\n- 🗺️ *"Extract the curriculum topic map"*\n- 💡 *"Explain any concept from this document"*`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, notifyMsg]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-fade-in">
      
      {/* Main Chat Interface (Center Stage) */}
      <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Chat Top Bar */}
        <div className="px-5 py-3.5 bg-slate-850/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">GapFinder Study Doctor</h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  Groq Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Diagnostic Knowledge Engine</p>
            </div>
          </div>

          {/* Dynamic Target Subject Control */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="text"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="Target Subject / Exam"
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-32 sm:w-40 font-medium"
              />
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            >
              <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attach File</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isCitationExpanded = expandedCitations[msg.id];

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-950 border border-indigo-500/30 text-indigo-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="max-w-[85%] sm:max-w-[80%] space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Citations Box for Assistant */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="bg-slate-950 border border-indigo-900/40 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCitation(msg.id)}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-indigo-300 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{msg.citations.length} Grounded Source Citation(s)</span>
                        </div>
                        {isCitationExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isCitationExpanded && (
                        <div className="p-3 border-t border-slate-900 space-y-2 bg-slate-950/80 text-[11px]">
                          {msg.citations.map((c, cIdx) => (
                            <div key={cIdx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                              <span className="font-bold text-indigo-300 font-mono block">
                                📌 {c.citation}
                              </span>
                              <p className="text-slate-400 italic font-mono text-[10px]">
                                "{c.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Consulting your materials with Groq LLM...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Quick Actions Chips */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-bold flex-shrink-0">Actions:</span>
          
          <button
            onClick={onTakeQuiz}
            className="px-3 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] font-semibold border border-emerald-800/60 whitespace-nowrap flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Diagnostic Test</span>
          </button>

          <button
            onClick={onViewGapReport}
            className="px-3 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[11px] font-semibold border border-rose-800/60 whitespace-nowrap flex items-center space-x-1"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Gap Report (🔴 🟡 🟢)</span>
          </button>

          <button
            onClick={onViewRevisionPlan}
            className="px-3 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 text-[11px] font-semibold border border-indigo-800/60 whitespace-nowrap flex items-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Adaptive Revision Plan</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Diagnose my weak spots in ${currentSubject} based on my uploaded materials.`)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 whitespace-nowrap"
          >
            "Diagnose my weak spots"
          </button>

          <button
            onClick={() => handleSendMessage(`Break down the key curriculum topics for ${currentSubject}.`)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 whitespace-nowrap"
          >
            "Break down topics"
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
              title="Attach study material (PDF or text)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask the Study Doctor about ${currentSubject}, or request a quiz/diagnosis...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 flex items-center justify-center shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Right Side: Live Diagnostic Cockpit & Uploaded Materials */}
      <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto">
        
        {/* Doctor's Active Diagnosis Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Diagnostic Diagnosis</h3>
            </div>
            {latestReport && (
              <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {latestReport.overall_score}% Mastery
              </span>
            )}
          </div>

          {!latestReport ? (
            <div className="text-center py-6 space-y-2">
              <Stethoscope className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-300">No Assessment Taken Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Generate a diagnostic quiz on {currentSubject} to find what you don't know.
              </p>
              <button
                onClick={onTakeQuiz}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Launch Diagnostic Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-slate-800">
                {latestReport.doctor_summary}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30">
                  <span className="text-[10px] text-rose-300 font-semibold block">🔴 Weak</span>
                  <span className="text-base font-bold font-mono text-rose-400">{latestReport.weak_topics.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 font-semibold block">🟡 Medium</span>
                  <span className="text-base font-bold font-mono text-amber-400">{latestReport.medium_topics.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 font-semibold block">🟢 Strong</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{latestReport.strong_topics.length}</span>
                </div>
              </div>

              <button
                onClick={onViewGapReport}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center space-x-1"
              >
                <span>View Full Gap Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Uploaded Course Materials List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Your Materials ({materials.length})</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('materials')}
              className="text-[11px] text-emerald-400 hover:underline"
            >
              Manage
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No study materials uploaded yet.</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
              >
                + Upload Syllabus / Notes (PDF)
              </button>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-200 block truncate">{m.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{m.material_type}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex-shrink-0 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {m.chunk_count} chunks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Attach / Upload Material Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Attach Study Material</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={`e.g. ${currentSubject} Chapter 1 Notes`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Classification</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="notes">Textbook Notes / Chapter</option>
                  <option value="syllabus">Official Syllabus</option>
                  <option value="past_paper">Past Question Paper</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select PDF or Text File</label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center space-x-1.5"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{uploading ? 'Ingesting...' : 'Ingest & Index'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
