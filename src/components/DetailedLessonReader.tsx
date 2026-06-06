import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  Bookmark, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  FileText, 
  Check, 
  Copy, 
  Share2, 
  MessageSquareText, 
  BookOpen, 
  ChevronRight, 
  Palette, 
  Plus, 
  Trash2, 
  ListTodo,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { LessonItem, HighlightItem, LessonNote } from '../types';

interface DetailedLessonReaderProps {
  lesson: LessonItem;
  allLessons: LessonItem[];
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectLesson: (lesson: LessonItem) => void;
  fontSize: string;
}

export const DetailedLessonReader: React.FC<DetailedLessonReaderProps> = ({
  lesson,
  allLessons,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  isBookmarked,
  onToggleBookmark,
  onSelectLesson,
  fontSize: appFontSize
}) => {
  // Tabs: 'main' (لوستل), 'ai_summary' (AI خلاصه), 'qa' (پوښتنې ځوابونه), 'notes' (زما یادښتونه)
  const [activeTab, setActiveTab] = useState<'main' | 'ai_summary' | 'qa' | 'notes'>('main');

  // Reader-specific theme tweaks
  const [localFontSize, setLocalFontSize] = useState<number>(14); // in pixels
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [contrastTheme, setContrastTheme] = useState<'default' | 'parchment' | 'dark' | 'mint'>('default');

  // Advanced features state variables
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSentenceText, setSelectedSentenceText] = useState<string>('');
  const [showSentencePopup, setShowSentencePopup] = useState<boolean>(false);
  const [toastNotify, setToastNotify] = useState<string>('');

  // Databases for customizations/marked values loaded locally
  const [favSentencesStore, setFavSentencesStore] = useState<any[]>([]);
  const [customizationsStore, setCustomizationsStore] = useState<any[]>([]);
  const [completedConcepts, setCompletedConcepts] = useState<{ [key: string]: boolean }>({});

  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // TTS states
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Notes state
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState<string>('');

  // Highlights state
  const [userHighlights, setUserHighlights] = useState<HighlightItem[]>([]);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('rgba(234, 179, 8, 0.4)'); // yellow

  // Quote generator popup state
  const [selectedQuoteText, setSelectedQuoteText] = useState<string>('');
  const [quoteCardBg, setQuoteCardBg] = useState<string>('gradient-sunset');
  const [showQuoteCreator, setShowQuoteCreator] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Active reading stats tracker
  const trackingStartTimes = useRef<number>(Date.now());

  // Block document scroll when reader is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      trackingStartTimes.current = Date.now();
    }
    return () => {
      document.body.style.overflow = '';
      // Save reading duration in stats
      const sessionDurationSec = Math.floor((Date.now() - trackingStartTimes.current) / 1000);
      if (sessionDurationSec > 3) {
        saveTrackedTime(sessionDurationSec);
      }
    };
  }, [isOpen, lesson.id]);

  // Load lesson highlights and notes from localstorage
  useEffect(() => {
    try {
      const storedHighlights = localStorage.getItem('elocution_highlights_store');
      if (storedHighlights) {
        const parsed = JSON.parse(storedHighlights) as HighlightItem[];
        setUserHighlights(parsed.filter(h => h.lessonId === lesson.id));
      }
      
      const storedLessonNotes = localStorage.getItem('elocution_lesson_notes_store');
      if (storedLessonNotes) {
        const parsed = JSON.parse(storedLessonNotes) as LessonNote[];
        setLessonNotes(parsed.filter(n => n.lessonId === lesson.id));
      }

      // Load active sentence customizations
      const storedCustoms = localStorage.getItem('elocution_sentence_customizations');
      if (storedCustoms) {
        setCustomizationsStore(JSON.parse(storedCustoms));
      } else {
        setCustomizationsStore([]);
      }

      // Load favorite sentences database
      const storedFavSentences = localStorage.getItem('elocution_fav_sentences');
      if (storedFavSentences) {
        setFavSentencesStore(JSON.parse(storedFavSentences));
      } else {
        setFavSentencesStore([]);
      }

      // Load concept check list progress
      const storedProgress = localStorage.getItem(`elocution_completed_concepts_${lesson.id}`);
      if (storedProgress) {
        setCompletedConcepts(JSON.parse(storedProgress));
      } else {
        setCompletedConcepts({});
      }
    } catch (e) {
      console.warn("Could not load reader offline databases", e);
    }

    // Clear search and quiz states
    setSearchQuery('');
    setQuizAnswers({});
    setQuizSubmitted(false);

    // Default to 'main' tab when active lesson changes
    setActiveTab('main');
    // Set local font size to something nice based on global selection
    if (appFontSize === 'sm') setLocalFontSize(13);
    else if (appFontSize === 'lg') setLocalFontSize(16);
    else if (appFontSize === 'xl') setLocalFontSize(18);
    else setLocalFontSize(14);
  }, [lesson.id, appFontSize]);

  // Save tracked reading times
  const saveTrackedTime = (seconds: number) => {
    try {
      const existingSeconds = Number(localStorage.getItem('elocution_total_seconds') || '0');
      localStorage.setItem('elocution_total_seconds', String(existingSeconds + seconds));
      
      // Also register in raw history log for chart timelines
      const logsStr = localStorage.getItem('elocution_reading_logs') || '[]';
      const logs = JSON.parse(logsStr);
      logs.push({
        lessonId: lesson.id,
        duration: seconds,
        date: new Date().toLocaleDateString('ps-AF'),
        timestamp: Date.now()
      });
      localStorage.setItem('elocution_reading_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn("Could not sync reading duration logs", e);
    }
  };

  // Add highlight segment
  const handleToggleHighlight = (textSegment: string) => {
    try {
      const storedHighlightsStr = localStorage.getItem('elocution_highlights_store') || '[]';
      const allHighlights = JSON.parse(storedHighlightsStr) as HighlightItem[];
      
      // Check if already highlighted
      const existingIndex = allHighlights.findIndex(h => h.lessonId === lesson.id && h.text === textSegment);
      
      if (existingIndex > -1) {
        // Remove it
        allHighlights.splice(existingIndex, 1);
      } else {
        // Add new
        const newItem: HighlightItem = {
          id: `hl-${Date.now()}`,
          lessonId: lesson.id,
          text: textSegment,
          color: selectedHighlightColor,
          createdAt: new Date().toLocaleDateString('ps-AF')
        };
        allHighlights.unshift(newItem);
      }
      
      localStorage.setItem('elocution_highlights_store', JSON.stringify(allHighlights));
      setUserHighlights(allHighlights.filter(h => h.lessonId === lesson.id));
    } catch (e) {
      console.warn("Could not update highlights state", e);
    }
  };

  // Add lesson-specific notes
  const handleAddLessonNote = () => {
    if (!newNoteContent.trim()) return;
    try {
      const storedNotesStr = localStorage.getItem('elocution_lesson_notes_store') || '[]';
      const allLessonNotes = JSON.parse(storedNotesStr) as LessonNote[];
      
      const newNote: LessonNote = {
        id: `ln-${Date.now()}`,
        lessonId: lesson.id,
        content: newNoteContent,
        createdAt: new Date().toLocaleString('ps-AF')
      };
      
      allLessonNotes.unshift(newNote);
      localStorage.setItem('elocution_lesson_notes_store', JSON.stringify(allLessonNotes));
      setLessonNotes(allLessonNotes.filter(n => n.lessonId === lesson.id));
      setNewNoteContent('');
    } catch (e) {
      console.warn("Could not save lesson-specific note", e);
    }
  };

  const handleDeleteLessonNote = (noteId: string) => {
    try {
      const storedNotesStr = localStorage.getItem('elocution_lesson_notes_store') || '[]';
      const allLessonNotes = JSON.parse(storedNotesStr) as LessonNote[];
      
      const filtered = allLessonNotes.filter(n => n.id !== noteId);
      localStorage.setItem('elocution_lesson_notes_store', JSON.stringify(filtered));
      setLessonNotes(filtered.filter(n => n.lessonId === lesson.id));
    } catch (e) {
      console.warn("Could not remove lesson-specific note", e);
    }
  };

  // Split paragraph into discrete clickable sentences
  const getPashtoSentences = (text: string) => {
    if (!text) return [];
    return text.split(/(?<=[.?!؟\n])/g).filter(s => s.trim().length > 1);
  };

  const handleSentenceClick = (text: string) => {
    setSelectedSentenceText(text.trim());
    setShowSentencePopup(true);
  };

  const handleSaveSentenceOnly = () => {
    if (!selectedSentenceText) return;
    try {
      const existingFavs = [...favSentencesStore];
      const alreadySaved = existingFavs.some(s => s.text === selectedSentenceText);
      if (!alreadySaved) {
        const newFav = {
          id: `fav-sent-${Date.now()}`,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          text: selectedSentenceText,
          createdAt: new Date().toLocaleDateString('ps-AF')
        };
        const updated = [newFav, ...existingFavs];
        setFavSentencesStore(updated);
        localStorage.setItem('elocution_fav_sentences', JSON.stringify(updated));
        setToastNotify('جمله په بریا سره په خوښو جملو کې خوندي شوه! ❤️');
      } else {
        setToastNotify('دا جمله دمخه خوندي شوې وه.');
      }
    } catch (e) {
      console.warn("Could not save favorite sentence", e);
    }
    setShowSentencePopup(false);
  };

  const handleApplyUnderlineAndMarker = (color?: string, icon?: string) => {
    if (!selectedSentenceText) return;
    try {
      const customs = [...customizationsStore];
      const existingIdx = customs.findIndex(c => c.lessonId === lesson.id && c.text === selectedSentenceText);

      if (existingIdx > -1) {
        customs[existingIdx] = {
          ...customs[existingIdx],
          underlineColor: color !== undefined ? color : customs[existingIdx].underlineColor,
          customMarker: icon !== undefined ? icon : customs[existingIdx].customMarker
        };
        if (!customs[existingIdx].underlineColor && !customs[existingIdx].customMarker) {
          customs.splice(existingIdx, 1);
        }
      } else {
        customs.push({
          lessonId: lesson.id,
          text: selectedSentenceText,
          underlineColor: color,
          customMarker: icon
        });
      }

      setCustomizationsStore(customs);
      localStorage.setItem('elocution_sentence_customizations', JSON.stringify(customs));
      setToastNotify('ستاسو د متن نښان بدل شو! ✨');
    } catch (e) {
      console.warn("Could not apply paragraph customizations", e);
    }
    setShowSentencePopup(false);
  };

  const handleClipboardCopyWithHistory = () => {
    if (!selectedSentenceText) return;
    try {
      navigator.clipboard.writeText(selectedSentenceText);
      
      const historyStr = localStorage.getItem('elocution_copy_history') || '[]';
      const historyList = JSON.parse(historyStr);
      historyList.unshift({
        id: `copy-${Date.now()}`,
        text: selectedSentenceText,
        date: new Date().toLocaleDateString('ps-AF')
      });

      localStorage.setItem('elocution_copy_history', JSON.stringify(historyList.slice(0, 55)));
      setToastNotify('جمله کاپي شوه او تاریخچه کې خوندي شوه! 📋');
    } catch (e) {
      console.warn("Could not copy with history", e);
    }
    setShowSentencePopup(false);
  };

  const handleToggleConceptMastery = (concept: string) => {
    const updated = { ...completedConcepts, [concept]: !completedConcepts[concept] };
    setCompletedConcepts(updated);
    localStorage.setItem(`elocution_completed_concepts_${lesson.id}`, JSON.stringify(updated));
    setToastNotify(updated[concept] ? 'مفهوم په بریا لوستل شو! ✅' : 'مفهوم خلاص حالت ته لاړ.');
  };

  const highlightQueryMatches = (text: string) => {
    if (!searchQuery.trim()) return text;
    const q = searchQuery.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;

    const before = text.substring(0, idx);
    const middle = text.substring(idx, idx + searchQuery.length);
    const after = text.substring(idx + searchQuery.length);

    return (
      <>
        {before}
        <strong className="bg-[#ef4444]/30 text-rose-900 dark:text-rose-100 px-0.5 rounded shadow-xs">
          {middle}
        </strong>
        {after}
      </>
    );
  };

  const handlePrintFriendlyMode = () => {
    window.print();
  };

  // TTS Speech Functions
  const handleStartTTS = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speaking
      window.speechSynthesis.cancel();

      // Collect all text
      let textToSpeak = `${lesson.title}. ${lesson.description || ''}. `;
      if (lesson.content) {
        textToSpeak += lesson.content;
      }
      if (lesson.points) {
        lesson.points.forEach(p => {
          textToSpeak += `${p.title}. ${p.text}. `;
        });
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ps-AF'; // Prefer Pashto speech synthesis
      utterance.rate = speechRate;
      
      utterance.onend = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };
      
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };

      speechUtteranceRef.current = utterance;
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("بښنه غواړو، ستاسو په دا مرورګر کې د غږ لوستونکي همغږي نښه شتون نلري.");
    }
  };

  const handlePauseTTS = () => {
    if ('speechSynthesis' in window && isPlayingSpeech) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
      }
    }
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    }
  };

  // Speed adjust during active reading
  useEffect(() => {
    if (isPlayingSpeech && speechUtteranceRef.current) {
      const speechTime = window.speechSynthesis;
      const remainsSpeaking = speechTime.speaking;
      if (remainsSpeaking) {
        handleStartTTS(); // restart with new rate
      }
    }
  }, [speechRate]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text Selection / Excerpt Quote Builder
  const handleOpenQuoteCreator = (pText: string) => {
    setSelectedQuoteText(pText);
    setShowQuoteCreator(true);
  };

  const handleCopyQuoteToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Helper theme classes mapping
  const getThemeClasses = () => {
    switch (contrastTheme) {
      case 'parchment':
        return {
          bg: 'bg-[#FDFBF7] text-stone-900',
          card: 'bg-[#F5F2EA] border-amber-200/60 text-stone-850',
          title: 'text-[#432A15] font-black',
          sub: 'text-stone-605',
          panel: 'bg-[#FAF6EE] border-amber-200',
          tabActive: 'bg-amber-100/60 dark:bg-amber-100 border-amber-300 text-amber-950',
          tabInactive: 'text-stone-500 hover:bg-stone-50'
        };
      case 'dark':
        return {
          bg: 'bg-[#0B0F19] text-[#E2E8F0]',
          card: 'bg-[#151D30] border-slate-800 text-slate-100',
          title: 'text-white font-black',
          sub: 'text-slate-400',
          panel: 'bg-[#0E1626] border-slate-800',
          tabActive: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          tabInactive: 'text-slate-400 hover:bg-slate-900/40'
        };
      case 'mint':
        return {
          bg: 'bg-[#F4FAF6] text-[#14532D]',
          card: 'bg-[#E6F4EA] border-[#B7E1CD]/50 text-[#14532d]',
          title: 'text-[#052E16] font-black',
          sub: 'text-emerald-800/80',
          panel: 'bg-[#EBF7EA]/80 border-emerald-200/50',
          tabActive: 'bg-emerald-200/50 border-emerald-300 text-emerald-950',
          tabInactive: 'text-emerald-700/70 hover:bg-emerald-50'
        };
      default: // default slate light/dark auto support matches App values
        return {
          bg: 'bg-white dark:bg-[#09090b] text-stone-900 dark:text-zinc-100',
          card: 'bg-stone-50 dark:bg-[#18181b] border-stone-200 dark:border-zinc-805 text-stone-900 dark:text-zinc-100',
          title: 'text-stone-950 dark:text-white font-black',
          sub: 'text-stone-500 dark:text-zinc-400',
          panel: 'bg-stone-100/30 dark:bg-[#111113] border-stone-150 dark:border-zinc-850',
          tabActive: 'bg-rose-500 text-white border-transparent',
          tabInactive: 'bg-stone-50 dark:bg-zinc-900 border-stone-200/40 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100/50'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Quote custom themes options
  const getQuoteGradientClass = (bgStyleCode: string) => {
    switch (bgStyleCode) {
      case 'gradient-sunset': return 'from-rose-500 via-orange-500 to-rose-600 text-white';
      case 'gradient-emerald': return 'from-emerald-600 via-cyan-600 to-teal-700 text-white';
      case 'gradient-space': return 'from-violet-600 via-purple-700 to-indigo-800 text-white';
      case 'slate-dark': return 'bg-zinc-900 border border-zinc-800 text-zinc-100';
      case 'sand-light': return 'bg-[#FAF6EE] border border-amber-200 text-amber-950 font-serif';
      default: return 'from-rose-500 to-amber-500 text-white';
    }
  };

  if (!isOpen) return null;

  // Filter recommendations matching the categories
  const relatedLessons = allLessons.filter(l => 
    l.id !== lesson.id && (lesson.relatedIds?.includes(l.id) || l.category === lesson.category)
  ).slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4 select-none outline-none"
      >
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 24, stiffness: 180 }}
          className={`w-full h-full sm:max-w-3xl sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden outline-none ${themeClasses.bg}`}
        >
          
          {/* CONTROLS HEADER BAR */}
          <div className="px-5 py-4 border-b border-stone-200/40 dark:border-zinc-800/80 flex items-center justify-between flex-row-reverse bg-white/40 dark:bg-black/10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-300 rounded-full cursor-pointer transition-colors"
                title="تړل"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title Section */}
            <div className="text-right flex-1 pr-3">
              <span className="text-[10px] tracking-wider uppercase font-black text-rose-500">د لوستلو ځانګړی حالت</span>
              <h1 className="text-sm font-black line-clamp-1 truncate mt-0.5">{lesson.title}</h1>
            </div>

            {/* Quick Favorites and Bookmarks buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleFavorite(lesson.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isFavorite 
                    ? 'bg-rose-500/10 text-rose-505 border-rose-200 dark:border-rose-900/30' 
                    : 'bg-transparent text-stone-400 dark:text-zinc-650 border-stone-200 dark:border-zinc-800 hover:text-rose-500'
                }`}
                title={isFavorite ? "له خوښې ایستل" : "په خوښو کې موندل"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => onToggleBookmark(lesson.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBookmarked 
                    ? 'bg-amber-500/10 text-amber-505 border-amber-205 dark:border-amber-900/30' 
                    : 'bg-transparent text-stone-400 dark:text-zinc-650 border-stone-200 dark:border-zinc-800 hover:text-amber-500'
                }`}
                title={isBookmarked ? "بوکمارک لرې کول" : "نښه یاد ساتل"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* ADVANCED CUSTOMIZER PANEL FOR READING MODE */}
          <div className="px-5 py-3 border-b border-stone-150 dark:border-zinc-850/80 bg-stone-50/40 dark:bg-zinc-950/20 flex flex-wrap gap-4 items-center justify-between flex-row-reverse">
            
            {/* Tone Contrast theme selector */}
            <div className="flex items-center gap-1 flex-row-reverse">
              <span className="text-[10px] text-stone-400 ml-1">د متن رنګ:</span>
              <div className="flex gap-1">
                {(['default', 'parchment', 'dark', 'mint'] as const).map((bgType) => (
                  <button
                    key={bgType}
                    onClick={() => setContrastTheme(bgType)}
                    className={`h-5 w-5 rounded-full border cursor-pointer transition-all ${
                      bgType === 'default' ? 'bg-white text-zinc-900 border-stone-300' :
                      bgType === 'parchment' ? 'bg-[#FAF6EE] border-amber-205 text-stone-900' :
                      bgType === 'dark' ? 'bg-[#0B0F19] border-slate-700 text-white' :
                      'bg-[#EBF7EA] border-[#B7E1CD] text-emerald-950'
                    } ${contrastTheme === bgType ? 'ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-black' : 'scale-90 hover:scale-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Font adjuster panel controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400">فونټ بدلول:</span>
              <button 
                onClick={() => setLocalFontSize(prev => Math.max(11, prev - 1))}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 rounded-md cursor-pointer font-bold"
              >
                الف-
              </button>
              <span className="text-xs font-bold font-mono opacity-80">{localFontSize}پکسل</span>
              <button 
                onClick={() => setLocalFontSize(prev => Math.min(24, prev + 1))}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 rounded-md cursor-pointer font-bold"
              >
                الف+
              </button>

              <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 mx-1" />

              <span className="text-[10px] text-stone-400">فاصله:</span>
              <button 
                onClick={() => setLineHeight(prev => prev === 1.5 ? 1.8 : prev === 1.8 ? 2.2 : 1.5)}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs text-stone-700 dark:text-zinc-300 rounded-md cursor-pointer text-[10px] font-black"
              >
                {lineHeight === 1.5 ? 'تنګ' : lineHeight === 1.8 ? 'نورمال' : 'خلاص'}
              </button>
            </div>

          </div>

          {/* INTEGRATED TEXT TO SPEECH PLAYER PANEL */}
          <div className="bg-rose-500/5 dark:bg-rose-500/10 border-b border-rose-500/10 px-5 py-2.5 flex items-center justify-between flex-row-reverse gap-3">
            <div className="flex items-center gap-2 flex-row-reverse">
              <Volume2 className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-rose-500 block">پښتو مله غږ لوستونکی</span>
                <span className="text-[10px] text-stone-500 dark:text-zinc-400">تاسو کولی شئ دا درس د پښتو غږ په مرسته عملاً واورئ.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-bold">بېلابېل کچه:</span>
                <select 
                  value={speechRate} 
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-[10px] py-0.5 px-1 rounded-md"
                >
                  <option value={0.75}>ورو (۰.۷۵x)</option>
                  <option value={1.0}>عادي (۱.۰x)</option>
                  <option value={1.25}>ګړندی (۱.۲۵x)</option>
                  <option value={1.5}>چټک (۱.۵x)</option>
                </select>
              </div>

              <div className="h-4 w-px bg-rose-500/20" />

              <div className="flex gap-1">
                {!isPlayingSpeech ? (
                  <button
                    onClick={handleStartTTS}
                    className="p-1 px-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5" />
                    اورېدل د غږ
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePauseTTS}
                      className="p-1 px-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Pause className="w-2.5 h-2.5" />
                      {isPausedSpeech ? 'بیا پیل' : 'وقفه'}
                    </button>
                    <button
                      onClick={handleStopTTS}
                      className="p-1 px-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 text-[10px] font-bold cursor-pointer"
                    >
                      <Square className="w-2.5 h-2.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ACTIVE TAB NAVIGATION BAR AT LEVEL OF WORKSPACE */}
          <div className="px-4 py-2 border-b border-stone-150 dark:border-zinc-850 flex gap-1 bg-stone-50/10 dark:bg-transparent flex-row-reverse overflow-x-auto scrollbar-none">
            {[
              { id: 'main', icon: <BookOpen className="w-3.5 h-3.5" />, label: 'اصلي مطلب' },
              { id: 'ai_summary', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'آفلاین خلاصه & د زر ټکي' },
              { id: 'qa', icon: <MessageSquareText className="w-3.5 h-3.5" />, label: 'تخصصي پوښتنې ځوابونه' },
              { id: 'notes', icon: <FileText className="w-3.5 h-3.5" />, label: 'یادښتونه د لوست' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-black border flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all flex-row-reverse ${
                  activeTab === tab.id
                    ? themeClasses.tabActive
                    : themeClasses.tabInactive
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* READER CONTENT CORE BODY */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 text-right">
            
            {/* TAB 1: MAIN READING SECTION */}
            {activeTab === 'main' && (
              <div 
                className="space-y-6"
                style={{ 
                  fontSize: `${localFontSize}px`, 
                  lineHeight: lineHeight,
                  fontFamily: contrastTheme === 'parchment' ? 'Georgia, serif' : 'sans-serif'
                }}
              >
                {/* Advanced Search bar & Metadata (76, 77, 94, 91, 92) */}
                <div className="p-3.5 bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200/50 dark:border-zinc-850 flex flex-col md:flex-row-reverse justify-between items-center gap-3 select-none text-[10.5px]">
                  {/* Metadata display */}
                  <div className="flex gap-1.5 flex-wrap flex-row-reverse">
                    <span className="bg-rose-500/10 text-rose-550 px-2.5 py-1 rounded-lg font-black font-mono">
                      📏 کلمې: ~{lesson.content ? lesson.content.split(' ').length + (lesson.points ? lesson.points.length * 20 : 0) : 100}
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg font-black font-mono">
                      ⏱️ لوست موده: ~{Math.ceil((lesson.content ? lesson.content.split(' ').length : 120) / 100)} دقیقه
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-605 px-2.5 py-1 rounded-lg font-black">
                      🏷️ کټګوري: {lesson.category === 'definition' ? 'وینا پېژندنه' : lesson.category === 'golden_rules' ? '۲۰ زرین اصول' : 'عملي تمرینونه'}
                    </span>
                    <button
                      onClick={handlePrintFriendlyMode}
                      className="bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200/55 dark:border-zinc-800 px-2.5 py-1 rounded-lg font-black flex items-center gap-1 cursor-pointer transition-colors flex-row-reverse"
                      title="پرنټ کول"
                    >
                      <span>پرنټ</span>
                    </button>
                  </div>

                  {/* Search inside input block */}
                  <div className="flex items-center gap-1.5 w-full md:w-auto flex-row-reverse">
                    <input
                      type="text"
                      className="bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-850 p-1 px-3 rounded-lg text-right text-[10px] font-black focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-xs flex-1 md:w-48"
                      placeholder="متن کې کلمې ولټوئ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-stone-400 hover:text-stone-600 text-[10px] font-bold"
                      >
                        حذف کړه
                      </button>
                    )}
                  </div>
                </div>

                {/* Intro Content text */}
                {lesson.content && (
                  <div className="relative p-1">
                    <p className="whitespace-pre-wrap leading-relaxed inline flex-wrap text-right">
                      {getPashtoSentences(lesson.content).map((sentence, sIdx) => {
                        const custom = customizationsStore.find(c => c.lessonId === lesson.id && c.text === sentence.trim());
                        const customUnderline = custom?.underlineColor;
                        const customIcon = custom?.customMarker;

                        return (
                          <span
                            key={sIdx}
                            onClick={() => handleSentenceClick(sentence)}
                            className={`hover:bg-rose-500/15 cursor-pointer rounded px-0.5 transition-colors inline-block text-right ${
                              customUnderline ? `border-b-2 border-dashed ${
                                customUnderline === 'red' ? 'border-rose-500 bg-rose-500/5' :
                                customUnderline === 'yellow' ? 'border-amber-400 bg-amber-400/5' :
                                customUnderline === 'green' ? 'border-emerald-500 bg-emerald-500/5' :
                                'border-cyan-500 bg-cyan-700/5'
                              }` : ''
                            }`}
                          >
                            {customIcon && (
                              <span className="text-[9px] bg-sky-500/10 text-sky-505 px-1 py-0.2 rounded-md ml-1 select-none font-bold">
                                {customIcon === 'key' ? '🔑 مهم' : customIcon === 'attention' ? '⚠️ تمرکز' : customIcon === 'idea' ? '💡 فکر' : '⭐ ستوری'}
                              </span>
                            )}
                            {highlightQueryMatches(sentence)}
                          </span>
                        );
                      })}
                    </p>
                    
                    {/* Highlighter and excerpt option strip */}
                    <div className="mt-3 flex gap-1 justify-end border-t border-stone-105/50 pt-2.5">
                      <button
                        onClick={() => handleToggleHighlight(lesson.content || '')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 transition-all flex-row-reverse cursor-pointer ${
                          userHighlights.some(hl => hl.text === lesson.content)
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-305'
                            : 'bg-stone-50 dark:bg-zinc-900 text-stone-500 border-transparent hover:border-stone-200'
                        }`}
                      >
                        <Palette className="w-3 h-3" />
                        <span>{userHighlights.some(hl => hl.text === lesson.content) ? 'هایلایټ صفا کړئ' : 'هایلایټ کول'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenQuoteCreator(lesson.content || '')}
                        className="text-[10px] font-bold px-2 py-1 bg-stone-50 dark:bg-zinc-900 border border-transparent hover:border-stone-200 text-stone-500 rounded-md flex items-center gap-1 flex-row-reverse cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>عکس جوړه کړئ (کارت)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Styled Points lists for rules/exercises */}
                {lesson.points && (
                  <div className="space-y-5">
                    {lesson.points.map((point) => {
                      const isPointHighlighted = userHighlights.some(hl => hl.text === point.text);
                      return (
                        <div 
                          key={point.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isPointHighlighted 
                              ? 'bg-rose-500/10 border-rose-300/40 shadow-xs' 
                              : 'bg-stone-50/10 dark:bg-zinc-900/10 border-stone-200/40 dark:border-zinc-850'
                          }`}
                        >
                          <h3 className="font-sans font-black text-rose-500 dark:text-rose-400 mb-2 flex items-center flex-row gap-2 text-right">
                            <span>{point.title}</span>
                          </h3>
                          <p 
                            className="leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-zinc-350 inline flex-wrap text-right"
                            style={{ fontSize: `${localFontSize - 1}px` }}
                          >
                            {getPashtoSentences(point.text).map((sentence, sIdx) => {
                              const custom = customizationsStore.find(c => c.lessonId === lesson.id && c.text === sentence.trim());
                              const customUnderline = custom?.underlineColor;
                              const customIcon = custom?.customMarker;

                              return (
                                <span
                                  key={sIdx}
                                  onClick={() => handleSentenceClick(sentence)}
                                  className={`hover:bg-rose-500/10 cursor-pointer rounded px-0.5 transition-colors inline text-right ${
                                    customUnderline ? `border-b-2 border-dashed ${
                                      customUnderline === 'red' ? 'border-rose-500 bg-rose-500/5' :
                                      customUnderline === 'yellow' ? 'border-amber-400 bg-amber-400/5' :
                                      customUnderline === 'green' ? 'border-emerald-500 bg-emerald-505/5' :
                                      'border-cyan-500 bg-cyan-500/5'
                                    }` : ''
                                  }`}
                                >
                                  {customIcon && (
                                    <span className="text-[9px] bg-sky-500/10 text-sky-505 px-1 rounded ml-1 select-none font-bold">
                                      {customIcon === 'key' ? '🔑 مهم' : customIcon === 'attention' ? '⚠️ پام' : customIcon === 'idea' ? '💡 فکر' : '⭐ ستوری'}
                                    </span>
                                  )}
                                  {highlightQueryMatches(sentence)}
                                </span>
                              );
                            })}
                          </p>

                          {/* Controls bar inside point for highlighter / quote generator excerpt selection */}
                          <div className="mt-2.5 flex justify-end gap-1.5 border-t border-stone-150/50 dark:border-zinc-800/40 pt-2 flex-row">
                            <button
                              onClick={() => handleToggleHighlight(point.text)}
                              className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all flex items-center gap-1 flex-row-reverse cursor-pointer ${
                                isPointHighlighted
                                  ? 'bg-rose-500/10 text-rose-505 border-rose-200'
                                  : 'bg-transparent text-stone-400 dark:text-zinc-550 border-transparent hover:border-stone-200/50'
                              }`}
                            >
                              <Palette className="w-3 h-3" />
                              <span>{isPointHighlighted ? 'رنګ ایسته کړئ' : 'نښه رنګ کړئ'}</span>
                            </button>
                            
                            <button
                              onClick={() => handleOpenQuoteCreator(point.text)}
                              className="text-[9px] font-black px-2 py-0.5 bg-transparent border border-transparent hover:border-stone-200/30 text-stone-400 rounded flex items-center gap-1 flex-row-reverse cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>د عکس کارت</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Concept checklist (60) */}
                <div className="p-4 bg-stone-500/5 bg-gradient-to-l from-emerald-500/10 to-transparent border border-emerald-500/10 rounded-2xl select-none text-right mt-6">
                  <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">د درس کلیدي مفاهیم تایید کارټ (Concept Mastery Checklist)</span>
                  <p className="text-[10px] text-stone-400">ستاسو پوهه په دغه مفهوم کې څومره قوي شوې؟ تاییدي نښان پرې کیږدئ:</p>
                  <div className="space-y-2 mt-3">
                    {(lesson.keyPoints || ['د غږ او کلام روڼوالی', 'د ویناوالۍ روحي ځواک چمتو کول']).slice(0, 2).map((concept, idx) => {
                      const isChecked = !!completedConcepts[concept];
                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleToggleConceptMastery(concept)}
                          className="flex items-center gap-2 flex-row-reverse justify-start cursor-pointer group"
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-emerald-500 border-transparent text-white' : 'border-stone-300 dark:border-zinc-800'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className={`text-[10.5px] font-black transition-colors ${
                            isChecked ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-zinc-250 group-hover:text-rose-500'
                          }`}>{concept}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive End of Lesson Quiz (56 / 58) */}
                <div className="p-5 bg-white dark:bg-neutral-905 border border-stone-200/50 dark:border-zinc-850 rounded-2xl select-none text-right mt-6">
                  <span className="text-[10px] font-black text-rose-500 uppercase block mb-1">د معلوماتو د یاد ساتلو پياوړې ازموينه (Self-Test Quiz)</span>
                  <h4 className="text-xs font-black">لاندې پوښتنې ته د لوست په حواله سم ځواب ومومئ:</h4>
                  
                  {lesson.qaList && lesson.qaList.length > 0 ? (
                    <div className="space-y-4 mt-3">
                      {lesson.qaList.slice(0, 1).map((qa, qIdx) => {
                        const choices = [
                          qa.a.substring(0, Math.min(110, qa.a.length)),
                          "غیر منظم، مکرر او په بې غږه کالب یا ستړي کلام باندې خبرې کول.",
                          "له اورېدونکو څخه لرې تېښته او موازي د ډار احساس منل."
                        ];

                        const activeAnswer = quizAnswers[qIdx];

                        return (
                          <div key={qIdx} className="space-y-2.5">
                            <p className="text-[11.5px] font-bold text-stone-850 dark:text-stone-200 leading-normal">{qa.q}</p>
                            <div className="space-y-2">
                              {choices.map((choice, cIdx) => {
                                let btnClass = 'border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-950/25';
                                if (quizSubmitted) {
                                  const isCorrect = qa.a.substring(0, 15) === choice.substring(0, 15) || cIdx === 0;
                                  if (isCorrect) {
                                    btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
                                  } else if (activeAnswer === cIdx) {
                                    btnClass = 'bg-rose-500/10 border-rose-500 text-rose-550';
                                  }
                                } else if (activeAnswer === cIdx) {
                                  btnClass = 'border-rose-500 ring-1 ring-rose-500 bg-rose-505/5';
                                }

                                return (
                                  <button
                                    key={cIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: cIdx }))}
                                    className={`w-full text-right p-3 rounded-xl border text-[10.5px] font-medium leading-relaxed transition-all cursor-pointer block ${btnClass}`}
                                  >
                                    {choice}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex gap-2 justify-end mt-4">
                        {!quizSubmitted ? (
                          <button
                            disabled={quizAnswers[0] === undefined}
                            onClick={() => setQuizSubmitted(true)}
                            className="px-4 py-1.5 bg-rose-500 text-white hover:bg-rose-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer disabled:opacity-40"
                          >
                            ځواب وتړئ
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-250 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer"
                          >
                            بیا پیل کړه
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 mt-2">د دغه لوست پوښتنې لا ترتیب شوې ندي.</p>
                  )}
                </div>
                
                {/* Related recommended suggestions */}
                {relatedLessons.length > 0 && (
                  <div className="pt-6 border-t border-stone-150 dark:border-zinc-850 mt-6">
                    <h4 className="text-xs font-black text-stone-400 mb-3 block">ستاسو لپاره نور وړاندیزونه:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {relatedLessons.map((rl) => (
                        <div
                          key={rl.id}
                          onClick={() => onSelectLesson(rl)}
                          className="p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-150 dark:border-zinc-850 hover:border-rose-400 dark:hover:border-zinc-700 transition-all rounded-xl cursor-pointer text-right flex flex-col justify-between group"
                        >
                          <span className="text-[10px] font-black text-rose-500 group-hover:text-rose-600">درس لوستل</span>
                          <p className="text-[11px] font-bold leading-normal text-stone-700 dark:text-zinc-200 mt-1 line-clamp-2">{rl.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: AI SUMMARY & KEY POINTS */}
            {activeTab === 'ai_summary' && (
              <div className="space-y-6">
                
                {/* Visual Summary Block header */}
                <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-2xl">
                  <div className="flex items-center gap-2 flex-row-reverse mb-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-black text-rose-500">د لوست لنډ آفلاین خلاصون او زړی</h3>
                  </div>
                  <p className="text-xs text-stone-605 dark:text-zinc-300 leading-relaxed">
                    {lesson.offlineSummary || 'د دې درس لپاره مخکې خلاصون چمتو شوی نه دی، مګر په ویناوالۍ کې په لومړۍ ثانیو د موضوع درک او خلاصون مرسته کوي.'}
                  </p>
                </div>

                {/* Key takeaways list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <ListTodo className="w-3.5 h-3.5 text-rose-500" />
                    <h4 className="text-xs font-black text-stone-500">د دغه درس ۳ د بریا کلیدي ټکي:</h4>
                  </div>
                  
                  {lesson.keyPoints && lesson.keyPoints.length > 0 ? (
                    <div className="space-y-2">
                      {lesson.keyPoints.map((pt, idx) => (
                        <div 
                          key={idx}
                          className="p-3.5 bg-stone-55/40 dark:bg-zinc-900 border border-stone-150 dark:border-zinc-850 rounded-xl text-xs flex items-start gap-2.5 flex-row-reverse"
                        >
                          <div className="h-5 w-5 bg-rose-500/10 text-rose-505 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-stone-700 dark:text-zinc-300 leading-normal pt-0.5">{pt}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">کلیدي ټکي تالیف شوي نه دي.</p>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: INTERACTIVE Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-row-reverse border-b border-stone-200/40 pb-3">
                  <MessageSquareText className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-black">تخصصي او معلوماتي پوښتنې ځوابونه</h3>
                </div>

                {lesson.qaList && lesson.qaList.length > 0 ? (
                  <div className="space-y-4">
                    {lesson.qaList.map((qa, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-stone-50 dark:bg-zinc-900/50 border border-stone-150 dark:border-zinc-850 rounded-2xl relative overflow-hidden"
                      >
                        {/* Question label in Pashto */}
                        <div className="flex items-start gap-2.5 flex-row-reverse mb-2">
                          <span className="text-[10px] bg-rose-500 text-white font-black rounded-lg px-2 py-0.5 shrink-0">پوښتنه</span>
                          <h4 className="text-xs font-black text-stone-850 dark:text-white pt-0.5 leading-normal">{qa.q}</h4>
                        </div>
                        {/* Answer label in Pashto */}
                        <div className="flex items-start gap-2.5 flex-row-reverse mt-3 border-t border-stone-200/40 pt-2.5">
                          <span className="text-[10px] bg-emerald-500 text-white font-black rounded-lg px-2 py-0.5 shrink-0">ځواب</span>
                          <p className="text-xs text-stone-605 dark:text-zinc-300 leading-relaxed pt-0.5">{qa.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed text-center rounded-xl text-stone-400 text-xs">
                    د دې لوست لپاره د کارکوونکو اړوند پوښتنه تنظیم شوې نه ده.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LESSON DRAFT NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-row-reverse justify-between">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <FileText className="w-4 h-4 text-rose-505" />
                    <h3 className="text-sm font-black">شخصي یادښتونه (د دغه لوست په حواله)</h3>
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold bg-stone-100 dark:bg-zinc-900 py-0.5 px-2 rounded-md">
                    {lessonNotes.length} ټوټه
                  </span>
                </div>

                {/* Input block directly in reader */}
                <div className="p-4 bg-stone-50 dark:bg-zinc-905 border border-stone-150 dark:border-zinc-850 rounded-2xl space-y-3">
                  <textarea
                    className="w-full text-right p-3 border border-stone-200 dark:border-zinc-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white dark:bg-zinc-900 text-stone-850 dark:text-zinc-100"
                    placeholder="په دې درس کې خپل لوست ته سمون، یاد کلمات یا بیداره کلامي نقشه ور اضافه کړئ..."
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <div className="flex justify-start">
                    <button
                      onClick={handleAddLessonNote}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 flex-row-reverse shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      زیاتول یادښت
                    </button>
                  </div>
                </div>

                {/* History list of note segments */}
                {lessonNotes.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {lessonNotes.map((n) => (
                      <div 
                        key={n.id}
                        className="p-4 bg-stone-100/30 dark:bg-[#111113] border border-stone-150 dark:border-zinc-850/80 rounded-xl relative flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center flex-row-reverse border-b border-stone-200/40 pb-2 mb-2">
                          <span className="text-[9px] text-stone-400 font-mono">{n.createdAt}</span>
                          <button
                            onClick={() => handleDeleteLessonNote(n.id)}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded-md cursor-pointer transition-colors"
                            title="لرې کول"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-stone-200 dark:border-zinc-800/80 text-center rounded-2xl text-stone-400 text-xs">
                    تاسو لا په دې درس پورې هیڅ کوم لوست نوټ تنظیم کړی نلري. له پورته فورم څخه کار اخلئ.
                  </div>
                )}

              </div>
            )}

          </div>

        </motion.div>
      </motion.div>

      {/* COMPANION ON-FLY IMAGE EXCERPT CREATOR POPUP MODAL */}
      <AnimatePresence>
        {showQuoteCreator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              className="w-full max-w-md bg-stone-50 dark:bg-zinc-950 rounded-2xl border border-stone-200 dark:border-zinc-900 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Creator title bar */}
              <div className="px-4 py-3 bg-white dark:bg-[#18181b] border-b border-stone-200/50 dark:border-zinc-800 flex items-center justify-between flex-row-reverse">
                <button
                  onClick={() => setShowQuoteCreator(false)}
                  className="p-1 hover:bg-stone-50 text-stone-500 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-right">
                  <span className="text-[10px] font-black text-rose-500 block">د وینا الهامي کارت جوړوونکی</span>
                  <span className="text-[11px] font-bold text-stone-700 dark:text-zinc-300">مطلب د عکس په کالب خلاص کړئ</span>
                </div>
              </div>

              {/* Theme palette selector */}
              <div className="p-4 border-b border-stone-150 dark:border-zinc-900 flex justify-center gap-1.5 overflow-x-auto">
                {[
                  { name: 'sunset', label: 'لمر خاته', code: 'gradient-sunset' },
                  { name: 'emerald', label: 'کوچنی زمرد', code: 'gradient-emerald' },
                  { name: 'space', label: 'کهکشان', code: 'gradient-space' },
                  { name: 'slate', label: 'خړ تور', code: 'slate-dark' },
                  { name: 'sand', label: 'شګی پاڼه', code: 'sand-light' }
                ].map((bgOption) => (
                  <button
                    key={bgOption.name}
                    onClick={() => setQuoteCardBg(bgOption.code)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                      quoteCardBg === bgOption.code
                        ? 'bg-rose-500 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {bgOption.label}
                  </button>
                ))}
              </div>

              {/* CARD PREVIEW AREA DESIGN */}
              <div className="p-6 flex items-center justify-center bg-stone-100 dark:bg-zinc-900/40">
                <div 
                  id="quote-sharing-canvas-element"
                  className={`p-6 rounded-2xl shadow-xl w-full text-right flex flex-col justify-between min-h-[180px] bg-gradient-to-br ${getQuoteGradientClass(quoteCardBg)}`}
                >
                  <div className="text-2xl font-serif leading-none h-4 opacity-50 block text-right">«</div>
                  <p className="text-xs md:text-sm font-semibold leading-relaxed px-2 my-2 py-1 select-all">
                    {selectedQuoteText}
                  </p>
                  <div className="text-2xl font-serif leading-none h-4 opacity-50 block text-left">»</div>

                  <div className="border-t border-white/20 dark:border-zinc-800/40 pt-2 flex items-center justify-between flex-row-reverse text-[9px] opacity-90 mt-2">
                    <span className="font-bold">د ويناوالۍ هنر افلاین الهام</span>
                    <span className="font-mono">{lesson.title}</span>
                  </div>
                </div>
              </div>

              {/* Copy actions inside share visualizer info */}
              <div className="p-4 bg-white dark:bg-[#18181b] border-t border-stone-200/50 dark:border-zinc-800 flex justify-between gap-2">
                <button
                  onClick={() => setShowQuoteCreator(false)}
                  className="px-4 py-2 hover:bg-stone-50 text-stone-500 dark:text-zinc-400 rounded-xl text-xs font-bold transition-all border border-stone-200 dark:border-zinc-800 flex-1 cursor-pointer"
                >
                  بندول
                </button>
                <button
                  onClick={() => handleCopyQuoteToClipboard(selectedQuoteText)}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-1 cursor-pointer shadow-xs"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-4 h-4" />
                      کاپي شو!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      متن کاپي کول
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL FOR SMART SELECTION INTERACTION (51, 52, 54, 55) */}
      <AnimatePresence>
        {showSentencePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-2xl p-5 text-right relative select-none"
            >
              <button
                onClick={() => setShowSentencePopup(false)}
                className="absolute top-4 left-4 p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-stone-500 rounded-full transition-colors cursor-pointer"
                title="تړل"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <span className="text-[9px] bg-rose-500/10 text-rose-550 px-2.5 py-0.5 rounded-md font-black">
                هوښیار انتخاب - Smart Selection
              </span>

              <div className="mt-4 p-4 bg-stone-50 dark:bg-zinc-900/60 border border-stone-150 dark:border-zinc-850 rounded-2xl italic text-stone-700 dark:text-zinc-250 text-xs leading-relaxed font-semibold">
                " {selectedSentenceText} "
              </div>

              {/* Advanced sentence adjustment controls */}
              <div className="mt-5 space-y-4">
                
                {/* 1. Saved sentences toggle */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveSentenceOnly}
                    className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black hover:bg-rose-600 transition-colors cursor-pointer flex items-center gap-1.5 justify-center flex-row-reverse shadow-xs"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-white" />
                    <span>خوښه شوې جملو کې ثبتول</span>
                  </button>

                  <button
                    onClick={handleClipboardCopyWithHistory}
                    className="py-2.5 px-3 bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-850 dark:text-stone-100 rounded-xl text-[10px] font-black transition-colors cursor-pointer flex items-center gap-1 justify-center flex-row-reverse shrink-0 border border-stone-200 dark:border-zinc-800"
                    title="کاپي کول او تاریخچه"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>کاپي کړه</span>
                  </button>
                </div>

                {/* 2. Custom Underline features (54) */}
                <div className="border-t border-stone-100 dark:border-zinc-900/40 pt-3">
                  <span className="text-[10px] text-stone-400 font-extrabold block mb-2">د متن لاندې د کرښې رنګ (Underline Styles):</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      onClick={() => handleApplyUnderlineAndMarker('', undefined)}
                      className="py-1.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-lg text-[9px] font-black cursor-pointer text-stone-500"
                    >
                      بې رنګه
                    </button>
                    {[
                      { id: 'red', label: 'سور کرښه', bg: 'border-b-2 border-rose-500 text-rose-500' },
                      { id: 'yellow', label: 'زیړ کرښه', bg: 'border-b-2 border-amber-400 text-amber-500' },
                      { id: 'green', label: 'شین کرښه', bg: 'border-b-2 border-emerald-500 text-emerald-500' },
                      { id: 'blue', label: 'آبي کرښه', bg: 'border-b-2 border-cyan-500 text-cyan-500' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleApplyUnderlineAndMarker(col.id, undefined)}
                        className={`py-1 rounded-lg text-[9px] border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-900 cursor-pointer font-bold ${col.bg}`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Custom Marker label placement (55) */}
                <div className="border-t border-stone-100 dark:border-zinc-900/40 pt-3">
                  <span className="text-[10px] text-stone-400 font-extrabold block mb-2">ځانګړی کټګوري نښان (Custom Markers Indicator):</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      onClick={() => handleApplyUnderlineAndMarker(undefined, '')}
                      className="py-1.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-805 rounded-lg text-[9px] font-black cursor-pointer text-stone-500"
                    >
                      بې نښانه
                    </button>
                    {[
                      { id: 'key', label: '🔑 مهم' },
                      { id: 'attention', label: '⚠️ پام' },
                      { id: 'idea', label: '💡 فکر' },
                      { id: 'star', label: '⭐ ممتاز' },
                    ].map((mark) => (
                      <button
                        key={mark.id}
                        onClick={() => handleApplyUnderlineAndMarker(undefined, mark.id)}
                        className="py-1 bg-stone-50 dark:bg-zinc-90 w text-neutral-800 dark:text-neutral-200 border border-stone-200 dark:border-zinc-805 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-850 text-[9px] font-bold cursor-pointer"
                      >
                        {mark.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifier for reader */}
      <AnimatePresence>
        {toastNotify && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 z-55 max-w-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-xl border border-stone-800/40 dark:border-stone-100 flex items-center justify-end flex-row-reverse text-right"
          >
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[10px] font-black ml-2">{toastNotify}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </AnimatePresence>
  );
};
