import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Mic, BookOpen, Clock, ChevronRight, CheckCircle2, Clock3, Star, Sparkles, Camera, Share2 } from 'lucide-react';
import { AvatarUploadModal } from './AvatarUploadModal';

interface ExerciseListProps {
  onSelectExercise: (id: string) => void;
  onOpenFeedback: (submissionId: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ onSelectExercise, onOpenFeedback }) => {
  const { exercises, submissions, activeStudent, copyStudentAssignmentLink } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'my_assigned' | 'all'>('my_assigned');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Map submissions of current student to exercise IDs
  const studentSubmissionsMap = useMemo(() => {
    const map = new Map<string, typeof submissions[0]>();
    submissions
      .filter(s => s.studentId === activeStudent.id)
      .forEach(s => {
        if (!map.has(s.exerciseId)) {
          map.set(s.exerciseId, s);
        }
      });
    return map;
  }, [submissions, activeStudent.id]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchSearch =
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.topic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFilter =
        filterMode === 'all' || (filterMode === 'my_assigned' && (!ex.assignedStudentId || ex.assignedStudentId === activeStudent.id));

      return matchSearch && matchFilter;
    });
  }, [exercises, searchQuery, filterMode, activeStudent.id]);

  // Overall student stats
  const completedCount = studentSubmissionsMap.size;
  const gradedList = Array.from(studentSubmissionsMap.values()).filter(s => s.status === 'graded');
  const avgScore = gradedList.length > 0
    ? (gradedList.reduce((acc, curr) => acc + (curr.grade?.totalScore || 0), 0) / gradedList.length).toFixed(1)
    : 'Chưa có';

  return (
    <div className="space-y-6">
      {/* Student Welcome & Quick Stats Banner */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 chinese-card">
        <div className="flex items-center gap-4">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Bấm vào để đổi ảnh đại diện của bạn"
          >
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-amber-100 border-2 border-amber-300 group-hover:brightness-90 transition-all shadow-xs"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-red-800 font-semibold mb-1">
              <span className="chinese-seal text-[10px] font-bold">华语</span>
              <span>Chào mừng {activeStudent.name} ({activeStudent.chineseName})</span>
              <span>·</span>
              <span className="text-slate-500">
                Học sinh số {activeStudent.studentNumber}
              </span>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-[11px] text-red-700 hover:text-red-900 font-semibold underline ml-1"
              >
                Đổi ảnh đại diện
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bài tập Luyện nghe & Thu âm trả lời Tiếng Trung
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 divide-x divide-amber-100 bg-amber-50/50 px-5 py-3 rounded-xl border border-amber-200/60">
          <div className="pr-4">
            <span className="text-xs text-slate-500 block">Bài đã nộp</span>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums font-mono">
              {completedCount} <span className="text-xs font-normal text-slate-500">bài</span>
            </span>
          </div>
          <div className="pl-4">
            <span className="text-xs text-slate-500 block">Điểm trung bình</span>
            <span className="text-xl font-extrabold text-red-700 tabular-nums font-mono">
              {avgScore} <span className="text-xs font-normal text-slate-500">{avgScore !== 'Chưa có' ? '/ 10' : ''}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter options */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('my_assigned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                filterMode === 'my_assigned'
                  ? 'bg-white text-red-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Bài giao cho tôi</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả các bài trong lớp ({exercises.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chủ đề, tiêu đề bài tập..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        {/* Quick status count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Tìm thấy {filteredExercises.length} bài tập luyện nghe & thu âm</span>
          <span className="text-[11px] text-slate-400">Tất cả bài tập đều có câu hỏi thu âm micro</span>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map(ex => {
          const sub = studentSubmissionsMap.get(ex.id);
          const isMyAssigned = ex.assignedStudentId === activeStudent.id;

          return (
            <div
              key={ex.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isMyAssigned
                  ? 'border-red-300 ring-2 ring-red-500/10'
                  : 'border-slate-200 hover:border-red-200'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-800">{ex.level}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">{ex.topic}</span>
                  </div>
                  {isMyAssigned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-red-800 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Bài tập của bạn hôm nay</span>
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1.5 leading-snug">
                  {ex.title}
                </h2>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {ex.description}
                </p>

                {/* Exercise feature hints */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ex.questions.length} câu hỏi nghe & nói</span>
                  </span>
                  <span className="flex items-center gap-1 text-red-700 font-medium">
                    <Mic className="w-3.5 h-3.5 text-red-600" />
                    <span>Ghi âm từng câu</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{ex.durationSeconds}s</span>
                  </span>
                </div>
              </div>

              {/* Status and CTA Button */}
              <div className="flex items-center justify-between pt-2">
                {sub ? (
                  sub.status === 'graded' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chấm: {sub.grade?.totalScore}/10</span>
                      </span>
                      {sub.grade?.teacherAudioBlobId && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          🎙️ Có giọng cô
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đang chờ cô chấm điểm</span>
                    </span>
                  )
                ) : (
                  <span className="text-xs text-slate-400">Chưa nộp bài</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyStudentAssignmentLink(ex.assignedStudentId, ex.id)}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
                    title="Sao chép link làm bài này gửi học sinh"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi link</span>
                  </button>

                  {sub?.status === 'graded' && (
                    <button
                      onClick={() => onOpenFeedback(sub.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:underline"
                    >
                      Xem nhận xét
                    </button>
                  )}
                  <button
                    onClick={() => onSelectExercise(ex.id)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>{sub ? 'Làm lại bài' : 'Vào luyện nghe'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
