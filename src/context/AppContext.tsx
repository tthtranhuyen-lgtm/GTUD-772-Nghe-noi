import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Exercise, Student, Submission, AppNotification, AnswerItem, GradeFeedback } from '../types';
import { INITIAL_STUDENTS, INITIAL_EXERCISES, INITIAL_SUBMISSIONS, INITIAL_NOTIFICATIONS, seedSampleAudio } from '../utils/mockData';
import { VoiceGender } from '../utils/speechSynthesis';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

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
  copyStudentAssignmentLink: (studentId?: string, exerciseId?: string) => void;
  isCloudSynced: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'edulisten_chinese_class_v6';
const LOCAL_STORAGE_KEY_EXERCISES = `${STORAGE_PREFIX}_exercises`;
const LOCAL_STORAGE_KEY_SUBMISSIONS = `${STORAGE_PREFIX}_submissions`;
const LOCAL_STORAGE_KEY_NOTIFICATIONS = `${STORAGE_PREFIX}_notifications`;
const LOCAL_STORAGE_KEY_STUDENTS = `${STORAGE_PREFIX}_students`;
const LOCAL_STORAGE_KEY_STUDENT_ID = `${STORAGE_PREFIX}_active_student_id`;
const LOCAL_STORAGE_KEY_USER_ROLE = `${STORAGE_PREFIX}_user_role`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial role and student from URL or localStorage
  const [userRole, setUserRole] = useState<'student' | 'teacher'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam === 'teacher' || roleParam === 'student') return roleParam;
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER_ROLE);
        if (saved === 'teacher' || saved === 'student') return saved;
      }
    } catch (_) {}
    return 'student';
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const stdParam = params.get('studentId') || params.get('student');
        if (stdParam) return stdParam;
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENT_ID);
        if (saved) return saved;
      }
    } catch (_) {}
    return 'std-1';
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('exerciseId') || params.get('exercise') || null;
      }
    } catch (_) {}
    return null;
  });

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('exercises');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Global Voice settings
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('standard');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.88);

  // Initialize data from LocalStorage first for instant loading
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
        const filtered = parsed.filter(e => e.id !== 'ex-student-test' && e.assignedStudentId !== 'std-test');
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

  // Keep active student and role persistent in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENT_ID, activeStudentId);
    } catch (_) {}
  }, [activeStudentId]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_ROLE, userRole);
    } catch (_) {}
  }, [userRole]);

  // Seed sample demo audio recordings on mount
  useEffect(() => {
    seedSampleAudio();
  }, []);

  // -------------------------------------------------------------
  // Real-time Cloud Sync with Firebase Firestore
  // -------------------------------------------------------------
  const isInitialMount = useRef(true);

  useEffect(() => {
    let unsubStudents: (() => void) | undefined;
    let unsubExercises: (() => void) | undefined;
    let unsubSubmissions: (() => void) | undefined;
    let unsubNotifications: (() => void) | undefined;

    try {
      // 1. Students Subscription
      unsubStudents = onSnapshot(collection(db, 'students'), snapshot => {
        if (snapshot.empty) {
          // Initialize Firestore with default students if empty
          INITIAL_STUDENTS.forEach(st => {
            setDoc(doc(db, 'students', st.id), st).catch(console.warn);
          });
        } else {
          const cloudStudents: Student[] = [];
          snapshot.forEach(d => {
            const s = d.data() as Student;
            if (s.id !== 'std-test' && !s.isTestUser) {
              cloudStudents.push(s);
            }
          });
          cloudStudents.sort((a, b) => (a.studentNumber || 0) - (b.studentNumber || 0));
          if (cloudStudents.length > 0) {
            setStudents(cloudStudents);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(cloudStudents));
            } catch (_) {}
          }
        }
        setIsCloudSynced(true);
      }, err => {
        console.warn('Firestore students sync error:', err);
      });

      // 2. Exercises Subscription
      unsubExercises = onSnapshot(collection(db, 'exercises'), snapshot => {
        if (snapshot.empty) {
          INITIAL_EXERCISES.forEach(ex => {
            setDoc(doc(db, 'exercises', ex.id), ex).catch(console.warn);
          });
        } else {
          const cloudExercises: Exercise[] = [];
          snapshot.forEach(d => {
            cloudExercises.push(d.data() as Exercise);
          });
          if (cloudExercises.length > 0) {
            setExercises(cloudExercises);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY_EXERCISES, JSON.stringify(cloudExercises));
            } catch (_) {}
          }
        }
      }, err => {
        console.warn('Firestore exercises sync error:', err);
      });

      // 3. Submissions Subscription
      unsubSubmissions = onSnapshot(collection(db, 'submissions'), snapshot => {
        if (snapshot.empty) {
          INITIAL_SUBMISSIONS.forEach(sub => {
            setDoc(doc(db, 'submissions', sub.id), sub).catch(console.warn);
          });
        } else {
          const cloudSubmissions: Submission[] = [];
          snapshot.forEach(d => {
            const s = d.data() as Submission;
            if (s.studentId !== 'std-test') {
              cloudSubmissions.push(s);
            }
          });
          // Sort by newest first
          cloudSubmissions.sort((a, b) => {
            const timeA = a.submittedAt || '';
            const timeB = b.submittedAt || '';
            return timeB.localeCompare(timeA);
          });
          setSubmissions(cloudSubmissions);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(cloudSubmissions));
          } catch (_) {}
        }
      }, err => {
        console.warn('Firestore submissions sync error:', err);
      });

      // 4. Notifications Subscription
      unsubNotifications = onSnapshot(collection(db, 'notifications'), snapshot => {
        if (snapshot.empty) {
          INITIAL_NOTIFICATIONS.forEach(notif => {
            setDoc(doc(db, 'notifications', notif.id), notif).catch(console.warn);
          });
        } else {
          const cloudNotifs: AppNotification[] = [];
          snapshot.forEach(d => {
            cloudNotifs.push(d.data() as AppNotification);
          });
          setNotifications(cloudNotifs);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(cloudNotifs));
          } catch (_) {}
        }
      }, err => {
        console.warn('Firestore notifications sync error:', err);
      });

    } catch (err) {
      console.warn('Error setting up Firestore snapshot listeners:', err);
    }

    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubExercises) unsubExercises();
      if (unsubSubmissions) unsubSubmissions();
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  // Save changes to LocalStorage as instant local backup
  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
    } catch (_) {}
  }, [exercises]);

  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch (_) {}
  }, [submissions]);

  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (_) {}
  }, [students]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const resetToDefaultClassData = async () => {
    setStudents(INITIAL_STUDENTS);
    setExercises(INITIAL_EXERCISES);
    setSubmissions(INITIAL_SUBMISSIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    seedSampleAudio();

    // Reset cloud data as well
    try {
      for (const st of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'students', st.id), st);
      }
      for (const ex of INITIAL_EXERCISES) {
        await setDoc(doc(db, 'exercises', ex.id), ex);
      }
      for (const sub of INITIAL_SUBMISSIONS) {
        await setDoc(doc(db, 'submissions', sub.id), sub);
      }
    } catch (e) {
      console.warn('Could not reset cloud data:', e);
    }

    showToast('Đã làm mới dữ liệu lớp học', 'Danh sách 10 học sinh và 10 bài tập nghe tiếng Trung đã được khôi phục chuẩn.');
  };

  const addStudent = async (name: string, chineseName: string, gradeLevel: string, targetGoal: string) => {
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
    try {
      await setDoc(doc(db, 'students', newStudent.id), newStudent);
    } catch (e) {
      console.warn('Could not save new student to Firestore:', e);
    }
    showToast('Đã thêm học sinh', `Đã thêm học sinh ${name} (${chineseName}) vào lớp.`);
  };

  const updateStudentAvatar = async (studentId: string, avatarUrl: string) => {
    // 1. Update local state immediately for fast feedback
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, avatar: avatarUrl } : s))
    );
    setSubmissions(prev =>
      prev.map(sub => (sub.studentId === studentId ? { ...sub, studentAvatar: avatarUrl } : sub))
    );

    // 2. Persist to Firestore so Teacher and all devices see it permanently
    try {
      await setDoc(doc(db, 'students', studentId), { avatar: avatarUrl }, { merge: true });
      // Update any existing submissions by this student
      submissions.filter(s => s.studentId === studentId).forEach(sub => {
        updateDoc(doc(db, 'submissions', sub.id), { studentAvatar: avatarUrl }).catch(console.warn);
      });
    } catch (e) {
      console.warn('Could not update avatar in Firestore:', e);
    }

    showToast('Đã cập nhật ảnh đại diện!', 'Ảnh đại diện mới của bạn đã được đồng bộ lên đám mây.');
  };

  const addExercise = (exerciseData: Omit<Exercise, 'id' | 'createdAt'>): string => {
    const newId = `ex-${Date.now()}`;
    const newExercise: Exercise = {
      ...exerciseData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setExercises(prev => [newExercise, ...prev]);

    setDoc(doc(db, 'exercises', newId), newExercise).catch(e => {
      console.warn('Could not save exercise to Firestore:', e);
    });

    showToast('Tạo bài nghe thành công', `Bài tập "${newExercise.title}" đã được thêm.`);
    return newId;
  };

  const updateExercise = async (id: string, updated: Partial<Exercise>) => {
    setExercises(prev => prev.map(ex => (ex.id === id ? { ...ex, ...updated } : ex)));
    try {
      await setDoc(doc(db, 'exercises', id), updated, { merge: true });
    } catch (e) {
      console.warn('Could not update exercise in Firestore:', e);
    }
    showToast('Đã cập nhật', 'Thông tin bài tập đã được lưu.');
  };

  const deleteExercise = async (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    try {
      await deleteDoc(doc(db, 'exercises', id));
    } catch (e) {
      console.warn('Could not delete exercise in Firestore:', e);
    }
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

    // Update local state immediately
    setSubmissions(prev => [newSubmission, ...prev]);

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

    // Save to Firestore so Teacher receives it in real-time across the internet
    setDoc(doc(db, 'submissions', submissionId), newSubmission).catch(e => {
      console.warn('Could not save submission to Firestore:', e);
    });
    setDoc(doc(db, 'notifications', teacherNotification.id), teacherNotification).catch(e => {
      console.warn('Could not save notification to Firestore:', e);
    });

    showToast(
      'Nộp bài thành công!',
      'Bản thu âm của bạn đã được gửi trực tiếp cho giáo viên qua hệ thống đám mây.'
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

    // Save to Firestore
    setDoc(doc(db, 'submissions', submissionId), newSubmission).catch(console.warn);
    setDoc(doc(db, 'notifications', teacherNotification.id), teacherNotification).catch(console.warn);

    showToast(
      'Đã nộp bài mẫu test thành công!',
      `Bài thu âm của ${targetStudent.name} (${targetStudent.chineseName || ''}) đã gửi tới giáo viên qua máy chủ.`
    );

    return submissionId;
  };

  const gradeAssignment = async (submissionId: string, grade: GradeFeedback) => {
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

    const targetSub = submissions.find(s => s.id === submissionId);
    let studentNotification: AppNotification | null = null;
    if (targetSub) {
      const exercise = exercises.find(e => e.id === targetSub.exerciseId);
      studentNotification = {
        id: `notif-s-${Date.now()}`,
        recipientRole: 'student',
        studentId: targetSub.studentId,
        title: '🎉 Giáo viên đã chấm điểm & gửi nhận xét!',
        message: `${grade.gradedBy} đã chấm bài "${exercise?.title || 'Luyện nghe'}". Điểm: ${grade.totalScore}/10.${grade.teacherAudioBlobId ? ' Có kèm lời nhận xét bằng giọng nói!' : ''} Bấm để xem và nghe ngay!`,
        submissionId,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      setNotifications(prev => [studentNotification!, ...prev]);
    }

    // Persist grade and notification to Firestore
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: 'graded',
        grade
      });
      if (studentNotification) {
        await setDoc(doc(db, 'notifications', studentNotification.id), studentNotification);
      }
    } catch (e) {
      console.warn('Could not update grade in Firestore:', e);
    }

    showToast(
      'Đã chấm điểm & Gửi nhận xét trực tiếp!',
      `Học sinh ${targetSub?.studentName || ''} đã nhận được phản hồi qua đám mây.`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    updateDoc(doc(db, 'notifications', id), { isRead: true }).catch(console.warn);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    notifications.forEach(n => {
      updateDoc(doc(db, 'notifications', n.id), { isRead: true }).catch(console.warn);
    });
  };

  const copyStudentAssignmentLink = (studentId?: string, exerciseId?: string) => {
    const targetStdId = studentId || activeStudentId;
    const targetStudent = students.find(s => s.id === targetStdId) || activeStudent;
    const targetExId =
      exerciseId ||
      selectedExerciseId ||
      exercises.find(e => e.assignedStudentId === targetStdId)?.id ||
      exercises[0]?.id;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'student');
      url.searchParams.set('studentId', targetStdId);
      if (targetExId) {
        url.searchParams.set('exerciseId', targetExId);
      }

      const linkString = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkString);
      }
      showToast(
        'Đã sao chép link học sinh!',
        `Link trực tiếp cho học sinh ${targetStudent?.name || ''} (${targetStudent?.chineseName || ''}) đã được sao chép. Khi học sinh mở link này, hệ thống sẽ tự nhận diện đúng bài tập và lưu lại tiến độ!`
      );
    } catch (err) {
      console.warn('Could not copy link:', err);
    }
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
        resetToDefaultClassData,
        copyStudentAssignmentLink,
        isCloudSynced
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
