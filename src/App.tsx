import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ExerciseList } from './components/Student/ExerciseList';
import { ExercisePlayer } from './components/Student/ExercisePlayer';
import { StudentDashboard } from './components/Student/StudentDashboard';
import { SubmissionsInbox } from './components/Teacher/SubmissionsInbox';
import { GradingStudio } from './components/Teacher/GradingStudio';
import { ExerciseManager } from './components/Teacher/ExerciseManager';
import { StudentProgressTracker } from './components/Teacher/StudentProgressTracker';
import { FeedbackModal } from './components/FeedbackModal';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    userRole,
    activeTab,
    selectedExerciseId,
    setSelectedExerciseId,
    selectedSubmissionId,
    setSelectedSubmissionId,
    exercises,
    submissions,
    activeStudent,
    setActiveStudentId,
    toast,
    clearToast
  } = useApp();

  const [activeFeedbackSubmissionId, setActiveFeedbackSubmissionId] = useState<string | null>(null);

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId);
  const selectedSubmissionExercise = selectedSubmission
    ? exercises.find(e => e.id === selectedSubmission.exerciseId)
    : undefined;

  // Active submission for Feedback Modal
  const feedbackSubmission = activeFeedbackSubmissionId
    ? submissions.find(s => s.id === activeFeedbackSubmissionId)
    : null;
  const feedbackExercise = feedbackSubmission
    ? exercises.find(e => e.id === feedbackSubmission.exerciseId)
    : null;

  return (
    <div className="min-h-screen chinese-theme-bg chinese-lattice-bg flex flex-col font-sans relative selection:bg-red-500/20 selection:text-red-950">
      {/* Subtle Chinese Calligraphy Vertical Watermarks */}
      <div 
        aria-hidden="true" 
        className="chinese-watermark hidden lg:block text-2xl" 
        style={{ top: '120px', left: '20px' }}
      >
        学而时习之 · 熟能生巧
      </div>
      <div 
        aria-hidden="true" 
        className="chinese-watermark hidden lg:block text-2xl" 
        style={{ top: '120px', right: '20px' }}
      >
        听辨无碍 · 妙语连珠
      </div>

      {/* Traditional Chinese Top Ribbon */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-amber-100 text-[11px] py-1.5 px-4 shadow-xs relative z-50 border-b border-red-950/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="chinese-seal text-[10px] bg-red-100/90 text-red-900 border-red-300 font-bold px-1.5 py-0.5">
              华语
            </span>
            <span className="font-semibold text-amber-50">
              🏮 Lớp Tiếng Trung HSK 1-2 · 10 Học viên chính thức (HSK 1-2 汉语听说学堂)
            </span>
          </div>

          <div className="flex items-center gap-3 text-amber-200/90 text-[11px]">
            <span className="hidden sm:inline">
              🎙️ Giọng đọc bài nghe chuẩn Tiếng Trung (Phát âm rõ ràng · Ngữ điệu tự nhiên)
            </span>
            <span className="text-amber-300/80 font-medium">
              Đồng bộ tức thì Học sinh & Giáo viên
            </span>
          </div>
        </div>
      </div>

      {/* Top Bar Navigation */}
      <Navbar onOpenFeedbackModal={subId => setActiveFeedbackSubmissionId(subId)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* Student View Router */}
        {userRole === 'student' && (
          <>
            {selectedExercise ? (
              <ExercisePlayer
                exercise={selectedExercise}
                onBack={() => setSelectedExerciseId(null)}
                onOpenFeedback={subId => setActiveFeedbackSubmissionId(subId)}
              />
            ) : activeTab === 'progress' ? (
              <StudentDashboard
                onOpenFeedback={subId => setActiveFeedbackSubmissionId(subId)}
                onSelectExercise={exId => setSelectedExerciseId(exId)}
              />
            ) : (
              <ExerciseList
                onSelectExercise={id => setSelectedExerciseId(id)}
                onOpenFeedback={subId => setActiveFeedbackSubmissionId(subId)}
              />
            )}
          </>
        )}

        {/* Teacher View Router */}
        {userRole === 'teacher' && (
          <>
            {selectedSubmission && selectedSubmissionExercise ? (
              <GradingStudio
                submission={selectedSubmission}
                exercise={selectedSubmissionExercise}
                onBack={() => setSelectedSubmissionId(null)}
              />
            ) : activeTab === 'manage_exercises' ? (
              <ExerciseManager />
            ) : activeTab === 'students_progress' ? (
              <StudentProgressTracker
                onOpenFeedback={subId => setActiveFeedbackSubmissionId(subId)}
              />
            ) : (
              <SubmissionsInbox
                onSelectSubmission={id => setSelectedSubmissionId(id)}
              />
            )}
          </>
        )}
      </main>

      {/* Direct Feedback Modal (Student & Teacher can view) */}
      {feedbackSubmission && feedbackExercise && (
        <FeedbackModal
          submission={feedbackSubmission}
          exercise={feedbackExercise}
          onClose={() => setActiveFeedbackSubmissionId(null)}
        />
      )}

      {/* Live Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-sky-400" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer with Chinese Educational Aesthetics */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-amber-200/60 py-6 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="chinese-seal text-xs font-bold bg-red-50 text-red-800 border-red-300">
              汉语
            </span>
            <span className="font-bold text-slate-800">EduListen · 华语学堂</span>
            <span>·</span>
            <span>Hệ thống Luyện nghe & Thu âm Trả lời Tiếng Trung Trực Tuyến</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Đồng bộ tức thì giáo viên & học sinh
            </span>
            <span>·</span>
            <span>Thu âm học sinh & Ghi âm nhận xét của cô giáo</span>
            <span>·</span>
            <span>Giọng đọc nam/nữ chuẩn Bắc Kinh</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
