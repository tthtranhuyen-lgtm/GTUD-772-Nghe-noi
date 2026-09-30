import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exercise, AnswerItem } from '../../types';
import { AudioPlayer } from '../AudioPlayer';
import { AudioRecorder } from '../AudioRecorder';
import { speechService } from '../../utils/speechSynthesis';
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Send, Volume2, Sparkles, Mic, HelpCircle, ArrowRight, UserCheck } from 'lucide-react';

interface ExercisePlayerProps {
  exercise: Exercise;
  onBack: () => void;
  onOpenFeedback?: (submissionId: string) => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ exercise, onBack, onOpenFeedback }) => {
  const {
    submitAssignment,
    submissions,
    activeStudent,
    voiceGender,
    speechSpeed,
    setUserRole,
    setActiveTab,
    setSelectedSubmissionId
  } = useApp();

  // Answers state: questionId -> AnswerItem
  const [answers, setAnswers] = useState<Record<string, AnswerItem>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVocab, setShowVocab] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSubmissionId, setSubmittedSubmissionId] = useState<string | null>(null);
  const [speakingQuestionId, setSpeakingQuestionId] = useState<string | null>(null);

  // Check if this student has previously submitted this exercise
  const previousSubmission = submissions.find(
    s => s.exerciseId === exercise.id && s.studentId === activeStudent.id
  );

  const handleAudioRecordingComplete = (questionId: string, blobId: string, durationSec: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        type: 'audio_recording',
        audioBlobId: blobId,
        audioDurationSec: durationSec,
        textAnswer: prev[questionId]?.textAnswer || ''
      }
    }));
  };

  const handleAudioRemoved = (questionId: string) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        type: 'audio_recording',
        textAnswer: text
      }
    }));
  };

  // Play single question in Chinese with chosen male/female voice
  const playQuestionAudio = (questionPrompt: string, qId: string) => {
    setSpeakingQuestionId(qId);
    speechService.speak(
      questionPrompt,
      exercise.language || 'zh',
      speechSpeed,
      voiceGender,
      (speaking) => {
        if (!speaking) setSpeakingQuestionId(null);
      }
    );
  };

  const answeredRecordingsCount = Object.values(answers).filter(a => !!a.audioBlobId).length;
  const totalCount = exercise.questions.length;

  const handleSubmit = () => {
    if (answeredRecordingsCount === 0) {
      const confirmProceed = window.confirm(
        'Bạn chưa thu âm câu trả lời nào. Bạn có chắc chắn muốn nộp bài mà không kèm bản thu âm không?'
      );
      if (!confirmProceed) return;
    }

    setIsSubmitting(true);
    const subId = submitAssignment(exercise.id, answers);
    setSubmittedSubmissionId(subId);
    setIsSubmitting(false);
  };

  const handleSwitchToTeacher = () => {
    if (submittedSubmissionId) {
      setSelectedSubmissionId(submittedSubmissionId);
    }
    setUserRole('teacher');
    setActiveTab('grading');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách bài tập</span>
        </button>

        {previousSubmission && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Bài làm trước đó:</span>
            {previousSubmission.status === 'graded' ? (
              <button
                onClick={() => onOpenFeedback && onOpenFeedback(previousSubmission.id)}
                className="font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Đã chấm: {previousSubmission.grade?.totalScore}/10</span>
                <span>(Xem & Nghe nhận xét)</span>
              </button>
            ) : (
              <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                ⏳ Đang chờ giáo viên kiểm tra & chấm điểm
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Header & Audio Station */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs space-y-6 chinese-card">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="chinese-seal text-[10px] text-red-700 font-bold">HSK</span>
            <span className="font-bold text-red-800">{exercise.level}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700">{exercise.topic}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-medium">
              Học sinh: <strong>{activeStudent.name}</strong> ({activeStudent.chineseName})
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{exercise.title}</h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{exercise.description}</p>
        </div>

        {/* Audio Player with Voice Gender & Speed Controls */}
        <div>
          <AudioPlayer
            audioType={exercise.audioSourceType}
            audioUrl={exercise.audioUrl}
            ttsScript={exercise.ttsScript}
            language={exercise.language}
            estimatedDurationSec={exercise.durationSeconds}
            title={exercise.title}
          />
        </div>

        {/* Helper Toolbar: Transcript toggle + Key Vocabulary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVocab(!showVocab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                showVocab
                  ? 'bg-amber-50 text-red-800 border border-amber-300'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-red-700" />
              <span>{showVocab ? 'Ẩn từ vựng trọng điểm' : 'Xem từ vựng trọng điểm'}</span>
            </button>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                showTranscript
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-red-700" />
              <span>{showTranscript ? 'Ẩn phiên âm toàn bài' : 'Xem phiên âm Pinyin'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Có <span className="font-bold text-red-700">{exercise.questions.length}</span> câu hỏi cần thu âm
          </div>
        </div>

        {/* Vocabulary Hints Panel */}
        {showVocab && exercise.vocabularyHints && exercise.vocabularyHints.length > 0 && (
          <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Từ vựng & Cụm từ trọng điểm trong bài</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {exercise.vocabularyHints.map((vh, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-amber-200/60 shadow-2xs">
                  <div className="text-sm font-bold text-red-700 font-chinese">{vh.word}</div>
                  {vh.phonetic && <div className="text-[11px] text-slate-500 font-mono mt-0.5">{vh.phonetic}</div>}
                  <div className="text-xs text-slate-700 mt-1 font-medium">{vh.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Drawer */}
        {showTranscript && (
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Toàn văn câu hỏi & Phiên âm
              </span>
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white/90 p-4 rounded-lg border border-amber-100 max-h-60 overflow-y-auto">
              {exercise.transcript}
            </div>
          </div>
        )}
      </div>

      {/* Submitted Banner if just submitted */}
      {submittedSubmissionId ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-950">Đã nộp bài thu âm thành công!</h2>
            <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed mt-1">
              Bài làm của học sinh <strong>{activeStudent.name} ({activeStudent.chineseName})</strong> đã được gửi tới Giáo viên.
              Giáo viên có thể mở Hộp thư để nghe lại các file thu âm, đánh giá phát âm và gửi nhận xét có kèm giọng nói.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSwitchToTeacher}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>👉 Chuyển sang vai Giáo viên để kiểm tra & chấm bài ngay</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs"
            >
              Về danh sách bài tập
            </button>
          </div>
        </div>
      ) : (
        /* Questions & Audio Recording Area */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-700"></span>
              <span>Lắng nghe câu hỏi & Thu âm câu trả lời</span>
            </h2>
            <span className="text-xs text-slate-500">
              Đã thu âm: <strong className="text-red-700">{answeredRecordingsCount}</strong>/{totalCount} câu
            </span>
          </div>

          {exercise.questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-amber-300 transition-colors"
            >
              {/* Question Header & Prompt */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-50 text-red-800 font-bold text-sm flex items-center justify-center shrink-0 border border-red-200">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    {/* Chinese Character Prompt */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 font-chinese">{q.prompt}</span>
                      {/* Play single question audio TTS button */}
                      <button
                        onClick={() => playQuestionAudio(q.prompt, q.id)}
                        disabled={speakingQuestionId === q.id}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          speakingQuestionId === q.id
                            ? 'bg-red-700 text-white border-red-700 animate-pulse'
                            : 'bg-amber-50 text-red-800 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Nghe phát âm chuẩn của câu hỏi này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{speakingQuestionId === q.id ? 'Đang đọc...' : 'Nghe câu hỏi'}</span>
                      </button>
                    </div>

                    {/* Pinyin */}
                    {q.pinyin && (
                      <p className="text-xs text-red-700 font-mono font-medium">{q.pinyin}</p>
                    )}

                    {/* Vietnamese translation */}
                    {q.translationVi && (
                      <p className="text-xs text-slate-500">
                        Dịch nghĩa: <span className="text-slate-700 font-medium">{q.translationVi}</span>
                      </p>
                    )}

                    {/* Guide answer */}
                    {q.guidePrompt && (
                      <div className="mt-2 px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900">
                        <span className="font-semibold">💡 Gợi ý trả lời:</span> {q.guidePrompt}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio Voice Recording Station for this Question */}
              <div className="pt-2 border-t border-slate-100">
                <AudioRecorder
                  questionId={q.id}
                  targetDurationSec={q.targetDurationSec || 25}
                  onRecordingComplete={(blobId, duration) =>
                    handleAudioRecordingComplete(q.id, blobId, duration)
                  }
                  onRecordingRemoved={() => handleAudioRemoved(q.id)}
                />

                {/* Optional written answer */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={answers[q.id]?.textAnswer || ''}
                    onChange={e => handleTextAnswerChange(q.id, e.target.value)}
                    placeholder="Gõ thêm câu trả lời chữ Hán hoặc Pinyin (tùy chọn)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Submit Action Card */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                Đã thu âm câu trả lời cho {answeredRecordingsCount} trên {totalCount} câu hỏi
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Giáo viên sẽ nhận được thông báo ngay khi bạn nộp và sẽ kiểm tra, thu âm nhận xét phát âm từng câu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài & Gửi bản thu âm cho cô</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
