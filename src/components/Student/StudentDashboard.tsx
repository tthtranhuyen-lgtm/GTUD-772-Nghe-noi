import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Clock, CheckCircle2, ChevronRight, BarChart3, TrendingUp, Sparkles, MessageSquareQuote, Mic, Camera } from 'lucide-react';
import { AvatarUploadModal } from './AvatarUploadModal';

interface StudentDashboardProps {
  onOpenFeedback: (submissionId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenFeedback, onSelectExercise }) => {
  const { submissions, exercises, activeStudent } = useApp();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const studentSubmissions = useMemo(() => {
    return submissions.filter(s => s.studentId === activeStudent.id);
  }, [submissions, activeStudent.id]);

  const gradedSubmissions = useMemo(() => {
    return studentSubmissions.filter(s => s.status === 'graded');
  }, [studentSubmissions]);

  // Calculate rubric averages
  const rubricAverages = useMemo(() => {
    if (gradedSubmissions.length === 0) {
      return { pronunciation: '—', comprehension: '—', fluency: '—', vocabulary: '—', total: '—' };
    }
    const count = gradedSubmissions.length;
    let sumPron = 0;
    let sumComp = 0;
    let sumFlu = 0;
    let sumVocab = 0;
    let sumTotal = 0;

    gradedSubmissions.forEach(s => {
      if (s.grade) {
        sumPron += s.grade.rubricScores.pronunciation;
        sumComp += s.grade.rubricScores.comprehension;
        sumFlu += s.grade.rubricScores.fluency;
        sumVocab += s.grade.rubricScores.vocabulary;
        sumTotal += s.grade.totalScore;
      }
    });

    return {
      pronunciation: (sumPron / count).toFixed(1),
      comprehension: (sumComp / count).toFixed(1),
      fluency: (sumFlu / count).toFixed(1),
      vocabulary: (sumVocab / count).toFixed(1),
      total: (sumTotal / count).toFixed(1)
    };
  }, [gradedSubmissions]);

  // Exercises map
  const exercisesMap = useMemo(() => {
    return new Map(exercises.map(e => [e.id, e]));
  }, [exercises]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 chinese-card">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-100 border-2 border-amber-300 group-hover:brightness-90 transition-all shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">Đổi ảnh</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Camera className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{activeStudent.name}</h1>
              <span className="text-lg font-bold text-red-700 font-chinese">
                {activeStudent.chineseName}
              </span>
              <span className="px-2.5 py-0.5 bg-amber-50 text-red-800 border border-amber-200 font-bold text-xs rounded-full">
                Học sinh {activeStudent.studentNumber}
              </span>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:text-white bg-red-50 hover:bg-red-700 border border-red-200 rounded-lg transition-all shadow-2xs"
              >
                <Camera className="w-3 h-3" />
                <span>Đổi ảnh đại diện</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mục tiêu học tập: <span className="text-slate-700 font-medium">{activeStudent.targetGoal}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Lớp: {activeStudent.gradeLevel} · Email: {activeStudent.email}
            </p>
          </div>
        </div>

        {/* Quick Overall Average */}
        <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shrink-0 shadow-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Điểm trung bình</span>
            <span className="text-2xl font-black text-indigo-400 tabular-nums font-mono">
              {rubricAverages.total} <span className="text-xs font-normal text-slate-400">{rubricAverages.total !== '—' ? '/ 10' : ''}</span>
            </span>
          </div>
          <div className="border-l border-slate-800 pl-5">
            <span className="text-xs text-slate-400 block font-medium">Bài đã nộp</span>
            <span className="text-2xl font-black text-white tabular-nums font-mono">
              {studentSubmissions.length}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Criteria Rubric Performance Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Đánh giá kỹ năng chi tiết qua các bài nghe & thu âm
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Dựa trên {gradedSubmissions.length} bài đã được giáo viên chấm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">Phát âm & Thanh điệu (声调)</span>
              <span className="text-sm font-bold text-indigo-600 font-mono tabular-nums">
                {rubricAverages.pronunciation}/10
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${(Number(rubricAverages.pronunciation) || 0) * 10}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Độ chuẩn xác thanh 1, thanh 4 và biến điệu</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">Nghe hiểu câu hỏi</span>
              <span className="text-sm font-bold text-sky-600 font-mono tabular-nums">
                {rubricAverages.comprehension}/10
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-sky-600 h-full rounded-full transition-all"
                style={{ width: `${(Number(rubricAverages.comprehension) || 0) * 10}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Nắm bắt đại từ nghi vấn và nội dung</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">Độ lưu loát (Fluency)</span>
              <span className="text-sm font-bold text-emerald-600 font-mono tabular-nums">
                {rubricAverages.fluency}/10
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${(Number(rubricAverages.fluency) || 0) * 10}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Tốc độ phản xạ và sự tự nhiên khi thu âm</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">Từ vựng & Cấu trúc</span>
              <span className="text-sm font-bold text-purple-600 font-mono tabular-nums">
                {rubricAverages.vocabulary}/10
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-purple-600 h-full rounded-full transition-all"
                style={{ width: `${(Number(rubricAverages.vocabulary) || 0) * 10}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Cách trả lời đầy đủ chủ ngữ - vị ngữ</p>
          </div>
        </div>
      </div>

      {/* Submissions & Teacher Feedback Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Lịch sử bài nộp & Nhận xét của cô
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">{studentSubmissions.length} bài làm</span>
        </div>

        {studentSubmissions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Bạn chưa nộp bài luyện nghe & thu âm nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentSubmissions.map(sub => {
              const ex = exercisesMap.get(sub.exerciseId);
              const isGraded = sub.status === 'graded';

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-700">{ex?.level || 'Tiếng Trung'}</span>
                      <span>·</span>
                      <span>Nộp lúc: {sub.submittedAt}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {ex?.title || 'Bài tập nghe & thu âm'}
                    </h3>

                    {/* Teacher feedback snippet if graded */}
                    {isGraded && sub.grade && (
                      <div className="pt-1 space-y-1.5">
                        <p className="text-xs text-slate-600 italic line-clamp-2">
                          "{sub.grade.feedbackText}"
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          {sub.grade.teacherAudioBlobId && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200">
                              <Mic className="w-3 h-3 text-emerald-600" />
                              <span>Có thu âm sửa phát âm của cô</span>
                            </span>
                          )}

                          {sub.grade.badges && sub.grade.badges.map((b, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-medium rounded border border-amber-200"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>{b}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side: Score & Action button */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {isGraded && sub.grade ? (
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">Điểm số</span>
                        <span className="text-lg font-black text-emerald-600 font-mono tabular-nums">
                          {sub.grade.totalScore} / 10
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[11px] text-amber-600 font-bold block">
                          Chờ cô chấm điểm
                        </span>
                        <span className="text-xs text-slate-400">Đã gửi bản thu âm</span>
                      </div>
                    )}

                    {isGraded ? (
                      <button
                        onClick={() => onOpenFeedback(sub.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>Xem nhận xét & Nghe cô sửa</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectExercise(sub.exerciseId)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                      >
                        <span>Xem lại bài</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
