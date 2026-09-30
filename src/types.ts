export type ExerciseLevel = 'Sơ cấp (A1-A2)' | 'Trung cấp (B1-B2)' | 'Nâng cao (C1-IELTS)';

export type ExerciseTopic = 
  | 'Giao tiếp hàng ngày' 
  | 'Học thuật & Trường học' 
  | 'Công nghệ & Đổi mới' 
  | 'Văn hóa & Đời sống' 
  | 'Công sở & Phỏng vấn'
  | 'Tiếng Trung giao tiếp';

export type QuestionType = 'multiple_choice' | 'audio_recording' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  pinyin?: string;
  translationVi?: string;
  options?: string[]; // for multiple_choice
  correctAnswer?: number; // 0-indexed for multiple_choice
  explanation?: string;
  guidePrompt?: string; // guidance for speaking
  targetDurationSec?: number; // recommended audio recording length
}

export interface VocabularyHint {
  word: string;
  phonetic?: string;
  meaning: string;
}

export interface Exercise {
  id: string;
  assignedStudentId?: string; // Specific student assignment if personalized
  title: string;
  description: string;
  level: ExerciseLevel;
  topic: ExerciseTopic;
  language: 'vi' | 'en' | 'zh';
  audioSourceType: 'tts' | 'audio_url' | 'uploaded';
  audioUrl?: string;
  ttsScript?: string;
  durationSeconds: number;
  transcript: string;
  vocabularyHints: VocabularyHint[];
  questions: Question[];
  createdAt: string;
  createdBy: string;
}

export interface AnswerItem {
  questionId: string;
  type: QuestionType;
  selectedOption?: number;
  textAnswer?: string;
  audioBlobId?: string;
  audioDurationSec?: number;
}

export interface RubricScores {
  pronunciation: number; // Phát âm & Ngữ điệu (0-10)
  comprehension: number; // Hiểu nội dung & Bắt ý chính (0-10)
  fluency: number;       // Độ lưu loát & Tự nhiên (0-10)
  vocabulary: number;    // Từ vựng & Cấu trúc diễn đạt (0-10)
}

export interface GradeFeedback {
  gradedAt: string;
  gradedBy: string;
  totalScore: number; // thang điểm 10
  rubricScores: RubricScores;
  feedbackText: string;
  badges: string[];
  teacherAudioBlobId?: string; // Teacher's recorded voice feedback
  teacherAudioDurationSec?: number;
}

export interface Submission {
  id: string;
  exerciseId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  answers: Record<string, AnswerItem>;
  status: 'pending' | 'graded';
  grade?: GradeFeedback;
}

export interface Student {
  id: string;
  name: string;
  chineseName?: string;
  studentNumber: number;
  email: string;
  avatar: string;
  gradeLevel: string;
  targetGoal: string;
  enrolledDate: string;
  isTestUser?: boolean;
}

export interface AppNotification {
  id: string;
  recipientRole: 'student' | 'teacher';
  studentId?: string;
  title: string;
  message: string;
  submissionId: string;
  createdAt: string;
  isRead: boolean;
}
