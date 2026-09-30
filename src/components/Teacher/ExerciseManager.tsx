import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exercise, Question, QuestionType, ExerciseLevel, ExerciseTopic, VocabularyHint } from '../../types';
import { Plus, Trash2, Edit3, Copy, Mic, FileText, CheckCircle2, Volume2, Sparkles, X } from 'lucide-react';
import { speechService } from '../../utils/speechSynthesis';

export const ExerciseManager: React.FC = () => {
  const { exercises, addExercise, updateExercise, deleteExercise, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<ExerciseLevel>('Trung cấp (B1-B2)');
  const [topic, setTopic] = useState<ExerciseTopic>('Tiếng Trung giao tiếp');
  const [language, setLanguage] = useState<'vi' | 'en' | 'zh'>('zh');
  const [audioSourceType, setAudioSourceType] = useState<'tts' | 'audio_url' | 'uploaded'>('tts');
  const [ttsScript, setTtsScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(45);
  const [transcript, setTranscript] = useState('');
  const [createdBy, setCreatedBy] = useState('Giáo viên chuyên môn');

  // Key vocabularies
  const [vocabHints, setVocabHints] = useState<VocabularyHint[]>([
    { word: 'Conversation', phonetic: '/ˌkɒn.vəˈseɪ.ʃən/', meaning: 'Cuộc đàm thoại' }
  ]);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-mc-1',
      type: 'multiple_choice',
      prompt: 'Ý chính của đoạn hội thoại trên là gì?',
      options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
      correctAnswer: 0,
      explanation: 'Giải thích đáp án cho học sinh...'
    },
    {
      id: 'q-sp-2',
      type: 'audio_recording',
      prompt: '🎤 [CÂU HỎI THU ÂM] Hãy ghi âm câu trả lời tóm tắt lại nội dung bạn vừa nghe trong 30-45 giây.',
      guidePrompt: 'Gợi ý: Nói rõ ràng các thông tin chính như ai, ở đâu, khi nào và kết quả.',
      targetDurationSec: 40
    }
  ]);

  // TTS test play state
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLevel('Trung cấp (B1-B2)');
    setTopic('Giao tiếp hàng ngày');
    setLanguage('en');
    setAudioSourceType('tts');
    setTtsScript('');
    setAudioUrl('');
    setDurationSeconds(45);
    setTranscript('');
    setVocabHints([]);
    setQuestions([
      {
        id: `q-mc-${Date.now()}`,
        type: 'multiple_choice',
        prompt: 'Ý chính của đoạn hội thoại trên là gì?',
        options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        correctAnswer: 0
      },
      {
        id: `q-sp-${Date.now() + 1}`,
        type: 'audio_recording',
        prompt: '🎤 [CÂU HỎI THU ÂM] Hãy ghi âm tóm tắt bài nghe theo lời của bạn.',
        guidePrompt: 'Tập trung vào phát âm và nối âm tự nhiên.',
        targetDurationSec: 40
      }
    ]);
    setEditingExerciseId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ex: Exercise) => {
    setEditingExerciseId(ex.id);
    setTitle(ex.title);
    setDescription(ex.description);
    setLevel(ex.level);
    setTopic(ex.topic);
    setLanguage(ex.language);
    setAudioSourceType(ex.audioSourceType);
    setTtsScript(ex.ttsScript || '');
    setAudioUrl(ex.audioUrl || '');
    setDurationSeconds(ex.durationSeconds);
    setTranscript(ex.transcript);
    setCreatedBy(ex.createdBy);
    setVocabHints(ex.vocabularyHints || []);
    setQuestions(ex.questions || []);
    setIsModalOpen(true);
  };

  const handleTestSpeech = () => {
    const textToSpeak = ttsScript || transcript;
    if (!textToSpeak) {
      alert('Vui lòng nhập văn bản kịch bản bài nghe để nghe thử.');
      return;
    }

    if (isTestingSpeech) {
      speechService.stop();
      setIsTestingSpeech(false);
    } else {
      speechService.stop();
      setIsTestingSpeech(true);
      speechService.speak(textToSpeak, language, 0.88, 'standard', (speaking) => {
        setIsTestingSpeech(speaking);
      });
    }
  };

  const handleAddVocab = () => {
    setVocabHints(prev => [...prev, { word: '', phonetic: '', meaning: '' }]);
  };

  const handleUpdateVocab = (idx: number, field: keyof VocabularyHint, val: string) => {
    setVocabHints(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveVocab = (idx: number) => {
    setVocabHints(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type,
      prompt:
        type === 'multiple_choice'
          ? 'Nội dung câu hỏi trắc nghiệm mới...'
          : type === 'audio_recording'
          ? '🎤 [CÂU HỎI THU ÂM] Hãy thu âm câu trả lời giải thích...'
          : 'Câu hỏi điền câu trả lời ngắn...',
      options: type === 'multiple_choice' ? ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'] : undefined,
      correctAnswer: type === 'multiple_choice' ? 0 : undefined,
      targetDurationSec: type === 'audio_recording' ? 45 : undefined
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const handleUpdateQuestion = (qId: string, updated: Partial<Question>) => {
    setQuestions(prev => prev.map(q => (q.id === qId ? { ...q, ...updated } : q)));
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài nghe.');
      return;
    }

    const payload = {
      title,
      description,
      level,
      topic,
      language,
      audioSourceType,
      audioUrl: audioSourceType === 'audio_url' ? audioUrl : undefined,
      ttsScript: audioSourceType === 'tts' ? (ttsScript || transcript) : undefined,
      durationSeconds: Number(durationSeconds) || 45,
      transcript: transcript || ttsScript,
      vocabularyHints: vocabHints.filter(v => v.word.trim()),
      questions,
      createdBy
    };

    if (editingExerciseId) {
      updateExercise(editingExerciseId, payload);
    } else {
      addExercise(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDuplicate = (ex: Exercise) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...rest } = ex;
    addExercise({
      ...rest,
      title: `${ex.title} (Bản sao)`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Quản trị nội dung học tập
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Quản lý & Cập nhật bài tập nghe đa dạng
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Tạo bài tập nghe mới bằng giọng đọc AI sinh động hoặc tải tệp âm thanh lên, bổ sung câu hỏi thu âm giọng nói và từ vựng trọng tâm.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài tập nghe mới</span>
        </button>
      </div>

      {/* Exercises Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(ex => (
          <div
            key={ex.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-indigo-700">{ex.level}</span>
                <span className="font-mono text-[11px] text-slate-400">{ex.durationSeconds}s</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{ex.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{ex.description}</p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pb-3 border-b border-slate-100 mb-3">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                  {ex.topic}
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
                  {ex.questions.length} câu hỏi ({ex.questions.filter(q => q.type === 'audio_recording').length} thu âm)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Tạo: {ex.createdAt}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(ex)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Nhân bản bài tập"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEditModal(ex)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Chỉnh sửa nội dung"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xóa bài nghe "${ex.title}" không?`)) {
                      deleteExercise(ex.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Xóa bài tập"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Exercise */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-900">
                {editingExerciseId ? 'Chỉnh sửa bài tập nghe' : 'Tạo bài tập nghe mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  1. Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tiêu đề bài nghe *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ví dụ: Cuộc đàm thoại đặt bàn nhà hàng..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Cấp độ</label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value as ExerciseLevel)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    >
                      <option value="Sơ cấp (A1-A2)">Sơ cấp (A1-A2)</option>
                      <option value="Trung cấp (B1-B2)">Trung cấp (B1-B2)</option>
                      <option value="Nâng cao (C1-IELTS)">Nâng cao (C1-IELTS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Chủ đề</label>
                    <select
                      value={topic}
                      onChange={e => setTopic(e.target.value as ExerciseTopic)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    >
                      <option value="Tiếng Trung giao tiếp">Tiếng Trung giao tiếp</option>
                      <option value="Giao tiếp hàng ngày">Giao tiếp hàng ngày</option>
                      <option value="Học thuật & Trường học">Học thuật & Trường học</option>
                      <option value="Công nghệ & Đổi mới">Công nghệ & Đổi mới</option>
                      <option value="Văn hóa & Đời sống">Văn hóa & Đời sống</option>
                      <option value="Công sở & Phỏng vấn">Công sở & Phỏng vấn</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Ngôn ngữ</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value as 'vi' | 'en' | 'zh')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    >
                      <option value="zh">Tiếng Trung (中文 / Mandarin)</option>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">Tiếng Anh (English)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Thời lượng ước tính (giây)
                    </label>
                    <input
                      type="number"
                      value={durationSeconds}
                      onChange={e => setDurationSeconds(parseInt(e.target.value) || 45)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mô tả bài tập
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Mô tả bối cảnh bài nghe cho học sinh..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Audio Source & Script */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    2. Nguồn âm thanh & Lời thoại (Script)
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestSpeech}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      isTestingSpeech
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                    }`}
                    title="Nghe thử giọng đọc chuẩn của đoạn kịch bản này"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isTestingSpeech ? 'Dừng đọc thử' : '🔊 Nghe thử giọng đọc'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="audioSourceType"
                      checked={audioSourceType === 'tts'}
                      onChange={() => setAudioSourceType('tts')}
                      className="accent-indigo-600"
                    />
                    <span>Giọng đọc tự động (Text-to-Speech)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="audioSourceType"
                      checked={audioSourceType === 'audio_url'}
                      onChange={() => setAudioSourceType('audio_url')}
                      className="accent-indigo-600"
                    />
                    <span>Liên kết tệp âm thanh (URL)</span>
                  </label>
                </div>

                {audioSourceType === 'audio_url' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      URL file âm thanh (.mp3, .wav, .m4a)
                    </label>
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={e => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kịch bản bài nghe / Toàn văn lời thoại (Transcript) *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={transcript}
                    onChange={e => {
                      setTranscript(e.target.value);
                      if (audioSourceType === 'tts') setTtsScript(e.target.value);
                    }}
                    placeholder="Nhập toàn văn bài nghe..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Key Vocabulary Hints */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    3. Từ vựng & Cụm từ quan trọng
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVocab}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + Thêm từ vựng
                  </button>
                </div>

                {vocabHints.map((vh, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Từ / Cụm từ"
                      value={vh.word}
                      onChange={e => handleUpdateVocab(i, 'word', e.target.value)}
                      className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phiên âm (nếu có)"
                      value={vh.phonetic || ''}
                      onChange={e => handleUpdateVocab(i, 'phonetic', e.target.value)}
                      className="w-1/4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Ý nghĩa tiếng Việt"
                      value={vh.meaning}
                      onChange={e => handleUpdateVocab(i, 'meaning', e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVocab(i)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    4. Danh sách câu hỏi ({questions.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                    >
                      + Trắc nghiệm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('audio_recording')}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md flex items-center gap-1"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>+ Câu thu âm</span>
                    </button>
                  </div>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Câu {qIdx + 1}:{' '}
                        {q.type === 'multiple_choice'
                          ? 'Trắc nghiệm'
                          : q.type === 'audio_recording'
                          ? 'Thu âm giọng nói'
                          : 'Điền câu trả lời ngắn'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Xóa câu
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Nội dung câu hỏi *
                      </label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={e => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {q.type === 'audio_recording' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Gợi ý cho học sinh khi nói
                          </label>
                          <input
                            type="text"
                            value={q.guidePrompt || ''}
                            onChange={e => handleUpdateQuestion(q.id, { guidePrompt: e.target.value })}
                            placeholder="Gợi ý cấu trúc câu..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Thời lượng thu âm gợi ý (giây)
                          </label>
                          <input
                            type="number"
                            value={q.targetDurationSec || 40}
                            onChange={e =>
                              handleUpdateQuestion(q.id, {
                                targetDurationSec: parseInt(e.target.value) || 40
                              })
                            }
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {q.type === 'multiple_choice' && q.options && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          Các phương án lựa chọn (Chọn tròn là đáp án đúng):
                        </label>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => handleUpdateQuestion(q.id, { correctAnswer: optIdx })}
                              className="accent-indigo-600"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOpts = [...(q.options || [])];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuestion(q.id, { options: newOpts });
                              }}
                              className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  {editingExerciseId ? 'Lưu thay đổi' : 'Tạo bài tập nghe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
