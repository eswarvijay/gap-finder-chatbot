import React from 'react';
import {
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  Layers,
  HelpCircle,
  Activity,
  Calendar,
  TrendingUp,
  Cpu,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* Top Public Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">GapFinder<span className="text-indigo-600">.AI</span></span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase">
                  EdTech SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">Diagnostic Study Doctor</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#rag-technology" className="hover:text-indigo-600 transition-colors">RAG Technology</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">About</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Discover What You Don't Know. Master What Matters.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Knowledge Gaps <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Before Your Exam.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Most study tools wait for you to ask a question. But you cannot ask about a gap you don't know you have. 
            GapFinder AI tests you on your syllabus, diagnoses weak spots into 🔴 Weak, 🟡 Medium, and 🟢 Strong, and prescribes an adaptive revision plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Your Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Explore How It Works</span>
            </a>
          </div>

          {/* Interactive UI Dashboard Preview */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-2xl shadow-indigo-500/10 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-400 pl-2">gapfinder-ai-clinical-diagnosis.preview</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Target: College Physics
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 flex items-center space-x-1">
                      <span>🔴 Weak Topics</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">33% Mastery</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Rotational Kinematics & Torque</h4>
                  <p className="text-[11px] text-slate-600">Why: Missed 3 of 4 questions involving moment of inertia calculations.</p>
                  <span className="text-[10px] font-mono text-rose-600 block">Rx: Review Chapter 9, Section 3</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 flex items-center space-x-1">
                      <span>🟡 Medium Topics</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">60% Mastery</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Conservation of Linear Momentum</h4>
                  <p className="text-[11px] text-slate-600">Why: Correct on 1D collisions; confused on inelastic 2D vector components.</p>
                  <span className="text-[10px] font-mono text-amber-600 block">Rx: Practice 3 multi-angle problems</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                      <span>🟢 Strong Topics</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">92% Mastery</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Newton's Laws of Motion</h4>
                  <p className="text-[11px] text-slate-600">Status: Free body diagrams and friction forces fully mastered.</p>
                  <span className="text-[10px] font-mono text-emerald-600 block">Rx: Keep sharp with spaced recall</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* The 6-Step Workflow Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">The Continuous Learning Loop</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How GapFinder AI Treats Knowledge Blindspots</h2>
            <p className="text-sm text-slate-600">
              Unlike generic chatbots that only answer when asked, GapFinder AI guides you through an end-to-end diagnostic and recovery pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload Your Study Materials</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attach your syllabus, lecture notes, textbook chapters (PDF or text), and past exam papers. Our RAG engine extracts and vectorizes content.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Maps Your Curriculum</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                GapFinder AI structures your syllabus into chapters and subtopics, correlating past exam questions to establish high-yield exam weightages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Take Diagnostic Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take an assessment generated from your own materials. Every question is grounded in source excerpts with verified citations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Discover Your Knowledge Gaps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The main diagnosis categorizes topics into 🔴 Weak, 🟡 Medium, and 🟢 Strong with clinical explanations of why you missed specific concepts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h3 className="text-base font-bold text-slate-900">Follow Personalized Revision Plan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An adaptive daily treatment plan fitted to your available study time (e.g. 5 days, 2 hours/day), prioritizing weakest and high-yield topics first.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h3 className="text-base font-bold text-slate-900">Retake & Track Improvement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retake assessments to measure mastery shifts (e.g. 40% → 75%). The plan automatically updates while preserving all historical attempts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Features Built for Mastery</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Everything a Student Needs to Ace the Exam</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Grounded Source Citations</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every generated question and explanation cites the exact chapter, unit, or section from your uploaded documents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Topic-Level Gap Diagnosis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never guess what to study next. Specific misconception reasoning guides your revision where it actually matters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Adaptive Revision Roadmap</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure your available preparation days and daily study hours. High-yield and weak areas are scheduled first.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">RAG AI Study Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions about your uploaded materials. The assistant explains complex concepts using only your course syllabus.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Measurable Progress Tracking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare multiple assessment attempts side by side to see how weak topics evolve into mastered concepts over time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Secure Student Isolation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each student has an isolated profile in Supabase Postgres. Only you see your uploaded textbooks, quizzes, and plans.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* RAG Separation Callout */}
      <section id="rag-technology" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Mandatory AI Transparency</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How Retrieval & Generation Are Strictly Separated
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            GapFinder AI strictly separates <strong>Vector Retrieval</strong> (extracting source facts from student materials with pgvector) from <strong>LLM Generation</strong> (synthesizing pedagogically rigorous diagnostic questions). The model never relies on general ungrounded memory.
          </p>
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              Test the AI Diagnostic Engine Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-bold">GapFinder AI</span>
            <span>— Hackathon Problem Statement 2026</span>
          </div>
          <p className="text-slate-500">
            Powered by Groq Cloud, Supabase pgvector & FastAPI. Discover what you don't know.
          </p>
        </div>
      </footer>

    </div>
  );
};

