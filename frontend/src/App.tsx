import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE } from './api/client';
import {
  Student,
  StudyMaterial,
  TopicMapItem,
  GapReport,
  RevisionPlan,
  ProgressData
} from './types';

// Layout & Modals
import { DashboardLayout } from './components/DashboardLayout';
import { RAGTransparencyModal } from './components/RAGTransparencyModal';
import { DemoLoginModal } from './components/DemoLoginModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { MaterialsUploadPage } from './pages/MaterialsUploadPage';
import { TopicMapPage } from './pages/TopicMapPage';
import { DiagnosticAssessmentPage } from './pages/DiagnosticAssessmentPage';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage';
import { GapAnalysisPage } from './pages/GapAnalysisPage';
import { RevisionPlanPage } from './pages/RevisionPlanPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProgressDashboardPage } from './pages/ProgressDashboardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

export function App() {
  // Navigation Route State
  // Public routes: 'landing', 'signup', 'login', 'onboarding'
  // Authenticated routes: 'overview', 'materials', 'topic_map', 'quiz', 'results', 'gap_analysis', 'revision_plan', 'ai_tutor', 'progress', 'profile'
  const [route, setRoute] = useState<string>('landing');

  // Student Authentication State
  const [student, setStudent] = useState<Student | null>(null);
  const [targetSubject, setTargetSubject] = useState<string>('Physics');

  // Core Data States
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [topicMap, setTopicMap] = useState<TopicMapItem[] | null>(null);
  const [latestGapReport, setLatestGapReport] = useState<GapReport | null>(null);
  const [activeRevisionPlan, setActiveRevisionPlan] = useState<RevisionPlan | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  // Modals & Navigation Context
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isRAGModalOpen, setIsRAGModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<string | undefined>(undefined);
  const [aiTutorInitialPrompt, setAiTutorInitialPrompt] = useState<string | undefined>(undefined);

  // Check backend health & auto-restore session
  useEffect(() => {
    checkBackendHealth();
    restoreSession();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  const restoreSession = async () => {
    const savedUserJson = localStorage.getItem('gapfinder_student');
    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson) as Student;
        const fresh = await apiClient.getProfile(parsed.id);
        if (fresh) {
          loadStudentData(fresh);
          return;
        }
      } catch {
        localStorage.removeItem('gapfinder_student');
      }
    }
    // Default to landing page if not logged in
    setRoute('landing');
  };

  const loadStudentData = async (user: Student, destinationRoute?: string) => {
    setStudent(user);
    localStorage.setItem('gapfinder_student', JSON.stringify(user));

    if (user.target_subject && user.target_subject !== 'General') {
      setTargetSubject(user.target_subject);
    }

    try {
      const [mats, tMap, gapRep, revPlan, prog] = await Promise.all([
        apiClient.getMaterials(user.id).catch(() => []),
        apiClient.getTopicMap(user.id).catch(() => null),
        apiClient.getLatestGapReport(user.id).catch(() => null),
        apiClient.getActiveRevisionPlan(user.id).catch(() => null),
        apiClient.getProgress(user.id).catch(() => null),
      ]);

      setMaterials(mats || []);
      setTopicMap(tMap);
      setLatestGapReport(gapRep);
      setActiveRevisionPlan(revPlan);
      setProgressData(prog);

      if (mats && mats.length > 0 && (!user.target_subject || user.target_subject === 'General')) {
        setTargetSubject(mats[0].title);
      }

      // Check onboarding status
      if (user.onboarding_completed === false) {
        setRoute('onboarding');
      } else {
        setRoute(destinationRoute || 'overview');
      }
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
      setRoute('overview');
    }
  };

  const handleLoginSuccess = (user: Student) => {
    loadStudentData(user, 'overview');
  };

  const handleDemoLogin = async (email?: string, fullName?: string) => {
    try {
      const user = await apiClient.loginDemo(
        email || 'demo.student@gapfinder.ai',
        fullName || 'Alex Mercer (Demo Student)'
      );
      loadStudentData(user, 'overview');
      setIsDemoModalOpen(false);
    } catch (err) {
      console.error('Demo login failed:', err);
      alert('Unable to log in to demo account. Please ensure the backend is running.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gapfinder_student');
    setStudent(null);
    setMaterials([]);
    setTopicMap(null);
    setLatestGapReport(null);
    setActiveRevisionPlan(null);
    setProgressData(null);
    setRoute('landing');
  };

  const handleNavigate = (newRoute: string, context?: any) => {
    if (context?.initialMessage) {
      setAiTutorInitialPrompt(context.initialMessage);
    }
    setRoute(newRoute);
  };

  const handleStartQuizForTopic = (topic: string) => {
    setSelectedTopicForQuiz(topic);
    setRoute('quiz');
  };

  const handleAssessmentCompleted = async (report: GapReport) => {
    setLatestGapReport(report);
    // Refresh progress and plan
    if (student) {
      const [prog, plan] = await Promise.all([
        apiClient.getProgress(student.id).catch(() => null),
        apiClient.getActiveRevisionPlan(student.id).catch(() => null),
      ]);
      if (prog) setProgressData(prog);
      if (plan) setActiveRevisionPlan(plan);
    }
  };

  // Public View 1: Landing Page
  if (route === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setRoute('signup')}
        onLogin={() => setRoute('login')}
      />
    );
  }

  // Public View 2: Sign Up Page
  if (route === 'signup') {
    return (
      <SignUpPage
        onSuccess={(user) => {
          setStudent(user);
          localStorage.setItem('gapfinder_student', JSON.stringify(user));
          setRoute('onboarding');
        }}
        onNavigateToLogin={() => setRoute('login')}
        onBackToHome={() => setRoute('landing')}
      />
    );
  }

  // Public View 3: Login Page
  if (route === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onNavigateToSignUp={() => setRoute('signup')}
        onBackToHome={() => setRoute('landing')}
      />
    );
  }

  // Onboarding Setup View
  if (route === 'onboarding' && student) {
    return (
      <OnboardingPage
        student={student}
        onComplete={(updated) => {
          setStudent(updated);
          localStorage.setItem('gapfinder_student', JSON.stringify(updated));
          if (updated.target_subject) {
            setTargetSubject(updated.target_subject);
          }
          setRoute('materials');
        }}
      />
    );
  }

  // Fallback if student is not authenticated for protected pages
  if (!student) {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onNavigateToSignUp={() => setRoute('signup')}
        onBackToHome={() => setRoute('landing')}
      />
    );
  }

  // Protected Views: Wrapped in DashboardLayout
  return (
    <>
      <DashboardLayout
        currentTab={route}
        onNavigate={handleNavigate}
        student={student}
        targetSubject={targetSubject}
        materials={materials}
        backendOnline={backendOnline}
        onOpenRAGModal={() => setIsRAGModalOpen(true)}
        onLogout={handleLogout}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page 5: Overview Dashboard */}
          {route === 'overview' && (
            <DashboardOverview
              student={student}
              targetSubject={targetSubject}
              materials={materials}
              gapReport={latestGapReport}
              revisionPlan={activeRevisionPlan}
              progress={progressData}
              onNavigate={handleNavigate}
            />
          )}

          {/* Page 6: Study Materials Upload */}
          {route === 'materials' && (
            <MaterialsUploadPage
              student={student}
              materials={materials}
              targetSubject={targetSubject}
              onMaterialsUpdated={(mats) => {
                setMaterials(mats);
                if (mats.length > 0 && (!targetSubject || targetSubject === 'General')) {
                  setTargetSubject(mats[0].title);
                }
              }}
              onStartQuiz={(subj) => {
                setTargetSubject(subj);
                setSelectedTopicForQuiz(undefined);
                setRoute('quiz');
              }}
            />
          )}

          {/* Page 7: Topic Map & Syllabus Hierarchy */}
          {route === 'topic_map' && (
            <TopicMapPage
              student={student}
              targetSubject={targetSubject}
              topicMap={topicMap}
              materials={materials}
              gapReport={latestGapReport}
              onGenerateMap={async (subj) => {
                const res = await apiClient.generateTopicMap(student.id, subj);
                if (res?.topic_map?.topic_data) {
                  setTopicMap(res.topic_map.topic_data);
                }
              }}
              onTestTopic={handleStartQuizForTopic}
            />
          )}

          {/* Page 8: Diagnostic Assessment */}
          {route === 'quiz' && (
            <DiagnosticAssessmentPage
              student={student}
              materials={materials}
              targetSubject={targetSubject}
              preselectedTopic={selectedTopicForQuiz}
              onAssessmentCompleted={handleAssessmentCompleted}
              onNavigate={handleNavigate}
            />
          )}

          {/* Page 9: Assessment Results */}
          {route === 'results' && latestGapReport && (
            <AssessmentResultsPage
              report={latestGapReport}
              onNavigate={handleNavigate}
              onRetake={() => {
                setSelectedTopicForQuiz(undefined);
                setRoute('quiz');
              }}
            />
          )}

          {/* Page 10: Knowledge Gap Analysis */}
          {route === 'gap_analysis' && (
            <GapAnalysisPage
              student={student}
              gapReport={latestGapReport}
              onNavigate={handleNavigate}
              onStartQuizForTopic={handleStartQuizForTopic}
            />
          )}

          {/* Page 11: Personalized Revision Plan */}
          {route === 'revision_plan' && (
            <RevisionPlanPage
              student={student}
              revisionPlan={activeRevisionPlan}
              onNavigate={handleNavigate}
              onPlanUpdated={(updatedPlan) => setActiveRevisionPlan(updatedPlan)}
            />
          )}

          {/* Page 12: AI Study Doctor Assistant */}
          {route === 'ai_tutor' && (
            <AIAssistantPage
              student={student}
              materials={materials}
              targetSubject={targetSubject}
              initialPrompt={aiTutorInitialPrompt}
              onOpenRAGTransparency={() => setIsRAGModalOpen(true)}
            />
          )}

          {/* Page 13: Progress & Mastery Dashboard */}
          {route === 'progress' && (
            <ProgressDashboardPage
              student={student}
              progressData={progressData}
              onNavigate={handleNavigate}
            />
          )}

          {/* Page 14: Profile & Settings */}
          {route === 'profile' && (
            <ProfileSettingsPage
              student={student}
              onProfileUpdated={(updated) => {
                setStudent(updated);
                localStorage.setItem('gapfinder_student', JSON.stringify(updated));
                if (updated.target_subject) {
                  setTargetSubject(updated.target_subject);
                }
              }}
              onSwitchDemo={(email, name) => handleDemoLogin(email, name)}
              onLogout={handleLogout}
              onOpenRAGTransparency={() => setIsRAGModalOpen(true)}
            />
          )}
        </div>
      </DashboardLayout>

      {/* RAG Technical Architecture Modal */}
      <RAGTransparencyModal
        isOpen={isRAGModalOpen}
        onClose={() => setIsRAGModalOpen(false)}
      />

      {/* Demo Persona Switcher Modal */}
      <DemoLoginModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        currentStudent={student}
        onSelectStudent={async (email, fullName) => {
          await handleDemoLogin(email, fullName);
        }}
      />
    </>
  );
}

export default App;
