import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Gauge, Volume1 } from 'lucide-react';
import { speechService } from '../utils/speechSynthesis';
import { useApp } from '../context/AppContext';

interface AudioPlayerProps {
  audioType: 'tts' | 'audio_url' | 'uploaded';
  audioUrl?: string;
  ttsScript?: string;
  language?: 'vi' | 'en' | 'zh';
  estimatedDurationSec?: number;
  title?: string;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioType,
  audioUrl,
  ttsScript,
  language = 'zh',
  estimatedDurationSec = 40,
  title,
  onEnded
}) => {
  const { speechSpeed, setSpeechSpeed } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(estimatedDurationSec);
  const [isMuted, setIsMuted] = useState(false);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If using native audio URL
  useEffect(() => {
    if (audioType !== 'tts' && audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (onEnded) onEnded();
      };

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [audioType, audioUrl, onEnded]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handlePlayPause = () => {
    if (audioType === 'tts') {
      if (isPlaying) {
        if (speechService.isPaused()) {
          speechService.resume();
          setIsPlaying(true);
        } else {
          speechService.pause();
          setIsPlaying(false);
        }
      } else {
        if (!ttsScript) return;
        setIsPlaying(true);
        setIsPreviewingVoice(false);
        speechService.speak(
          ttsScript,
          language,
          speechSpeed,
          'standard',
          (speaking, paused, progress) => {
            setIsPlaying(speaking && !paused);
            setCurrentTime(progress * estimatedDurationSec);
            setDuration(estimatedDurationSec);
            if (!speaking && !paused && progress >= 0.98) {
              if (onEnded) onEnded();
            }
          }
        );
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speechSpeed;
        audioRef.current.play().catch(e => console.warn('Audio play error:', e));
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (newProgress: number) => {
    const targetTime = newProgress * duration;
    setCurrentTime(targetTime);
    if (audioType !== 'tts' && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    if (audioType !== 'tts' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 0.88, 1.0, 1.2];
    const currentIndex = rates.indexOf(speechSpeed);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setSpeechSpeed(nextRate);

    if (audioType !== 'tts' && audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    } else if (isPlaying && ttsScript) {
      speechService.speak(
        ttsScript,
        language,
        nextRate,
        'standard',
        (speaking, paused, progress) => {
          setIsPlaying(speaking && !paused);
          setCurrentTime(progress * estimatedDurationSec);
        }
      );
    }
  };

  const handlePreviewVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    }
    setIsPreviewingVoice(true);
    speechService.previewVoice('standard', language, () => {
      setIsPreviewingVoice(false);
    });
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
      {/* Header bar: Title & Single Clear Voice Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 text-amber-300 rounded-md border border-amber-600/40 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{language === 'zh' ? 'Giọng đọc chuẩn Tiếng Trung (华语)' : 'Giọng đọc bài tập'}</span>
          </div>
          {title && <span className="text-xs font-medium text-slate-300 truncate max-w-xs">{title}</span>}
        </div>

        {/* Audition Button for Single Natural Voice */}
        {audioType === 'tts' && (
          <button
            type="button"
            onClick={handlePreviewVoice}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPreviewingVoice
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border-slate-700 hover:text-white'
            }`}
            title="Bấm để nghe thử giọng đọc mẫu phát âm tiếng Trung"
          >
            <Volume1 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPreviewingVoice ? 'Đang đọc thử...' : '🔊 Nghe thử giọng đọc'}</span>
          </button>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="space-y-1.5 mb-4">
        <div
          className="relative h-2.5 bg-slate-800 rounded-full cursor-pointer overflow-hidden group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            handleSeek(ratio);
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-100 group-hover:brightness-110 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-400 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[11px] text-slate-400 font-sans">
            {isPlaying ? 'Đang phát bài nghe (Phát âm rõ ràng)' : 'Sẵn sàng phát'}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Skip 5s Back */}
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Tua lại 5 giây"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="w-12 h-12 flex items-center justify-center text-white rounded-full shadow-lg transition-all transform active:scale-95 bg-red-700 hover:bg-red-600"
            title={isPlaying ? 'Tạm dừng' : 'Bắt đầu nghe'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Skip 5s Forward */}
          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Tua tới 5 giây"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2">
          {/* Playback Speed Controller with clear labels */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors tabular-nums"
            title={`Tốc độ đọc hiện tại: ${speechSpeed}x (Bấm để đổi: 0.75x, 0.88x, 1.0x, 1.2x)`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{speechSpeed}x</span>
            {speechSpeed === 0.88 && <span className="text-[10px] text-emerald-400 hidden sm:inline">(Dễ nghe)</span>}
          </button>

          {/* Mute button */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
