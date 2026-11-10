import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2
} from 'lucide-react';
import { Student, StudyMaterial, ChatMessage } from '../types';
import { apiClient } from '../api/client';

interface AIAssistantPageProps {
  student: Student;
  materials: StudyMaterial[];
  targetSubject: string;
  initialPrompt?: string;
  onOpenRAGTransparency?: () => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  student,
  materials,
  targetSubject,
  initialPrompt,
  onOpenRAGTransparency
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, [student.id]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadChatHistory = async () => {
    try {
      const history = await apiClient.getChatHistory(student.id);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            student_id: student.id,
            role: 'assistant',
            content: `Hello ${student.full_name || 'Student'}! 👋\n\nI am your **GapFinder AI Study Doctor**. I answer questions grounded strictly in your uploaded syllabus, textbook chapters, and past examination papers.\n\nAsk me to:\n- Explain any difficult concept step-by-step with source citations\n- Clarify why an answer was wrong in your diagnostic assessment\n- Summarize key formulas and high-yield exam topics`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || sending) return;

    setInput('');
    const tempUserMsg: ChatMessage = {
      id: `temp-u-${Date.now()}`,
      student_id: student.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await apiClient.sendChatMessage(student.id, text, targetSubject);
      const assistantMsg: ChatMessage = {
        id: `temp-a-${Date.now()}`,
        student_id: student.id,
        role: 'assistant',
        content: res.reply,
        citations: res.citations || [],
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `temp-err-${Date.now()}`,
        student_id: student.id,
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an issue: ${err.response?.data?.detail || err.message || 'Please check your connection and try again.'}`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const toggleCitation = (msgId: string, citIdx: number) => {
    const key = `${msgId}-${citIdx}`;
    setExpandedCitations((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const promptSuggestions = [
    `Explain the foundational concepts of ${targetSubject || 'my study materials'}`,
    `What are the most common exam traps or misconceptions in this topic?`,
    `Summarize the key formulas and step-by-step problem-solving methods`,
    `Give me a conceptual breakdown of my diagnosed weak areas`
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">AI Study Doctor & Concept Explainer</h1>
            <p className="text-xs text-slate-500">
              Grounded strictly in {materials.length} uploaded document{materials.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenRAGTransparency && (
            <button
              onClick={onOpenRAGTransparency}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              RAG Inspector
            </button>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Verified Citations
          </span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-y-auto space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {/* Grounding Source Citations Drawer */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Grounded in {msg.citations.length} Source Excerpt{msg.citations.length === 1 ? '' : 's'}:
                    </div>

                    <div className="space-y-1.5">
                      {msg.citations.map((cit, cIdx) => {
                        const citKey = `${msg.id}-${cIdx}`;
                        const isExpanded = !!expandedCitations[citKey];

                        return (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCitation(msg.id, cIdx)}
                              className="w-full flex items-center justify-between font-semibold text-slate-800 text-left hover:text-indigo-600"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-indigo-700 font-bold">{cit.source_title}:</span>
                                <span className="truncate">{cit.citation}</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                              )}
                            </button>

                            {isExpanded && cit.snippet && (
                              <p className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                                "{cit.snippet}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm flex items-center gap-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Retrieving source chunks and generating grounded explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          {promptSuggestions.map((sug, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSendMessage(sug)}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-semibold text-slate-700 whitespace-nowrap transition shadow-2xs"
            >
              ✨ {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2 shrink-0">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask anything about your syllabus, concepts, or past questions..."
          className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
        />

        <button
          disabled={!input.trim() || sending}
          onClick={() => handleSendMessage()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

