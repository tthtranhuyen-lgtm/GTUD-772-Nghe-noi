import React, { createContext, useContext, useState, useEffect } from 'react';
import { Exercise, Student, Submission, AppNotification, AnswerItem, GradeFeedback } from '../types';
import { INITIAL_STUDENTS, INITIAL_EXERCISES, INITIAL_SUBMISSIONS, INITIAL_NOTIFICATIONS, seedSampleAudio } from '../utils/mockData';
import { VoiceGender } from '../utils/speechSynthesis';

interface AppContextType {
  userRole: 'student' | 'teacher';
  setUserRole: (role: 'student' | 'teacher') => void;
  activeStudent: Student;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  students: Student[];
  addStudent: (name: string, chineseName: string, gradeLevel: string, targetGoal: string) => void;
  updateStudentAvatar: (studentId: string, avatarUrl: string) => void;
  exercises: Exercise[];
  submissions: Submission[];
  notifications: AppNotification[];
  selectedExerciseId: string | null;
  setSelectedExerciseId: (id: string | null) => void;
  selectedSubmissionId: string | null;
  setSelectedSubmissionId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceGender: VoiceGender;
  setVoiceGender: (gender: VoiceGender) => void;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  addExercise: (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => string;
  updateExercise: (id: string, updated: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  submitAssignment: (exerciseId: string, answers: Record<string, AnswerItem>) => string;
  quickTestSubmit: (studentId?: string) => string;
  gradeAssignment: (submissionId: string, grade: GradeFeedback) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toast: { title: string; message: string; type: 'success' | 'info' } | null;
  showToast: (title: string, message: string, type?: 'success' | 'info') => void;
  clearToast: () => void;
  resetToDefaultClassData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage version for the 10-student Chinese class (student 10 renamed to Nguyễn Minh Thái)
const STORAGE_PREFIX = 'edulisten_chinese_class_v5';
const LOCAL_STORAGE_KEY_EXERCISES = `${STORAGE_PREFIX}_exercises`;
const LOCAL_STORAGE_KEY_SUBMISSIONS = `${STORAGE_PREFIX}_submissions`;
const LOCAL_STORAGE_KEY_NOTIFICATIONS = `${STORAGE_PREFIX}_notifications`;
const LOCAL_STORAGE_KEY_STUDENTS = `${STORAGE_PREFIX}_students`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [activeStudentId, setActiveStudentId] = useState<string>('std-1');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('exercises');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);

  // Global Voice settings: Standard natural voice and comfortable pacing (0.88x)
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('standard');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.88);

  // Initialize data - strictly filter out legacy test student & ensure student 10 name is Nguyễn Minh Thái
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        const filtered = parsed
          .filter(s => s.id !== 'std-test' && !s.isTestUser)
          .map(s => {
            if (s.id === 'std-10') {
              return {
                ...s,
                name: 'Nguyễn Minh Thái',
                chineseName: '阮明泰',
                email: 'minhthai.nguyen@school.edu.vn'
              };
            }
            return s;
          });
        return filtered.length > 0 ? filtered : INITIAL_STUDENTS;
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EXERCISES);
      if (saved) {
        const parsed: Exercise[] = JSON.parse(saved);
        const filtered = parsed
          .filter(e => e.id !== 'ex-student-test' && e.assignedStudentId !== 'std-test')
          .map(e => {
            if (e.id === 'ex-student-10' || e.assignedStudentId === 'std-10') {
              return {
                ...e,
                title: 'Bài tập 10: Luyện nghe & Thu âm trả lời (Nguyễn Minh Thái 阮明泰)'
              };
            }
            return e;
          });
        return filtered.length > 0 ? filtered : INITIAL_EXERCISES;
      }
      return INITIAL_EXERCISES;
    } catch {
      return INITIAL_EXERCISES;
    }
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
      if (saved) {
        const parsed: Submission[] = JSON.parse(saved);
        return parsed.filter(s => s.studentId !== 'std-test');
      }
      return INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Seed initial sample audio recordings into IndexedDB on mount
  useEffect(() => {
    seedSampleAudio();
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [exercises]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [students]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const resetToDefaultClassData = () => {
    setStudents(INITIAL_STUDENTS);
    setExercises(INITIAL_EXERCISES);
    setSubmissions(INITIAL_SUBMISSIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    seedSampleAudio();
    showToast('Đã làm mới dữ liệu lớp học', 'Danh sách 10 học sinh và 10 bài tập nghe tiếng Trung đã được khôi phục chuẩn.');
  };

  const addStudent = (name: string, chineseName: string, gradeLevel: string, targetGoal: string) => {
    const newNumber = students.length + 1;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name,
      chineseName,
      studentNumber: newNumber,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@school.edu.vn`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      gradeLevel,
      targetGoal,
      enrolledDate: new Date().toLocaleDateString('vi-VN')
    };
    setStudents(prev => [...prev, newStudent]);
    showToast('Đã thêm học sinh', `Đã thêm học sinh ${name} (${chineseName}) vào lớp.`);
  };

  const updateStudentAvatar = (studentId: string, avatarUrl: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, avatar: avatarUrl } : s))
    );
    // Also update existing submissions of this student
    setSubmissions(prev =>
      prev.map(sub => (sub.studentId === studentId ? { ...sub, studentAvatar: avatarUrl } : sub))
    );
    showToast('Đã cập nhật ảnh đại diện!', 'Ảnh đại diện mới của bạn đã được lưu.');
  };

  const addExercise = (exerciseData: Omit<Exercise, 'id' | 'createdAt'>): string => {
    const newId = `ex-${Date.now()}`;
    const newExercise: Exercise = {
      ...exerciseData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setExercises(prev => [newExercise, ...prev]);
    showToast('Tạo bài nghe thành công', `Bài tập "${newExercise.title}" đã được thêm.`);
    return newId;
  };

  const updateExercise = (id: string, updated: Partial<Exercise>) => {
    setExercises(prev => prev.map(ex => (ex.id === id ? { ...ex, ...updated } : ex)));
    showToast('Đã cập nhật', 'Thông tin bài tập đã được lưu.');
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    showToast('Đã xóa', 'Bài tập đã được xóa khỏi hệ thống.', 'info');
  };

  const submitAssignment = (exerciseId: string, answers: Record<string, AnswerItem>): string => {
    const submissionId = `sub-${Date.now()}`;
    const targetEx = exercises.find(e => e.id === exerciseId);
    const newSubmission: Submission = {
      id: submissionId,
      exerciseId,
      studentId: activeStudent.id,
      studentName: `${activeStudent.name} (${activeStudent.chineseName || ''})`,
      studentAvatar: activeStudent.avatar,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'pending',
      answers
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Create instant notification for TEACHER
    const teacherNotification: AppNotification = {
      id: `notif-t-${Date.now()}`,
      recipientRole: 'teacher',
      title: `📥 ${activeStudent.name} (${activeStudent.chineseName || ''}) vừa nộp bài thu âm!`,
      message: `Học sinh đã hoàn thành và gửi bản ghi âm cho bài "${targetEx?.title || 'Luyện nghe & Thu âm'}". Giáo viên có thể vào nghe và chấm điểm ngay.`,
      submissionId,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setNotifications(prev => [teacherNotification, ...prev]);

    showToast(
      'Nộp bài thành công!',
      'Bản thu âm của bạn đã được gửi cho giáo viên. Giáo viên đã nhận được thông báo để vào kiểm tra và chấm điểm trực tiếp.'
    );
    return submissionId;
  };

  const quickTestSubmit = (studentId?: string): string => {
    const targetStudent = (studentId && students.find(s => s.id === studentId)) || activeStudent || students[0];
    const targetEx = exercises.find(e => e.assignedStudentId === targetStudent.id) || exercises[0];

    const mockAnswers: Record<string, AnswerItem> = {};
    targetEx.questions.forEach((q, idx) => {
      const sampleBlobId = `rec_sample_std1_q${(idx % 8) + 1}`;
      mockAnswers[q.id] = {
        questionId: q.id,
        type: 'audio_recording',
        audioBlobId: sampleBlobId,
        audioDurationSec: 8 + (idx * 2),
        textAnswer: q.guidePrompt ? q.guidePrompt.replace('Gợi ý: ', '').replace('Gợi ý trả lời: ', '') : 'Câu trả lời mẫu bằng tiếng Trung.'
      };
    });

    const submissionId = `sub-test-${Date.now()}`;
    const newSubmission: Submission = {
      id: submissionId,
      exerciseId: targetEx.id,
      studentId: targetStudent.id,
      studentName: `${targetStudent.name} (${targetStudent.chineseName || ''})`,
      studentAvatar: targetStudent.avatar,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'pending',
      answers: mockAnswers
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Create instant notification for TEACHER
    const teacherNotification: AppNotification = {
      id: `notif-t-${Date.now()}`,
      recipientRole: 'teacher',
      title: `📥 [BÀI NỘP MỚI] ${targetStudent.name} (${targetStudent.chineseName || ''}) vừa nộp bài!`,
      message: `Đã nộp bài thu âm cho "${targetEx.title}". Giáo viên có thể bấm vào kiểm tra, nghe lại âm thanh và chấm điểm trực tiếp ngay lúc này!`,
      submissionId,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setNotifications(prev => [teacherNotification, ...prev]);

    showToast(
      'Đã nộp bài mẫu test thành công!',
      `Bài thu âm của ${targetStudent.name} (${targetStudent.chineseName || ''}) đã gửi tới giáo viên. Hãy chuyển sang vai "Giáo viên" để kiểm tra bài nộp ngay nhé!`
    );

    return submissionId;
  };

  const gradeAssignment = (submissionId: string, grade: GradeFeedback) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status: 'graded',
            grade
          };
        }
        return sub;
      })
    );

    // Create real-time notification for the STUDENT
    const targetSub = submissions.find(s => s.id === submissionId);
    if (targetSub) {
      const exercise = exercises.find(e => e.id === targetSub.exerciseId);
      const studentNotification: AppNotification = {
        id: `notif-s-${Date.now()}`,
        recipientRole: 'student',
        studentId: targetSub.studentId,
        title: '🎉 Giáo viên đã chấm điểm & gửi nhận xét!',
        message: `${grade.gradedBy} đã chấm bài "${exercise?.title || 'Luyện nghe'}". Điểm: ${grade.totalScore}/10.${grade.teacherAudioBlobId ? ' Có kèm lời nhận xét bằng giọng nói!' : ''} Bấm để xem và nghe ngay!`,
        submissionId,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      setNotifications(prev => [studentNotification, ...prev]);
    }

    showToast(
      'Đã chấm điểm & Gửi nhận xét trực tiếp!',
      `Học sinh ${targetSub?.studentName || ''} đã nhận được thông báo phản hồi ngay lập tức.`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        activeStudent,
        activeStudentId,
        setActiveStudentId,
        students,
        addStudent,
        updateStudentAvatar,
        exercises,
        submissions,
        notifications,
        selectedExerciseId,
        setSelectedExerciseId,
        selectedSubmissionId,
        setSelectedSubmissionId,
        activeTab,
        setActiveTab,
        voiceGender,
        setVoiceGender,
        speechSpeed,
        setSpeechSpeed,
        addExercise,
        updateExercise,
        deleteExercise,
        submitAssignment,
        quickTestSubmit,
        gradeAssignment,
        markNotificationRead,
        markAllNotificationsRead,
        toast,
        showToast,
        clearToast,
        resetToDefaultClassData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
