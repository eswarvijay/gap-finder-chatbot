import React, { useState } from 'react';
import {
  Stethoscope,
  ArrowRight,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Cpu,
  Atom,
  Dna,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Student } from '../types';

interface LoginPageProps {
  onSuccess: (student: Student) => void;
  onNavigateToSignUp: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const student = await apiClient.login(email.trim(), password);
      onSuccess(student);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoName: string) => {
    setError(null);
    setDemoLoading(demoEmail);
    try {
      const student = await apiClient.loginDemo(demoEmail, demoName);
      onSuccess(student);
    } catch (err: any) {
      setError('Demo login failed. Please retry.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">GapFinder<span className="text-indigo-600">.AI</span></span>
        </button>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome Back, Student
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to access your assessments, gap reports, and revision plan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick 1-Click Judge & Demo Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Or 1-Click Demo Profiles (For Interview Evaluators):
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('demo.student@gapfinder.ai', 'Alex Mercer (Judge Demo)')}
                disabled={!!demoLoading}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Alex Mercer (CS & OS)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Pre-seeded evaluation account</span>
                  </div>
                </div>
                {demoLoading === 'demo.student@gapfinder.ai' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('jordan.lee@gapfinder.ai', 'Jordan Lee')}
                disabled={!!demoLoading}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Atom className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Jordan Lee (Physics & Mechanics)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Engineering aspirant account</span>
                  </div>
                </div>
                {demoLoading === 'jordan.lee@gapfinder.ai' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

