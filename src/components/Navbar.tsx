import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, UserCheck, GraduationCap, Check, ChevronDown, CheckCheck, RotateCcw, Zap, Sparkles, BookOpen, Camera } from 'lucide-react';
import { AvatarUploadModal } from './Student/AvatarUploadModal';

interface NavbarProps {
  onOpenFeedbackModal?: (submissionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFeedbackModal }) => {
  const {
    userRole,
    setUserRole,
    activeStudent,
    setActiveStudentId,
    students,
    activeTab,
    setActiveTab,
    submissions,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedExerciseId,
    setSelectedSubmissionId,
    resetToDefaultClassData
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Pending grading count for teacher
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  // Filter notifications based on role
  const relevantNotifications = notifications.filter(n => {
    if (userRole === 'teacher') {
      return n.recipientRole === 'teacher';
    } else {
      return n.recipientRole === 'student' && n.studentId === activeStudent.id;
    }
  });

  const unreadCount = relevantNotifications.filter(n => !n.isRead).length;

  const handleSelectNotification = (notifId: string, subId: string) => {
    markNotificationRead(notifId);
    setShowNotifications(false);
    if (userRole === 'teacher') {
      setSelectedSubmissionId(subId);
      setActiveTab('grading');
    } else if (onOpenFeedbackModal) {
      onOpenFeedbackModal(subId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand wordmark with Chinese Aesthetics */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSelectedExerciseId(null);
              setSelectedSubmissionId(null);
              setActiveTab(userRole === 'student' ? 'exercises' : 'grading');
            }}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-800 via-red-700 to-amber-700 flex items-center justify-center text-amber-100 font-black text-xl shadow-md group-hover:scale-105 transition-transform font-chinese border border-amber-400/40">
              华
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-red-700 transition-colors">
                  EduListen
                </span>
                <span className="chinese-seal text-[11px] font-bold text-red-700">
                  华语课堂
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Lớp Tiếng Trung: Luyện Nghe & Thu Âm Trả Lời Trực Tiếp
              </p>
            </div>
          </button>
        </div>

        {/* Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {userRole === 'student' ? (
            <>
              <button
                onClick={() => {
                  setSelectedExerciseId(null);
                  setActiveTab('exercises');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'exercises' && !setSelectedExerciseId
                    ? 'bg-red-50 text-red-800 border border-red-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Bài tập nghe hôm nay
              </button>
              <button
                onClick={() => {
                  setSelectedExerciseId(null);
                  setActiveTab('progress');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'progress'
                    ? 'bg-red-50 text-red-800 border border-red-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tiến độ & Nhận xét của cô
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedSubmissionId(null);
                  setActiveTab('grading');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'grading'
                    ? 'bg-red-50 text-red-800 border border-red-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Hộp thư chấm bài</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedSubmissionId(null);
                  setActiveTab('students_progress');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'students_progress'
                    ? 'bg-red-50 text-red-800 border border-red-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Theo dõi 10 học sinh
              </button>
              <button
                onClick={() => {
                  setSelectedSubmissionId(null);
                  setActiveTab('manage_exercises');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'manage_exercises'
                    ? 'bg-red-50 text-red-800 border border-red-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Quản lý kho bài nghe
              </button>
            </>
          )}
        </nav>

        {/* Primary Actions & Role Switching */}
        <div className="flex items-center gap-2.5">
          {/* Notifications button (Teacher & Student) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Thông báo phản hồi nộp bài & chấm điểm"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-amber-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
                  <span className="text-xs font-bold text-slate-800">
                    {userRole === 'teacher' ? 'Thông báo giáo viên' : 'Thông báo học sinh'}
                  </span>
                  {relevantNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-red-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {relevantNotifications.length === 0 ? (
                    <p className="p-5 text-center text-xs text-slate-400">Chưa có thông báo mới</p>
                  ) : (
                    relevantNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleSelectNotification(n.id, n.submissionId)}
                        className={`p-3 text-left hover:bg-red-50/40 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-red-700">
                          {userRole === 'teacher' ? 'Mở chấm điểm & thu âm nhận xét →' : 'Xem điểm & nghe lời nhận xét của cô →'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Switcher for 10 Students */}
          {userRole === 'student' && (
            <div className="relative">
              <button
                onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
              >
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-300"
                />
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-slate-900 max-w-[120px] truncate block">
                    {activeStudent.name}
                  </span>
                  <span className="text-[10px] text-red-700 font-chinese font-semibold block">
                    {activeStudent.chineseName} {activeStudent.studentNumber > 0 ? `· HS ${activeStudent.studentNumber}` : ''}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showStudentDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200/80 py-1.5 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 text-[11px] font-bold text-red-800 bg-red-50/60 uppercase tracking-wider border-b border-amber-100 flex items-center justify-between">
                    <span>Chọn học sinh đang học</span>
                    <span className="text-[10px] font-normal text-slate-500">10 Học viên chính thức</span>
                  </div>

                  {/* Quick Change Avatar Button for current student */}
                  <div className="p-2 border-b border-amber-100 bg-amber-50/40">
                    <button
                      type="button"
                      onClick={() => {
                        setShowStudentDropdown(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-800 border border-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-red-700" />
                      <span>📸 Đổi ảnh đại diện cho {activeStudent.name}</span>
                    </button>
                  </div>

                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveStudentId(s.id);
                        setSelectedExerciseId(null);
                        setShowStudentDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-amber-50/50 text-xs transition-colors ${
                        s.id === activeStudent.id ? 'bg-red-50 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 bg-slate-200 text-slate-700">
                          {s.studentNumber}
                        </span>
                        <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200" />
                        <div>
                          <div className="text-slate-900 font-semibold flex items-center gap-1.5">
                            <span>{s.name}</span>
                          </div>
                          <div className="text-[11px] text-red-700 font-chinese">{s.chineseName}</div>
                        </div>
                      </div>
                      {s.id === activeStudent.id && <Check className="w-4 h-4 text-red-700 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Switcher Button */}
          <div className="flex items-center p-1 bg-amber-100/60 rounded-lg border border-amber-200">
            <button
              onClick={() => {
                setUserRole('student');
                setActiveTab('exercises');
                setSelectedExerciseId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                userRole === 'student'
                  ? 'bg-white text-red-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Học sinh</span>
            </button>
            <button
              onClick={() => {
                setUserRole('teacher');
                setActiveTab('grading');
                setSelectedExerciseId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                userRole === 'teacher'
                  ? 'bg-red-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Giáo viên</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </header>
  );
};
