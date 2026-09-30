import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Submission, Exercise, RubricScores, GradeFeedback } from '../../types';
import { getAudioObjectUrl } from '../../utils/audioStorage';
import { AudioRecorder } from '../AudioRecorder';
import { ArrowLeft, Mic, Play, Pause, CheckCircle2, Send, Award, BookOpen, Volume2, Gauge, AlertCircle, Sparkles } from 'lucide-react';
import { speechService } from '../../utils/speechSynthesis';

interface GradingStudioProps {
  submission: Submission;
  exercise: Exercise;
  onBack: () => void;
}

export const GradingStudio: React.FC<GradingStudioProps> = ({ submission, exercise, onBack }) => {
  const { gradeAssignment, speechSpeed, voiceGender } = useApp();

  const [studentAudioUrls, setStudentAudioUrls] = useState<Record<string, string>>({});
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1.0);
  const [showScriptDrawer, setShowScriptDrawer] = useState(false);

  // Teacher Voice Recording state
  const [teacherAudioBlobId, setTeacherAudioBlobId] = useState<string | undefined>(
    submission.grade?.teacherAudioBlobId
  );
  const [teacherAudioDurationSec, setTeacherAudioDurationSec] = useState<number | undefined>(
    submission.grade?.teacherAudioDurationSec
  );

  // Rubric scores state
  const initialGrade = submission.grade;
  const [rubricScores, setRubricScores] = useState<RubricScores>(() => {
    return initialGrade?.rubricScores || {
      pronunciation: 9.0,
      comprehension: 9.0,
      fluency: 8.5,
      vocabulary: 9.0
    };
  });

  const [feedbackText, setFeedbackText] = useState<string>(() => {
    return (
      initialGrade?.feedbackText ||
      `Chào ${submission.studentName}, cô đã nghe rất kỹ các câu trả lời thu âm của em. Em phát âm rõ ràng, các thanh điệu thanh 1 và thanh 4 rất tiến bộ. Cô có thu âm thêm lời hướng dẫn chi tiết bên dưới, em hãy bấm nghe nhé!`
    );
  });

  const availableBadges = [
    'Phát âm chuẩn xác',
    'Thanh điệu chuẩn xác',
    'Ngữ điệu tự nhiên',
    'Hiểu bài sâu sắc',
    'Tiến bộ vượt bậc',
    'Nói trôi chảy'
  ];

  const [selectedBadges, setSelectedBadges] = useState<string[]>(() => {
    return initialGrade?.badges || ['Phát âm chuẩn xác', 'Thanh điệu chuẩn xác'];
  });

  const [gradedBy, setGradedBy] = useState<string>(() => {
    return initialGrade?.gradedBy || 'Cô Trần Huyền (Giáo viên phụ trách)';
  });

  // Calculate live total score
  const totalScore = Number(
    (
      (rubricScores.pronunciation +
        rubricScores.comprehension +
        rubricScores.fluency +
        rubricScores.vocabulary) /
      4
    ).toFixed(1)
  );

  // Load all student's recorded audio object URLs for each question
  useEffect(() => {
    let active = true;
    const urls: Record<string, string> = {};

    const loadAudios = async () => {
      for (const [qId, ans] of Object.entries(submission.answers)) {
        if (ans.audioBlobId) {
          const url = await getAudioObjectUrl(ans.audioBlobId);
          if (url && active) {
            urls[qId] = url;
          }
        }
      }
      if (active) {
        setStudentAudioUrls(urls);
      }
    };

    loadAudios();
    return () => {
      active = false;
    };
  }, [submission]);

  const togglePlayAudio = (qId: string) => {
    const audioEl = document.getElementById(`audio-player-${qId}`) as HTMLAudioElement | null;
    if (!audioEl) return;

    if (playingAudioKey === qId) {
      audioEl.pause();
      setPlayingAudioKey(null);
    } else {
      // Pause any currently playing
      if (playingAudioKey) {
        const prevEl = document.getElementById(`audio-player-${playingAudioKey}`) as HTMLAudioElement | null;
        if (prevEl) prevEl.pause();
      }
      audioEl.playbackRate = audioPlaybackRate;
      audioEl.play().catch(err => console.warn('Play error:', err));
      setPlayingAudioKey(qId);
    }
  };

  const handleScoreChange = (field: keyof RubricScores, value: number) => {
    setRubricScores(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(10, value))
    }));
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  const handleSaveAndSendFeedback = () => {
    const grade: GradeFeedback = {
      gradedAt: new Date().toLocaleString('vi-VN'),
      gradedBy,
      totalScore,
      rubricScores,
      feedbackText,
      badges: selectedBadges,
      teacherAudioBlobId,
      teacherAudioDurationSec
    };

    gradeAssignment(submission.id, grade);
    onBack();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại hộp thư chấm điểm</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Giáo viên chấm:</span>
          <input
            type="text"
            value={gradedBy}
            onChange={e => setGradedBy(e.target.value)}
            className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* Main Student Submission Banner with Chinese Card Styling */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 chinese-card">
        <div className="flex items-center gap-4">
          <img
            src={submission.studentAvatar}
            alt={submission.studentName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="chinese-seal text-[10px] text-red-700 font-bold">HSK</span>
              <h1 className="text-xl font-bold text-slate-900">{submission.studentName}</h1>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Nộp: {submission.submittedAt}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Bài nộp: <span className="text-red-800 font-bold">{exercise.title}</span> ({exercise.level})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Playback speed for teacher to closely inspect pronunciation */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs">
            <Gauge className="w-3.5 h-3.5 text-red-700" />
            <span className="text-slate-600">Tốc độ nghe:</span>
            <button
              onClick={() => {
                const nextRate = audioPlaybackRate === 1.0 ? 0.8 : audioPlaybackRate === 0.8 ? 0.6 : 1.0;
                setAudioPlaybackRate(nextRate);
                if (playingAudioKey) {
                  const el = document.getElementById(`audio-player-${playingAudioKey}`) as HTMLAudioElement | null;
                  if (el) el.playbackRate = nextRate;
                }
              }}
              className="px-2 py-0.5 bg-white border border-amber-300 rounded font-mono font-bold text-red-800 text-xs hover:bg-amber-50"
            >
              {audioPlaybackRate}x
            </button>
          </div>

          <button
            onClick={() => setShowScriptDrawer(!showScriptDrawer)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showScriptDrawer ? 'Ẩn câu hỏi gốc' : 'Xem câu hỏi & đáp án'}</span>
          </button>
        </div>
      </div>

      {/* Script Drawer */}
      {showScriptDrawer && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Bản ghi nội dung câu hỏi & Từ vựng tham khảo
            </span>
          </div>
          <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white/90 p-4 rounded-xl border border-amber-100 font-sans">
            {exercise.transcript}
          </div>
        </div>
      )}

      {/* Two-Column Studio Layout: Student Audio Recordings on Left, Rubric & Teacher Recording on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Student's Answers & Voice Recordings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-red-700" />
              <span>Bản thu âm của học sinh theo từng câu ({exercise.questions.length} câu)</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Giáo viên bấm nghe từng câu để chấm điểm
            </span>
          </div>

          {exercise.questions.map((q, idx) => {
            const answer = submission.answers[q.id];
            const audioUrl = studentAudioUrls[q.id];
            const isPlaying = playingAudioKey === q.id;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 hover:border-amber-300 transition-colors"
              >
                {/* Question Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-red-50 text-red-800 font-bold text-xs flex items-center justify-center shrink-0 border border-red-200">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-base font-bold text-slate-900 font-chinese">{q.prompt}</div>
                      {q.pinyin && <div className="text-xs text-red-700 font-mono">{q.pinyin}</div>}
                      {q.translationVi && (
                        <div className="text-xs text-slate-500 mt-0.5">Dịch: {q.translationVi}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student's Audio Player */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {audioUrl ? (
                      <>
                        <audio
                          id={`audio-player-${q.id}`}
                          src={audioUrl}
                          onEnded={() => setPlayingAudioKey(null)}
                          className="hidden"
                        />
                        <button
                          onClick={() => togglePlayAudio(q.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            isPlaying
                              ? 'bg-red-700 text-white animate-pulse'
                              : 'bg-white text-red-800 border border-red-200 hover:bg-red-50'
                          }`}
                          title={isPlaying ? 'Tạm dừng' : 'Nghe câu trả lời của học sinh'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {isPlaying ? 'Đang phát âm thanh...' : 'Bản thu âm của học sinh'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Thời lượng: {answer?.audioDurationSec || 8}s · Tốc độ: {audioPlaybackRate}x
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Học sinh chưa thu âm cho câu hỏi này</span>
                      </div>
                    )}
                  </div>

                  {answer?.textAnswer && (
                    <div className="text-right text-xs max-w-xs truncate text-slate-600 font-medium">
                      Chữ: <span className="font-bold text-slate-800 font-chinese">{answer.textAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Rubric Scoring, Qualitative Feedback & TEACHER VOICE RECORDING */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs space-y-5 chinese-card">
            {/* Header & Total Score */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                  Đánh giá theo Rubric
                </span>
                <span className="text-sm font-bold text-slate-900">Thang điểm 4 tiêu chí</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Điểm tổng kết</span>
                <span className="text-3xl font-black text-red-700 font-mono tabular-nums">
                  {totalScore}
                  <span className="text-xs font-normal text-slate-400">/10</span>
                </span>
              </div>
            </div>

            {/* Rubric Sliders / Scorers */}
            <div className="space-y-4">
              {/* 1. Pronunciation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">1. Phát âm & Thanh điệu (声调)</span>
                  <span className="font-bold text-red-700 font-mono">{rubricScores.pronunciation}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rubricScores.pronunciation}
                  onChange={e => handleScoreChange('pronunciation', parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>

              {/* 2. Comprehension */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">2. Hiểu câu hỏi & Trả lời đúng trọng tâm</span>
                  <span className="font-bold text-red-700 font-mono">{rubricScores.comprehension}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rubricScores.comprehension}
                  onChange={e => handleScoreChange('comprehension', parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>

              {/* 3. Fluency */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">3. Độ lưu loát & Tự nhiên (流利度)</span>
                  <span className="font-bold text-red-700 font-mono">{rubricScores.fluency}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rubricScores.fluency}
                  onChange={e => handleScoreChange('fluency', parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>

              {/* 4. Vocabulary */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">4. Từ vựng & Ngữ pháp (词汇与语法)</span>
                  <span className="font-bold text-red-700 font-mono">{rubricScores.vocabulary}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rubricScores.vocabulary}
                  onChange={e => handleScoreChange('vocabulary', parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Badges / Encouragements */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Huy hiệu khen thưởng</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableBadges.map(badge => {
                  const isSelected = selectedBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TEACHER VOICE FEEDBACK RECORDING COMPONENT */}
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                  <Mic className="w-4 h-4 text-red-700" />
                  <span>Ghi âm lời nhận xét & sửa phát âm cho học sinh</span>
                </div>
                {teacherAudioBlobId && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Đã có ghi âm
                  </span>
                )}
              </div>
              <p className="text-[11px] text-red-900 leading-relaxed">
                Giáo viên có thể thu âm trực tiếp để đọc mẫu thanh điệu, chỉnh khẩu hình hoặc khích lệ học sinh:
              </p>

              <AudioRecorder
                questionId={`teacher_rec_${submission.id}`}
                targetDurationSec={60}
                initialBlobId={teacherAudioBlobId}
                onRecordingComplete={(blobId, durationSec) => {
                  setTeacherAudioBlobId(blobId);
                  setTeacherAudioDurationSec(durationSec);
                }}
                onRecordingRemoved={() => {
                  setTeacherAudioBlobId(undefined);
                  setTeacherAudioDurationSec(undefined);
                }}
              />
            </div>

            {/* Written Feedback text */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lời nhận xét bằng chữ:
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Nhận xét điểm mạnh, lỗi thanh điệu cần chú ý..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Action Button: Send Direct Feedback */}
            <button
              onClick={handleSaveAndSendFeedback}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs rounded-xl shadow-md transition-all transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Lưu & Gửi phản hồi trực tiếp cho {submission.studentName}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Học sinh sẽ nhận thông báo kèm bản ghi âm của cô ngay lập tức.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
