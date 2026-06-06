import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  History, 
  AlertCircle, 
  Sparkles,
  BookmarkCheck,
  RotateCcw,
  Volume2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { PracticeSession } from '../types';

interface AudioPracticeProps {
  onAddPracticeSession: (session: PracticeSession) => void;
  history: PracticeSession[];
  onDeleteSession: (id: string) => void;
  fontSizeClass: string;
}

export const AudioPractice: React.FC<AudioPracticeProps> = ({
  onAddPracticeSession,
  history,
  onDeleteSession,
  fontSizeClass
}) => {
  // Tabs: 'record' or 'timer'
  const [activeSubTab, setActiveSubTab] = useState<'record' | 'timer'>('record');

  // Voice Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [lastRecordedUrl, setLastRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  // Custom timer or simulation states
  const [isSimulating, setIsSimulating] = useState(false);

  // Timed Speech States
  const [timerPreset, setTimerPreset] = useState<number>(120); // default 2 mins in seconds
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('د ريښتینولۍ اغېزې په ټولنه کې');

  // Input for saving practice
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceNotes, setPracticeNotes] = useState('');

  // Refs
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Topics in Pashto for impromptu speeches
  const IMPROMPTU_TOPICS = [
    'د ريښتینولۍ اغېزې په ټولنه کې',
    'ولې پوهه او عمل په ګډه بریا راوړي؟',
    'زما تر ټولو لوی هدف او سټراټيژي',
    'باډي لنګویج څنګه زموږ خبرې پیاوړې کوي؟',
    'د وخت اهمیت او پر وخت د کار ترڅنګ موازنه',
    'له خطاګانو زده کړه او د تجربې تر لاسه کول',
    'صمیمي چلند او د خلکو زړونه ګټل',
    'رڼه او پاکه پښتو څنګه پرمختګ کولی شي؟'
  ];

  const rollNewTopic = () => {
    const currentIndex = IMPROMPTU_TOPICS.indexOf(selectedTopic);
    let nextIndex = Math.floor(Math.random() * IMPROMPTU_TOPICS.length);
    if (nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % IMPROMPTU_TOPICS.length;
    }
    setSelectedTopic(IMPROMPTU_TOPICS[nextIndex]);
  };

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Update voice visualizer volume
  const startVolumeAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map average volume to a scale of 0 to 10
        setVoiceVolume(Math.min(10, Math.floor(average / 8)));
        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (e) {
      console.warn("Could not start visual audio analysis", e);
    }
  };

  // Real Recording Functionality
  const startRecording = async () => {
    setMicPermissionError(null);
    setAudioChunks([]);
    setLastRecordedUrl(null);
    setRecordedBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream); // Fallback if format is not fully backed up
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setLastRecordedUrl(url);
        // stop micro tracks
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setVoiceVolume(0);
      };

      setMediaRecorder(recorder);
      recorder.start(250); // get chunks every 250ms

      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);
      setIsSimulating(false);

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);

      startVolumeAnalysis(stream);

    } catch (err: any) {
      console.warn("Microphone access failed", err);
      // Fallback: Trigger a dynamic speaking simulation if mic fails or inside iframe blocks
      setMicPermissionError(
        "مایکو ته لاسرسی نشته. مګر اندېښنه مه کوئ، تاسو کولی شئ په دې سکرین کې د 'سیمولیشن (Simulation)' په بڼه تمرین وکړئ او خپل سوانح وکاروئ یا بله تبه خلاصه کړئ."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setVoiceVolume(0);
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  // Simulation Fallback Recording
  const startSimulation = () => {
    setMicPermissionError(null);
    setLastRecordedUrl(null);
    setRecordedBlob(null);
    setIsSimulating(true);
    setIsRecording(true);
    setIsPaused(false);
    setRecordSeconds(0);

    // Simulate voice volume
    recordIntervalRef.current = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
      // random volume level
      setVoiceVolume(Math.floor(Math.random() * 8) + 1);
    }, 1000);
  };

  const stopSimulation = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setVoiceVolume(0);
    // save a simulated record (fake)
    setLastRecordedUrl('simulated-audio-payload');
  };

  // Format second counts
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Timed Speech Code
  const selectPreset = (seconds: number) => {
    setTimerPreset(seconds);
    setTimerSecondsLeft(seconds);
    setTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const startTimer = () => {
    if (timerSecondsLeft <= 0) return;
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimerRunning(false);
          // Play a small beep
          try {
            const beepCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = beepCtx.createOscillator();
            osc.connect(beepCtx.destination);
            osc.frequency.setValueAtTime(880, beepCtx.currentTime); // A5 note
            osc.start();
            osc.stop(beepCtx.currentTime + 0.3);
          } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerSecondsLeft(timerPreset);
  };

  // Save speech records
  const handleSavePractice = (e: React.FormEvent) => {
    e.preventDefault();
    const titleToSave = practiceTitle.trim() || `د تمرین غږ ${new Date().toLocaleDateString('ps-AF')}`;
    const durationToSave = recordSeconds > 0 ? recordSeconds : (timerPreset - timerSecondsLeft);

    const newSession: PracticeSession = {
      id: `practice-${Date.now()}`,
      title: titleToSave,
      duration: durationToSave,
      date: new Date().toLocaleDateString('ps-AF', { year: 'numeric', month: 'long', day: 'numeric' }),
      audioBlobUrl: lastRecordedUrl || undefined,
      hasAudio: !!lastRecordedUrl && lastRecordedUrl !== 'simulated-audio-payload',
      notes: practiceNotes.trim() || undefined
    };

    onAddPracticeSession(newSession);

    // Reset fields
    setPracticeTitle('');
    setPracticeNotes('');
    setLastRecordedUrl(null);
    setRecordedBlob(null);
    setRecordSeconds(0);
    setIsSimulating(false);
  };

  // Speech tempo advise based on remaining seconds
  const getPacingFeedback = () => {
    if (!timerRunning) return { text: "ټایمر چالان کړئ او خبرې پیل کړئ", color: "text-stone-400" };
    const progressPercent = ((timerPreset - timerSecondsLeft) / timerPreset) * 100;

    if (progressPercent < 20) {
      return { text: "ارامه پیل: مقدمه د زړه راښکونکي ټکي سره وړاندې کړئ", color: "text-indigo-600 dark:text-indigo-400 font-medium" };
    } else if (progressPercent < 60) {
      return { text: "روان تال: د خپلې وینا ۲۰ اصول په منځ کې واچوئ ", color: "text-emerald-600 dark:text-emerald-400 font-medium" };
    } else if (progressPercent < 85) {
      return { text: "د لوړوالي ټکی: اوس خپل غږ د مهمو پوښتنو سره خورا صفا کړئ", color: "text-amber-600 dark:text-amber-400 font-medium" };
    } else {
      return { text: "پایلیک: وینا په یوه غوره جمله او غښتلې پایلې وتړئ", color: "text-rose-600 dark:text-rose-400 font-semibold animate-pulse" };
    }
  };

  const pacing = getPacingFeedback();

  return (
    <div className="space-y-6 text-right">
      
      {/* Intro Header */}
      <div className="p-5 bg-gradient-to-l from-rose-500/10 to-transparent dark:from-rose-950/20 rounded-2xl border border-rose-500/10 dark:border-rose-900/10">
        <h2 className="text-xl font-bold font-sans text-stone-900 dark:text-white sepia:text-amber-950 flex items-center justify-end gap-2">
          <span>د خبرو او ويناوالۍ د تمرین کولو فضا</span>
          <Mic className="w-5 h-5 text-rose-500" />
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-900/80 mt-1">
          دلته خپل غږ ثبت مه هېروئ، وینا مو په سټاب واچ بڼه پوره کړئ یا له ځانه وپوښتئ چې ایا غږ مو مسلکي او روان دی؟
        </p>
      </div>

      {/* Navigation for Practice Sub-Sections */}
      <div className="flex bg-stone-100 dark:bg-[#1e1e1e] sepia:bg-[#f6f0dd] p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 sepia:border-amber-200">
        <button
          id="btn-subtab-timer"
          onClick={() => setActiveSubTab('timer')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'timer'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 sepia:text-amber-900/70 hover:bg-stone-50 dark:hover:bg-[#252528] sepia:hover:bg-[#fcf9f0]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>وینا ټایمر (Speech Timer)</span>
        </button>
        <button
          id="btn-subtab-record"
          onClick={() => setActiveSubTab('record')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'record'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 sepia:text-amber-900/70 hover:bg-stone-50 dark:hover:bg-[#252528] sepia:hover:bg-[#fcf9f0]'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>غږ ثبتول (Voice Recorder)</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="bg-white dark:bg-[#121214] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-zinc-800 sepia:border-amber-200 rounded-2xl p-6 shadow-xs">
        
        {/* SUBTAB 1: RECORDING BOX */}
        {activeSubTab === 'record' && (
          <div className="space-y-6">
            <div className="text-center py-6 flex flex-col items-center justify-center">
              
              {/* Voice Ripple effect */}
              <div className="relative mb-6">
                <AnimatePresence>
                  {isRecording && (
                    <>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.5 + (voiceVolume * 0.1), opacity: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 bg-rose-500/20 rounded-full"
                      />
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0.4 }}
                        animate={{ scale: 2 + (voiceVolume * 0.15), opacity: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.4 }}
                        className="absolute inset-0 bg-rose-500/10 rounded-full"
                      />
                    </>
                  )}
                </AnimatePresence>

                <button
                  id="record-main-btn"
                  onClick={isRecording ? (isSimulating ? stopSimulation : stopRecording) : startRecording}
                  className={`relative z-10 p-7 rounded-full shadow-md text-white transition-all flex items-center justify-center ${
                    isRecording 
                      ? 'bg-rose-600 hover:bg-rose-700 hover:scale-105' 
                      : 'bg-stone-950 dark:bg-stone-800 sepia:bg-amber-900 hover:bg-rose-500 hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current text-white/90" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Recording Status and Timer representation */}
              <div className="space-y-2">
                <h3 className="text-2xl font-mono font-bold text-stone-950 dark:text-white sepia:text-amber-950">
                  {formatTime(recordSeconds)}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-800">
                  {isRecording 
                    ? (isPaused ? "ثبتول درول شوي دي" : (isSimulating ? "مایکو بند دی: فرضي ریکارډ روان دی..." : "ستاسو د غږ د پورته کولو ژوندی کچه ریکارډېږي"))
                    : "د وینا د ثبتولو لپاره پورته بټن کلیک کړئ"
                  }
                </p>

                {/* Simulated Sound Wave Blocks */}
                {isRecording && (
                  <div className="flex gap-1 justify-center items-center h-8 mt-4 scale-x-[-1]">
                    {[...Array(12)].map((_, i) => {
                      const isActive = voiceVolume > (i % 6);
                      return (
                        <motion.div
                          key={i}
                          animate={{ 
                            height: isActive ? [8, 28, 8] : 8
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5 + (i * 0.05),
                            ease: "easeInOut"
                          }}
                          className={`w-1 rounded-full ${
                            isPaused 
                              ? 'bg-stone-300 dark:bg-stone-700' 
                              : 'bg-rose-500 dark:bg-rose-400'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Error notifications & action switches */}
            {micPermissionError && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300/40 rounded-xl flex items-start gap-3 text-right">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                    {micPermissionError}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="btn-simulate-mic"
                      onClick={startSimulation}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      فرضي تمرین پیل کړئ
                    </button>
                    <a 
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg text-[11px] font-semibold border border-stone-200 dark:border-stone-700"
                    >
                      <span>په نوې پاڼه کې پرانیستل</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons (Pause/Play) during active record */}
            {isRecording && !isSimulating && (
              <div className="flex justify-center gap-3">
                {isPaused ? (
                  <button
                    id="btn-resume-rec"
                    onClick={resumeRecording}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ثبتول وغځوئ</span>
                  </button>
                ) : (
                  <button
                    id="btn-pause-rec"
                    onClick={pauseRecording}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 dark:bg-[#1e1e1e] border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>موقت ځنډ</span>
                  </button>
                )}
              </div>
            )}

            {/* SAVING RECORD AFTER STOPPING */}
            {lastRecordedUrl && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-5 border border-dashed border-stone-200 dark:border-stone-800 sepia:border-amber-200 bg-stone-50/50 dark:bg-stone-900/10 rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 flex-row-reverse">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <BookmarkCheck className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white sepia:text-amber-950">
                      غږ په برياليتوب سره چمتو شو!
                    </h4>
                  </div>
                  {lastRecordedUrl !== 'simulated-audio-payload' && (
                    <audio src={lastRecordedUrl} controls className="h-8 max-w-[200px]" />
                  )}
                </div>

                <form onSubmit={handleSavePractice} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 sepia:text-amber-900 mb-1">
                      د تمرین ځانګړی نوم / موضوع:
                    </label>
                    <input
                      id="input-practice-title"
                      type="text"
                      className="w-full text-right p-2.5 bg-white dark:bg-[#121214] border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
                      placeholder="لکه: د لومړي مخامختیا جرأت"
                      value={practiceTitle}
                      onChange={(e) => setPracticeTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 sepia:text-amber-900 mb-1">
                      ستاسو خپل یادښتونه، نیمګړتیاوې او نښې:
                    </label>
                    <textarea
                      id="textarea-practice-notes"
                      rows={2}
                      className="w-full text-right p-2.5 bg-white dark:bg-[#121214] border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                      placeholder="مثلاً: ما د جملې تر منځ لږ اوږده وقفه وکړه، غږ مې ارامه و..."
                      value={practiceNotes}
                      onChange={(e) => setPracticeNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="btn-save-practice"
                      type="submit"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      په تاريخچه کې خوندي کړئ
                    </button>
                    <button
                      id="btn-discard-practice"
                      type="button"
                      onClick={() => setLastRecordedUrl(null)}
                      className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-xl hover:text-rose-500 transition-colors"
                      title="بې ځایه او پاکې کړه"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>
        )}

        {/* SUBTAB 2: SPEECH TIMER */}
        {activeSubTab === 'timer' && (
          <div className="space-y-6">
            
            {/* Topic Prompts with Shuffle feature */}
            <div className="p-4 bg-rose-500/5 dark:bg-rose-950/10 border border-stone-100 dark:border-stone-800 rounded-xl flex items-center justify-between gap-4 flex-row-reverse text-right">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  د تمرین ناڅاپي موضوع
                </span>
                <p className="text-sm font-extrabold text-stone-900 dark:text-white sepia:text-amber-950 pt-1">
                  « {selectedTopic} »
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  دا موضوع د ځانګړي ټاکل شوي وخت په جریان کې بې له ځنډه تشرېح کړئ.
                </p>
              </div>
              <button
                id="btn-shuffle-topic"
                onClick={rollNewTopic}
                className="p-2.5 bg-stone-100 dark:bg-[#1e1e21] border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white text-stone-700 dark:text-stone-300 transition-all cursor-pointer flex items-center gap-1"
                title="بله موضوع راوستل"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">بله موضوع</span>
              </button>
            </div>

            {/* Presets setup */}
            <div className="flex gap-2 justify-center">
              {[
                { label: '۱ دقيقه (۶۰ ثانیه)', time: 60 },
                { label: '۲ دقيقې (۱۲۰ ثانیه)', time: 120 },
                { label: '۵ دقيقې (۳۰۰ ثانیه)', time: 300 }
              ].map((preset) => (
                <button
                  key={preset.time}
                  id={`btn-preset-${preset.time}`}
                  onClick={() => selectPreset(preset.time)}
                  className={`px-3 py-2 text-[11px] font-bold rounded-xl border cursor-pointer transition-all ${
                    timerPreset === preset.time
                      ? 'bg-stone-950 dark:bg-stone-800 text-white border-transparent'
                      : 'bg-stone-50 dark:bg-[#1c1c1e] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 sepia:border-amber-200/50 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Huge Clock Graphic representation */}
            <div className="text-center py-6 space-y-4">
              <div className="relative inline-flex items-center justify-center">
                
                {/* pulsing visual timing border ring */}
                <span className="absolute inset-0 border-4 border-stone-100 dark:border-stone-900 sepia:border-amber-200 rounded-full" />
                <motion.span 
                  animate={{ 
                    scale: timerRunning ? [1, 1.05, 1] : 1 
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute inset-0 border-4 rounded-full ${
                    timerRunning ? 'border-rose-500' : 'border-transparent'
                  }`}
                />

                <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center z-10 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] shadow-inner">
                  <span className="text-3xl font-mono font-bold text-stone-950 dark:text-white sepia:text-amber-950">
                    {formatTime(timerSecondsLeft)}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-1">
                    له ټولټال {formatTime(timerPreset)} څخه
                  </span>
                </div>
              </div>

              {/* Dynamic coach tempo advisory */}
              <div className="max-w-xs mx-auto p-2 border border-stone-100 dark:border-stone-800/80 rounded-xl bg-stone-50/40 dark:bg-stone-900/10 text-center">
                <span className="block text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">
                  د خبرو د روانۍ لارښود
                </span>
                <p className={`text-xs ${pacing.color}`}>
                  {pacing.text}
                </p>
              </div>

              {/* Control triggers */}
              <div className="flex justify-center gap-3">
                <button
                  id="btn-reset-timer"
                  onClick={resetTimer}
                  className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 hover:text-rose-500 cursor-pointer transition-colors"
                  title="بیا پیل"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {timerRunning ? (
                  <button
                    id="btn-pause-timer"
                    onClick={pauseTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <Pause className="w-4 h-4" />
                    <span>موقت ځنډ</span>
                  </button>
                ) : (
                  <button
                    id="btn-start-timer"
                    onClick={startTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>وینا پیل کړئ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick action to record speech timer result into history */}
            {!timerRunning && timerSecondsLeft < timerPreset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-2"
              >
                <p className="text-xs text-stone-700 dark:text-stone-400 sepia:text-amber-900">
                  تاسو په بریالیتوب سره د موضوع په سر خبرې بشپړې کړې، غواړئ دا پرمختګ ژغورل کړئ؟
                </p>
                <button
                  id="btn-claim-timer-progress"
                  onClick={() => {
                    const saveSim: PracticeSession = {
                      id: `timer-${Date.now()}`,
                      title: `تمرین: ${selectedTopic}`,
                      duration: timerPreset - timerSecondsLeft,
                      date: new Date().toLocaleDateString('ps-AF'),
                      hasAudio: false,
                      notes: "پر ټاکل شوي ټایمر د وینا غږ منظم بشپړول."
                    };
                    onAddPracticeSession(saveSim);
                    resetTimer();
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>د پرمختګ پاڼو ته اضافه کړئ</span>
                </button>
              </motion.div>
            )}

          </div>
        )}

      </div>

      {/* SECTION 3: PRACTICE LOG HISTORY */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-white sepia:text-amber-950 flex items-center justify-end gap-2 pr-1">
          <span>د خپلو تمرينونو تاريخچه ({history.length})</span>
          <History className="w-4 h-4 text-emerald-500" />
        </h3>

        {history.length === 0 ? (
          <div className="p-8 border border-dashed border-stone-200 dark:border-stone-800 text-center rounded-2xl text-stone-400 dark:text-stone-600">
            <BookmarkCheck className="w-8 h-8 mx-auto stroke-1 text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-xs">تر اوسه کوم ثبت شوی غږ یا زماني تمرین نشته.</p>
            <p className="text-[10px] mt-0.5">لومړی تمرین پیل کړئ ترڅو دلته لیست شي.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                id={`practice-item-${item.id}`}
                className="p-4 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-150 dark:border-[#27272a] sepia:border-amber-200 rounded-xl flex items-center justify-between gap-4 flex-row-reverse text-right hover:border-rose-200 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs md:text-sm font-bold text-stone-900 dark:text-stone-100 sepia:text-amber-950">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <span>{item.date}</span>
                    </span>
                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                    <span className="flex items-center gap-1 font-mono">
                      <span>{formatTime(item.duration)} ثانیې</span>
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 sepia:text-amber-900/85 mt-1 border-r-2 border-rose-300 pr-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-delete-practice-${item.id}`}
                    onClick={() => onDeleteSession(item.id)}
                    className="p-2 text-stone-400 dark:text-stone-600 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="له تاریخچې ایستل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
