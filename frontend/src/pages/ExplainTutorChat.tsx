import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Bot,
  User,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ChatMessage, Student } from '../types';

interface ExplainTutorChatProps {
  student: Student;
  initialTopic?: string;
}

export const ExplainTutorChat: React.FC<ExplainTutorChatProps> = ({
  student,
  initialTopic,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, [student.id]);

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const history = await apiClient.getChatHistory(student.id);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Seed helpful initial greeting
        setMessages([
          {
            id: 'init-1',
            student_id: student.id,
            role: 'assistant',
            content: `Hello ${student.full_name.split(' ')[0]}! I am your **GapFinder AI Study Assistant**.\n\nI answer strictly using **only the uploaded course materials and textbook chapters**, providing exact citations for every explanation so you know nothing is hallucinated.\n\nAsk me about any difficult topic, algorithm, or past exam question!`,
            citations: [
              {
                source_title: 'Course Materials Index',
                citation: 'Grounded RAG Mode Active',
                snippet: 'All responses are strictly constrained to retrieved chunks from your uploaded syllabus and notes.'
              }
            ],
            created_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      student_id: student.id,
      role: 'user',
      content: text,
      topic: selectedTopic || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.sendChatMessage(student.id, text, selectedTopic || undefined);
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        student_id: student.id,
        role: 'assistant',
        content: res.reply,
        topic: selectedTopic || undefined,
        citations: res.citations,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          student_id: student.id,
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching your study materials. Please verify that your notes are uploaded.',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const quickPrompts = [
    "Why does Belady's Anomaly occur in FIFO but not LRU?",
    "Explain the 4 necessary Coffman conditions for deadlocks.",
    "Differentiate internal vs external fragmentation in Paging.",
    "Compare SSTF and C-SCAN disk scheduling algorithms.",
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Step 6: Grounded RAG Assistant</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            'Explain This Topic' Study Helper
          </h1>
          <p className="text-xs text-slate-400">
            Answers exclusively from your uploaded notes with verifiable chapter citations.
          </p>
        </div>

        {/* Topic Focus Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Focus Topic:</span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Uploaded Topics</option>
            <option value="Virtual Memory & Page Replacement">Virtual Memory & Page Replacement</option>
            <option value="Process Synchronization & Deadlocks">Process Synchronization & Deadlocks</option>
            <option value="Main Memory Management & Paging">Main Memory Management & Paging</option>
            <option value="Storage & Disk Scheduling">Storage & Disk Scheduling</option>
            <option value="CPU Scheduling Algorithms">CPU Scheduling Algorithms</option>
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-xl">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isCitationExpanded = expandedCitations[msg.id];

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-950 border border-indigo-500/30 text-indigo-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Citations Box for Assistant messages */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl overflow-hidden">
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
                        <div className="p-3 border-t border-slate-900 space-y-2 bg-slate-950 text-[11px]">
                          {msg.citations.map((c, cIdx) => (
                            <div key={cIdx} className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1">
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
                <span>Searching indexed textbook chunks and synthesizing explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-bold flex-shrink-0">Suggestions:</span>
          {quickPrompts.map((qp, qpIdx) => (
            <button
              key={qpIdx}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-emerald-400 border border-slate-800 whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask an explanation for any topic, formula, or past paper problem..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 flex items-center justify-center shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

