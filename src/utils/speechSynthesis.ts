/**
 * Web Speech API Controller for Listening Exercises & Pronunciation Practice
 * Specially calibrated for maximum clarity, natural cadence, and listening comfort:
 * - Single unified voice: Natural, broadcast-quality Chinese pronunciation (自然流利 · 发音标准)
 * - Calibrated pitch (1.02) and comfortable pacing (0.88x) to hear clear tone contours
 * - Intelligent text pre-processing with natural clause breathing pauses
 * - Priority search for high-fidelity neural & native voices (Xiaoxiao Natural, Ting-Ting, Google 普通话)
 */

export type VoiceGender = 'standard' | 'female' | 'male';

export interface VoiceMeta {
  title: string;
  badge: string;
  subtitle: string;
  chineseLabel: string;
}

class SpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private onStateChangeCallback: ((speaking: boolean, paused: boolean, progress: number) => void) | null = null;
  private progressInterval: number | null = null;
  private keepAliveInterval: number | null = null;
  private estimatedDuration = 10;
  private startTime = 0;
  private pausedTime = 0;
  private voicesCache: SpeechSynthesisVoice[] = [];

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        this.refreshVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            this.refreshVoices();
          } catch (_) {
            // ignore
          }
        };
      }
    } catch (err) {
      console.warn('SpeechSynthesis initialization bypassed:', err);
    }
  }

  public refreshVoices(): SpeechSynthesisVoice[] {
    try {
      if (!this.isSupported()) return [];
      this.voicesCache = window.speechSynthesis.getVoices() || [];
      return this.voicesCache;
    } catch (_) {
      return [];
    }
  }

  public isSupported(): boolean {
    try {
      return typeof window !== 'undefined' && 'speechSynthesis' in window && Boolean(window.speechSynthesis);
    } catch (_) {
      return false;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voicesCache.length > 0) return this.voicesCache;
    return this.refreshVoices();
  }

  /**
   * Intelligently selects the single highest-fidelity, most natural voice available
   */
  public findVoice(lang: 'zh' | 'en' | 'vi' = 'zh', _gender?: VoiceGender): SpeechSynthesisVoice | undefined {
    if (!this.isSupported()) return undefined;
    const voices = this.getVoices();
    if (voices.length === 0) return undefined;

    const langPrefix = lang === 'zh' ? 'zh' : lang === 'vi' ? 'vi' : 'en';
    const langVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));

    if (langVoices.length === 0) {
      return voices[0];
    }

    if (lang === 'zh') {
      // Prioritize natural, smooth, studio-quality neural voices
      const qualityPriority = [
        'natural',
        'xiaoxiao',
        'ting-ting',
        'tingting',
        'xiaoyi',
        'yunxi',
        'google 普通话',
        'google',
        'huihui',
        'yaoyao',
        'cmn-hans',
        'zh-cn',
        'zh'
      ];

      for (const kw of qualityPriority) {
        const match = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else if (lang === 'vi') {
      const viPriority = ['natural', 'mai', 'lan', 'linh', 'nam', 'bình', 'vi-vn', 'vietnam'];
      for (const kw of viPriority) {
        const match = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else {
      const enPriority = ['natural', 'samantha', 'victoria', 'zira', 'david', 'google', 'en-us'];
      for (const kw of enPriority) {
        const match = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }

    return langVoices[0];
  }

  /**
   * Cleans and prepares text with natural micro-pauses for human-like classroom cadence
   */
  private formatTextForCadence(text: string, lang: 'zh' | 'en' | 'vi' = 'zh'): string {
    if (lang !== 'zh') return text;

    return text
      // Replace item separators like 一、 or 1. with smooth comma pauses
      .replace(/([一二三四五六七八九十\d]+)[、.]\s*/g, '$1，')
      // Ensure small breathing pauses after sentence endings
      .replace(/([。！？；])/g, '$1 ')
      .trim();
  }

  public getVoiceDescription(_gender?: VoiceGender, lang: 'zh' | 'en' | 'vi' = 'zh'): VoiceMeta {
    if (lang === 'zh') {
      return {
        title: 'Giọng đọc chuẩn Tiếng Trung',
        badge: '标准普通话',
        subtitle: 'Phát âm rõ từng thanh điệu, ngữ điệu tự nhiên, tốc độ êm ái dễ nghe',
        chineseLabel: '纯正自然 · 清晰悦耳'
      };
    }

    return {
      title: 'Giọng đọc chuẩn',
      badge: 'Chuẩn phát âm',
      subtitle: 'Tự nhiên, dễ nghe và rõ ràng',
      chineseLabel: 'Standard Voice'
    };
  }

  /**
   * Main speech playback with acoustic pitch & speed calibration
   */
  public speak(
    text: string,
    lang: 'zh' | 'en' | 'vi' = 'zh',
    rate: number = 0.88,
    _gender?: VoiceGender,
    onStateChange?: (speaking: boolean, paused: boolean, progress: number) => void
  ) {
    if (!this.isSupported() || !text.trim()) return;

    this.stop();
    this.onStateChangeCallback = onStateChange || null;

    const formattedText = this.formatTextForCadence(text, lang);

    // Duration estimation for smooth progress timeline
    const charCount = formattedText.length;
    const baseDuration = lang === 'zh'
      ? Math.max(2, (charCount / 2.8) / rate)
      : Math.max(3, (formattedText.split(/\s+/).length / (2.2 * rate)));
    this.estimatedDuration = baseDuration;

    const utterance = new SpeechSynthesisUtterance(formattedText);
    utterance.lang = lang === 'zh' ? 'zh-CN' : lang === 'vi' ? 'vi-VN' : 'en-US';

    // Acoustic pitch calibration: 1.02 produces a warm, neutral, non-fatiguing voice
    utterance.pitch = 1.02;
    // Comfortable reading speed: 0.88x allows clear tonal discernment for Chinese learners
    utterance.rate = Math.max(0.5, Math.min(1.8, rate));

    const voice = this.findVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.startTime = Date.now();
      this.startProgressTracker();
      this.startKeepAlive();
      this.notifyState();
    };

    utterance.onend = () => {
      this.cleanup();
      this.notifyState();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis notice:', e.error);
      }
      this.cleanup();
      this.notifyState();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Speak a short single sentence (e.g. preview, question prompt)
   */
  public speakSingleSentence(
    text: string,
    lang: 'zh' | 'en' | 'vi' = 'zh',
    rate: number = 0.88,
    _gender?: VoiceGender,
    onEnd?: () => void
  ) {
    if (!this.isSupported() || !text.trim()) return;
    this.stop();

    const formattedText = this.formatTextForCadence(text, lang);
    const utterance = new SpeechSynthesisUtterance(formattedText);
    utterance.lang = lang === 'zh' ? 'zh-CN' : lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.pitch = 1.02;
    utterance.rate = Math.max(0.5, Math.min(1.8, rate));

    const voice = this.findVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Quick preview sample sentence for immediate voice audition
   */
  public previewVoice(_gender?: VoiceGender, lang: 'zh' | 'en' | 'vi' = 'zh', onEnd?: () => void) {
    let sampleText = '';
    if (lang === 'zh') {
      sampleText = '你好！欢迎来到中文听说学堂。这里的发音清晰自然、语速适中，祝你中文越学越好！';
    } else if (lang === 'vi') {
      sampleText = 'Xin chào các bạn. Đây là giọng đọc bài nghe chuẩn, phát âm rõ ràng và dễ nghe.';
    } else {
      sampleText = 'Hello! This is the standard reading voice, calibrated for natural pronunciation and easy listening.';
    }

    this.speakSingleSentence(sampleText, lang, 0.88, 'standard', onEnd);
  }

  public pause() {
    if (this.isSpeakingState && !this.isPausedState && this.isSupported()) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
      this.pausedTime = Date.now();
      this.stopProgressTracker();
      this.notifyState();
    }
  }

  public resume() {
    if (this.isSpeakingState && this.isPausedState && this.isSupported()) {
      window.speechSynthesis.resume();
      this.isPausedState = false;
      this.startTime += (Date.now() - this.pausedTime);
      this.startProgressTracker();
      this.notifyState();
    }
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.cleanup();
    this.notifyState();
  }

  private startProgressTracker() {
    this.stopProgressTracker();
    this.progressInterval = window.setInterval(() => {
      if (!this.isSpeakingState || this.isPausedState) return;
      const elapsed = (Date.now() - this.startTime) / 1000;
      const progress = Math.min(1.0, elapsed / Math.max(1, this.estimatedDuration));
      this.notifyState(progress);
    }, 200);
  }

  private stopProgressTracker() {
    if (this.progressInterval !== null) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = window.setInterval(() => {
      if (this.isSpeakingState && !this.isPausedState && this.isSupported()) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private cleanup() {
    this.stopProgressTracker();
    this.stopKeepAlive();
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.currentUtterance = null;
  }

  private notifyState(progress: number = 0) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isSpeakingState, this.isPausedState, progress);
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }
}

export const speechService = new SpeechService();
