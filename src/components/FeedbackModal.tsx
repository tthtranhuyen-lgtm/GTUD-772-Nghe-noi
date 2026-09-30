import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, Volume2, Sparkles, User, Calendar, MessageSquareQuote, Mic } from 'lucide-react';
import { Submission, Exercise } from '../types';
import { getAudioObjectUrl } from '../utils/audioStorage';

interface FeedbackModalProps {
  submission: Submission;
  exercise: Exercise;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ submission, exercise, onClose }) => {
  const grade = submission.grade;
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [studentAudioUrls, setStudentAudioUrls] = useState<Record<string, string>>({});

  // Load teacher's voice feedback audio
  useEffect(() => {
    let active = true;
    if (grade?.teacherAudioBlobId) {
      getAudioObjectUrl(grade.teacherAudioBlobId).then(url => {
        if (active && url) {
          setTeacherAudioUrl(url);
        }
      });
    }

    // Load student's question audio
    const loadStudentAudios = async () => {
      const urls: Record<string, string> = {};
      for (const [qId, ans] of Object.entries(submission.answers)) {
        if (ans.audioBlobId) {
          const url = await getAudioObjectUrl(ans.audioBlobId);
          if (url && active) {
            urls[qId] = url;
          }
        }
      }
      if (active) setStudentAudioUrls(urls);
    };

    loadStudentAudios();
    return () => {
      active = false;
    };
  }, [grade, submission]);

  if (!grade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Phản hồi trực tiếp từ giáo viên
            </span>
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{exercise.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-xs mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Giáo viên: {grade.gradedBy}</span>
                <span>·</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>{grade.gradedAt}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kết quả đánh giá bài nghe & thu âm</h3>
              <p className="text-xs text-indigo-200 max-w-md leading-relaxed">
                Bài thu âm của bạn đã được giáo viên lắng nghe kĩ lưỡng từng thanh điệu, ngữ âm và gửi nhận xét bên dưới.
              </p>
            </div>

            <div className="shrink-0 text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
              <span className="text-xs text-indigo-200 font-medium block">Điểm tổng kết</span>
              <span className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
                {grade.totalScore}
              </span>
              <span className="text-xs text-indigo-300 block">/ 10 điểm</span>
            </div>
          </div>

          {/* TEACHER'S VOICE AUDIO FEEDBACK (If available) */}
          {teacherAudioUrl && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span>🎙️ Bản thu âm nhận xét & sửa phát âm của cô</span>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  {grade.teacherAudioDurationSec ? `${grade.teacherAudioDurationSec} giây` : 'Ghi âm'}
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Hãy bật loa hoặc đeo tai nghe để lắng nghe cô đọc mẫu và chỉ ra những thanh điệu cần sửa:
              </p>
              <audio controls src={teacherAudioUrl} className="w-full h-10 rounded-lg shadow-2xs" />
            </div>
          )}

          {/* Badges won */}
          {grade.badges && grade.badges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Huy hiệu khích lệ của cô</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {grade.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rubric Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Chi tiết tiêu chí chấm điểm (Rubric)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-700">Phát âm & Thanh điệu (声调)</span>
                  <span className="text-xs font-bold text-indigo-600 font-mono tabular-nums">
                    {grade.rubricScores.pronunciation} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(grade.rubricScores.pronunciation / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-700">Hiểu nội dung câu hỏi</span>
                  <span className="text-xs font-bold text-sky-600 font-mono tabular-nums">
                    {grade.rubricScores.comprehension} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full"
                    style={{ width: `${(grade.rubricScores.comprehension / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-700">Độ lưu loát & Tự nhiên</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono tabular-nums">
                    {grade.rubricScores.fluency} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(grade.rubricScores.fluency / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-700">Từ vựng & Cấu trúc trả lời</span>
                  <span className="text-xs font-bold text-purple-600 font-mono tabular-nums">
                    {grade.rubricScores.vocabulary} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${(grade.rubricScores.vocabulary / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher's Detailed Written Feedback */}
          <div className="p-5 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-sky-900 font-semibold text-sm">
              <MessageSquareQuote className="w-4 h-4 text-sky-600" />
              <span>Lời nhận xét của cô</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-line">
              "{grade.feedbackText}"
            </p>
          </div>

          {/* Student's recordings playback review */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bản thu âm của bạn đã gửi cô
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {exercise.questions.map((q, i) => {
                const url = studentAudioUrls[q.id];
                if (!url) return null;
                return (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{q.prompt}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{q.pinyin}</span>
                    </div>
                    <audio controls src={url} className="h-8 max-w-[200px]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Đã xem xong
          </button>
        </div>
      </div>
    </div>
  );
};
