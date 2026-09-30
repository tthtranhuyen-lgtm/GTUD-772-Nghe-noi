import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { saveAudioRecording, getAudioObjectUrl, createSampleAudioBlob } from '../utils/audioStorage';

interface AudioRecorderProps {
  questionId: string;
  targetDurationSec?: number;
  initialBlobId?: string;
  onRecordingComplete: (blobId: string, durationSec: number) => void;
  onRecordingRemoved?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  questionId,
  targetDurationSec = 45,
  initialBlobId,
  onRecordingComplete,
  onRecordingRemoved
}) => {
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentBlobId, setCurrentBlobId] = useState<string | null>(initialBlobId || null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load existing audio if available
  useEffect(() => {
    let active = true;
    if (initialBlobId) {
      getAudioObjectUrl(initialBlobId).then(url => {
        if (active && url) {
          setAudioUrl(url);
          setRecordState('recorded');
        }
      });
    }
    return () => {
      active = false;
    };
  }, [initialBlobId]);

  // Clean up timer and streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
    };
  }, []);

  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Canvas visualizer error:', e);
    }
  };

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      startVisualizer(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobId = `rec_${questionId}_${Date.now()}`;
        await saveAudioRecording(blobId, audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setCurrentBlobId(blobId);
        setRecordState('recorded');

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();

        onRecordingComplete(blobId, recordingTime || 1);
      };

      mediaRecorder.start(200);
      setRecordState('recording');
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= targetDurationSec) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone access issue:', err);
      setMicError('Không thể truy cập microphone (có thể do quyền trình duyệt hoặc đang chạy trong sandbox). Bạn có thể bấm nút "Ghi âm giả lập" bên dưới để tiếp tục trải nghiệm đầy đủ.');
      setRecordState('idle');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUseMockSample = async () => {
    const mockBlob = createSampleAudioBlob('Student voice response simulation');
    const blobId = `rec_mock_${questionId}_${Date.now()}`;
    await saveAudioRecording(blobId, mockBlob);
    const url = URL.createObjectURL(mockBlob);
    setAudioUrl(url);
    setCurrentBlobId(blobId);
    setRecordState('recorded');
    setRecordingTime(25);
    onRecordingComplete(blobId, 25);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlaybackRef.current) {
      const audio = new Audio(audioUrl);
      audioPlaybackRef.current = audio;
      audio.onended = () => setRecordState('recorded');
    }

    if (recordState === 'playing') {
      audioPlaybackRef.current.pause();
      setRecordState('recorded');
    } else {
      audioPlaybackRef.current.play().catch(e => console.warn(e));
      setRecordState('playing');
    }
  };

  const handleDelete = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }
    setAudioUrl(null);
    setCurrentBlobId(null);
    setRecordState('idle');
    setRecordingTime(0);
    if (onRecordingRemoved) onRecordingRemoved();
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      {micError && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-2">
            <p>{micError}</p>
            <button
              onClick={handleUseMockSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-xs shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dùng mẫu thu âm giả lập</span>
            </button>
          </div>
        </div>
      )}

      {recordState === 'idle' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-slate-800">Thu âm câu trả lời của bạn</p>
            <p className="text-xs text-slate-500">
              Thời lượng gợi ý: <span className="font-semibold text-slate-700">{targetDurationSec} giây</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow transition-all transform active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Bắt đầu ghi âm</span>
            </button>
            <button
              onClick={handleUseMockSample}
              title="Dùng mẫu thu âm giả lập nhanh không cần mic"
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Thu âm nhanh
            </button>
          </div>
        </div>
      )}

      {recordState === 'recording' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Đang thu âm... Hãy nói to và rõ ràng</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
              {formatSecs(recordingTime)} / {formatSecs(targetDurationSec)}
            </span>
          </div>

          {/* Sound wave visualizer canvas */}
          <div className="h-10 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-1">
            <canvas ref={canvasRef} width={300} height={36} className="w-full h-full" />
          </div>

          <div className="flex justify-end">
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hoàn tất ghi âm</span>
            </button>
          </div>
        </div>
      )}

      {(recordState === 'recorded' || recordState === 'playing') && (
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
              title={recordState === 'playing' ? 'Tạm dừng' : 'Nghe lại'}
            >
              {recordState === 'playing' ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bản thu âm đã sẵn sàng</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {recordingTime ? `${recordingTime}s` : 'Đã lưu'} · Sẵn sàng gửi giáo viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
              title="Ghi âm lại từ đầu"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ghi âm lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
