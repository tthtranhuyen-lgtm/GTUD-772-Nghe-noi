import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Mic, CheckCircle2, Clock3, ChevronRight, Filter, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SubmissionsInboxProps {
  onSelectSubmission: (submissionId: string) => void;
}

export const SubmissionsInbox: React.FC<SubmissionsInboxProps> = ({ onSelectSubmission }) => {
  const { submissions, exercises } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const exercisesMap = useMemo(() => {
    return new Map(exercises.map(e => [e.id, e]));
  }, [exercises]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const ex = exercisesMap.get(s.exerciseId);
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex?.title || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, exercisesMap, searchQuery, filterStatus]);

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="space-y-6">
      {/* Teacher Welcome & Inbox Header with Chinese Aesthetics */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 chinese-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="chinese-seal text-[11px] font-bold text-red-700">
              教师工作台
            </span>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Bàn làm việc của giáo viên tiếng Trung
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hộp thư kiểm tra & Chấm điểm bài thu âm
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Học sinh nộp bài là hệ thống đồng bộ ngay lập tức. Giáo viên có thể vào nghe lại từng câu phát âm tiếng Trung, cho điểm theo thang Rubric 4 tiêu chí và thu âm trực tiếp lời nhận xét của mình.
          </p>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-center">
            <span className="text-xs text-red-800 font-bold block">Cần chấm điểm</span>
            <span className="text-2xl font-black text-red-700 font-mono tabular-nums">
              {pendingCount}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-center">
            <span className="text-xs text-emerald-800 font-bold block">Đã có nhận xét</span>
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {gradedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation & Real-Time Sync Callout */}
      <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">
              Hệ thống đồng bộ trực tiếp:
            </span>{' '}
            <span className="text-slate-700">
              Bất kỳ học sinh nào trong lớp nộp bài sẽ tự động xuất hiện ngay tại đây với trạng thái <strong className="text-red-700">"Chờ chấm điểm"</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tab buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả bài ({submissions.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-white text-red-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Cần chấm ({pendingCount})</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === 'graded'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã chấm ({gradedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc bài tập..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock3 className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-600" />
            <p className="text-xs">Không tìm thấy bài nộp nào phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSubmissions.map(sub => {
              const ex = exercisesMap.get(sub.exerciseId);
              const isGraded = sub.status === 'graded';
              const speakingAnswer = Object.values(sub.answers).find(
                a => a.type === 'audio_recording' && a.audioBlobId
              );

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub.id)}
                  className="p-5 hover:bg-amber-50/30 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left: Student & Exercise info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={sub.studentAvatar}
                      alt={sub.studentName}
                      className="w-11 h-11 rounded-full object-cover border border-amber-300 mt-0.5 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                          {sub.studentName}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono">{sub.submittedAt}</span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium">
                        Bài: <span className="font-semibold text-slate-900">{ex?.title || 'Bài tập nghe'}</span>
                        <span className="text-red-700 ml-2 font-normal font-chinese">({ex?.level})</span>
                      </div>

                      {/* Speaking response presence */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        {speakingAnswer ? (
                          <span className="inline-flex items-center gap-1 text-red-800 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
                            <Mic className="w-3.5 h-3.5 text-red-700" />
                            <span>Có bản thu âm câu trả lời</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa nộp thu âm</span>
                        )}

                        {isGraded && sub.grade?.teacherAudioBlobId && (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span>🎙️ Đã có ghi âm nhận xét của cô</span>
                          </span>
                        )}
                        <span>·</span>
                        <span>{Object.keys(sub.answers).length} câu hỏi</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Action */}
                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    {isGraded && sub.grade ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã chấm: {sub.grade.totalScore}/10</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Bởi {sub.grade.gradedBy}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 animate-pulse">
                        <Clock3 className="w-3.5 h-3.5 text-red-700" />
                        <span>Chờ chấm điểm</span>
                      </span>
                    )}

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectSubmission(sub.id);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>{isGraded ? 'Xem lại & sửa điểm' : 'Chấm điểm & Thu âm nhận xét'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
