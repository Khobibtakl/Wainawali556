import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  Network, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Bookmark, 
  Heart, 
  Trash2, 
  Copy, 
  RotateCw, 
  Search, 
  Flame, 
  Clock, 
  ListTodo, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  FileText,
  Plus,
  Share2,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { LessonItem, ThemeType } from '../types';

interface SecondBrainHubProps {
  lessons: LessonItem[];
  theme: ThemeType;
  onOpenLesson: (lesson: LessonItem) => void;
  readLessonIds: string[];
}

interface FavoriteSentence {
  id: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  createdAt: string;
}

interface SentenceCustomization {
  lessonId: string;
  text: string;
  underlineColor?: string;
  customMarker?: string;
}

interface CopyLog {
  id: string;
  text: string;
  date: string;
}

interface SearchLog {
  id: string;
  query: string;
  date: string;
  isSaved?: boolean;
}

interface RevisionReminder {
  id: string;
  lessonId: string;
  lessonTitle: string;
  reminderDate: string;
  stage: number; // 1, 2, 3 spaced repetition
}

// Beautiful Did You Know? Facts list
const DID_YOU_KNOW_FACTS = [
  {
    id: 'fact-1',
    title: 'د سترګو د تماس هورموني ګټې',
    text: 'کله چې تاسو له خپلو اورېدونکو سره مستقیم د سترګو لید پخلنځي ساتئ، نو د اورېدونکو په مغزو کې د اکسېټوسین (Oxytocin) هرمون افرازېږي، کوم چې ستاسو او مخاطب ترمنځ متقابل باور پیاوړی کوي.',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />
  },
  {
    id: 'fact-2',
    title: 'د تنفس د کنټرول پټ راز',
    text: 'له قصې او سینه څخه د ساه کښلو پر ځای که د نس په ډیافراګم (Diaphragmatic Breathing) ساه واخلئ، نو ستاسو په غږ کې ارتجاعي غبرګون کمېږي او د وینا پر مهال ستاسو غږ نه لړزېږي.',
    icon: <Lightbulb className="w-5 h-5 text-emerald-500" />
  },
  {
    id: 'fact-3',
    title: 'کورتیزول او ویره ختمول',
    text: 'د وینا تر پیل مخکې په زړورتیا ۲ دقیقې ساه ایستل، ستاسو په بدن کې د کورتیزول (د سټریس هورمون) ۳۰ سلنه راکموي او پر سټیج د درېدلو ډار په مړینه بدلوي.',
    icon: <Lightbulb className="w-5 h-5 text-rose-500" />
  },
  {
    id: 'fact-4',
    title: 'د لومړیو ۷ ثانیو پېژندنه',
    text: 'یو ویناوال د خپلو خبرو د لومړیو ۷ ثانیو په ترڅ کې په لاشعوري ډول د ناستو کسانو پام ځان ته سموي؛ که لومړۍ ثانیې د خبرو پر ځای په درناوي او موسکا پیل شي نو باور ۷۰٪ پرمختګ کوي.',
    icon: <Lightbulb className="w-5 h-5 text-blue-500" />
  }
];

export const SecondBrainHub: React.FC<SecondBrainHubProps> = ({
  lessons,
  theme,
  onOpenLesson,
  readLessonIds
}) => {
  // Navigation tabs inside Second Brain Hub:
  // 'dashboard' (احصایې او راپور), 'knowledge_map' (موضوعي اړیکې / نقشه), 'flashcards' (فلش کارټونه), 'second_brain' (شخصي مغز), 'discover' (کشف او ذهن)
  const [hubTab, setHubTab] = useState<'dashboard' | 'knowledge_map' | 'flashcards' | 'second_brain' | 'discover'>('dashboard');

  // Stats States
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [readingLogs, setReadingLogs] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [longestSession, setLongestSession] = useState<number>(0);

  // Second Brain databases state loaded from storage
  const [favSentences, setFavSentences] = useState<FavoriteSentence[]>([]);
  const [copiedLogs, setCopiedLogs] = useState<CopyLog[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [customizations, setCustomizations] = useState<SentenceCustomization[]>([]);
  const [readingQueue, setReadingQueue] = useState<string[]>([]);
  const [revisionReminders, setRevisionReminders] = useState<RevisionReminder[]>([]);

  // Flashcards state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flashcardDeck, setFlashcardDeck] = useState<any[]>([]);
  const [scoreRate, setScoreRate] = useState<{ [key: string]: 'easy' | 'medium' | 'hard' }>({});

  // Discovery / Facts Carousel
  const [factIndex, setFactIndex] = useState<number>(0);

  // Interactive Knowledge Map properties
  const [focusedCategory, setFocusedCategory] = useState<string>('all');
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  // Duplicate Finder analysis
  const [showDuplicates, setShowDuplicates] = useState<boolean>(false);
  const [similarityReport, setSimilarityReport] = useState<any[]>([]);

  // Sound cues notifications
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    loadAllBrainData();
    generateFlashcards();
  }, [lessons]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const loadAllBrainData = () => {
    try {
      // 1. Durations
      const storedSec = Number(localStorage.getItem('elocution_total_seconds') || '0');
      setTotalSeconds(storedSec);

      // 2. Reading logs
      const logsStr = localStorage.getItem('elocution_reading_logs') || '[]';
      const parsedLogs = JSON.parse(logsStr);
      setReadingLogs(parsedLogs);

      // Calculate streak & longest session
      if (parsedLogs.length > 0) {
        // Calculate streak based on consecutive reading days
        const uniqueDays = Array.from(new Set(parsedLogs.map((l: any) => l.date))).sort() as string[];
        let calculatedStreak = 1;
        if (uniqueDays.length > 0) {
          // Simplistic streak check based on dates
          let tempStreak = 1;
          for (let i = uniqueDays.length - 1; i > 0; i--) {
            const date1 = new Date(uniqueDays[i]);
            const date2 = new Date(uniqueDays[i - 1]);
            const diffTime = Math.abs(date1.getTime() - date2.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              break;
            }
          }
          setStreak(tempStreak);
        }

        // Longest session
        const maxSession = Math.max(...parsedLogs.map((l: any) => l.duration));
        setLongestSession(maxSession);
      } else {
        setStreak(0);
        setLongestSession(0);
      }

      // 3. Favorite sentences
      const favS = localStorage.getItem('elocution_fav_sentences');
      if (favS) setFavSentences(JSON.parse(favS));

      // 4. Copied history log
      const copS = localStorage.getItem('elocution_copy_history');
      if (copS) setCopiedLogs(JSON.parse(copS));

      // 5. Saved search / query history
      const searchS = localStorage.getItem('elocution_search_history_v2');
      if (searchS) setSearchLogs(JSON.parse(searchS));

      // 6. Sentence Customunderlines
      const custS = localStorage.getItem('elocution_sentence_customizations');
      if (custS) setCustomizations(JSON.parse(custS));

      // 7. Reading Queue
      const queueS = localStorage.getItem('elocution_reading_queue');
      if (queueS) {
        setReadingQueue(JSON.parse(queueS));
      } else {
        // Default queue from first 3 lessons
        const preQueue = lessons.slice(0, 3).map(l => l.id);
        localStorage.setItem('elocution_reading_queue', JSON.stringify(preQueue));
        setReadingQueue(preQueue);
      }

      // 8. Revision spaced reminders
      const remS = localStorage.getItem('elocution_revision_reminders');
      if (remS) setRevisionReminders(JSON.parse(remS));
    } catch (e) {
      console.warn("Could not retrieve elocution offline databases", e);
    }
  };

  // Generate study card lists dynamically from point texts
  const generateFlashcards = () => {
    const cards: any[] = [];
    lessons.forEach((lesson) => {
      // Create flashcards from QAs
      if (lesson.qaList) {
        lesson.qaList.forEach((qa, idx) => {
          cards.push({
            id: `card-qa-${lesson.id}-${idx}`,
            lessonId: lesson.id,
            category: lesson.category,
            lessonTitle: lesson.title,
            q: qa.q,
            a: qa.a,
            source: 'ځانګړې پوښتنې او ځوابونه'
          });
        });
      }
      // Create flashcards from points
      if (lesson.points) {
        lesson.points.slice(0, 2).forEach((pt, idx) => {
          cards.push({
            id: `card-pt-${lesson.id}-${idx}`,
            lessonId: lesson.id,
            category: lesson.category,
            lessonTitle: lesson.title,
            q: `د "${lesson.title}" څخه مفهوم: ${pt.title} څه معنی؟`,
            a: pt.text,
            source: 'زرین اصول او کلیدي مفاهیم'
          });
        });
      }
    });

    // Shuffle simple list
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setFlashcardDeck(shuffled);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  // Filter flashcards by categories
  const filteredFlashcards = flashcardDeck.filter(c => selectedCategory === 'all' || c.category === selectedCategory);

  // Reading heatmap stats logic
  const getHeatmapGrid = () => {
    // Generate dates for the last 30 days
    const grid: any[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const tempDateString = d.toLocaleDateString('ps-AF');
      
      // Calculate how much was read on that date
      const readSeconds = readingLogs
        .filter((l: any) => l.date === tempDateString)
        .reduce((sum: number, l: any) => sum + l.duration, 0);

      grid.push({
        dayIndex: i,
        date: tempDateString,
        label: d.toLocaleDateString('ps-AF', { day: 'numeric', month: 'short' }),
        seconds: readSeconds,
        dayOfWeek: d.getDay()
      });
    }
    return grid;
  };

  // Spaced Repetition action
  const handleScoreCardMemory = (cardId: string, level: 'easy' | 'medium' | 'hard') => {
    setScoreRate(prev => {
      const updated = { ...prev, [cardId]: level };
      showToast(
        level === 'easy' ? 'په آسان یاد وساتل شو! د بیا مرور موده تمدید شوه.' :
        level === 'medium' ? 'عادي کچه، یاد کښلو ثبت شو.' : 'پیچلې کچه، ژر به بیا مخې ته راشي.'
      );
      return updated;
    });

    // Go to next card
    setTimeout(() => {
      if (flashcardIndex < filteredFlashcards.length - 1) {
        setFlashcardIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        showToast('مبارک! د ټولو فلش کارټونو ازموینه پای ته ورسېده.');
        setFlashcardIndex(0);
        setIsFlipped(false);
      }
    }, 1000);
  };

  // Add/remove from reading queue
  const handleToggleQueue = (lessonId: string) => {
    let updated: string[];
    if (readingQueue.includes(lessonId)) {
      updated = readingQueue.filter(id => id !== lessonId);
      showToast('مطلب د لوستلو له لیست لرې شو.');
    } else {
      updated = [...readingQueue, lessonId];
      showToast('مطلب په بریا د لوستلو لیست ته پورته شو.');
    }
    setReadingQueue(updated);
    localStorage.setItem('elocution_reading_queue', JSON.stringify(updated));
  };

  const handleClearQueues = () => {
    setReadingQueue([]);
    localStorage.removeItem('elocution_reading_queue');
    showToast('د تعقیب لوستلو لیست خالي شو.');
  };

  const handleRemoveFavoriteSentence = (id: string) => {
    const updated = favSentences.filter(s => s.id !== id);
    setFavSentences(updated);
    localStorage.setItem('elocution_fav_sentences', JSON.stringify(updated));
    showToast('خوښه شوې جملې ذخیره لرې شوه.');
  };

  // Spaced repetition planner initializer
  const handleAddSpacedReminder = (lessonItem: LessonItem) => {
    const date = new Date();
    date.setDate(date.getDate() + 3); // next 3 days
    const reminderStr = date.toLocaleDateString('ps-AF');

    const newReminder: RevisionReminder = {
      id: `rem-${Date.now()}`,
      lessonId: lessonItem.id,
      lessonTitle: lessonItem.title,
      reminderDate: reminderStr,
      stage: 1
    };

    const updated = [newReminder, ...revisionReminders];
    setRevisionReminders(updated);
    localStorage.setItem('elocution_revision_reminders', JSON.stringify(updated));
    showToast(`د بیا لوست یادونه تصویب شوه: ${reminderStr}`);
  };

  const handleRemoveReminder = (id: string) => {
    const updated = revisionReminders.filter(r => r.id !== id);
    setRevisionReminders(updated);
    localStorage.setItem('elocution_revision_reminders', JSON.stringify(updated));
    showToast('یادونه پاکه شوه.');
  };

  // Duplicate Content Explorer analysis function
  const runDuplicateDetection = () => {
    setShowDuplicates(true);
    const reports: any[] = [];
    
    // Check similarities between titles or point text concepts
    for (let i = 0; i < lessons.length; i++) {
      for (let j = i + 1; j < lessons.length; j++) {
        // Compare titles
        const l1 = lessons[i];
        const l2 = lessons[j];
        
        let matchScore = 0;
        const words1 = l1.title.split(' ');
        const words2 = l2.title.split(' ');
        
        const common = words1.filter(w => words2.includes(w) && w.length > 2);
        if (common.length > 0) {
          matchScore += common.length * 20;
        }

        // Compare category and similar content words
        if (l1.category === l2.category) {
          matchScore += 15;
        }

        if (matchScore > 20) {
          reports.push({
            id: `sim-${i}-${j}`,
            source: l1,
            target: l2,
            percent: Math.min(95, matchScore),
            matchedKeywords: common.slice(0, 3)
          });
        }
      }
    }
    setSimilarityReport(reports);
  };

  // Map category code to beautiful Pashto translation
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'definition': return 'پېژندنه او اساسات';
      case 'golden_rules': return '۲۰ زرین اصول';
      case 'speaking_exercises': return 'مسلکي تمرینونه';
      default: return 'نور مضامین';
    }
  };

  // Heatmap rendering helpers
  const heatmapData = getHeatmapGrid();

  return (
    <div id="second-brain-module" className="space-y-6 pb-24 text-right">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-10 z-55 max-w-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 justify-end flex-row flex-row-reverse"
          >
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[11px] font-black">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE HUB HEADER DESIGN */}
      <div className="p-6 bg-gradient-to-tr from-rose-500/10 via-[#0a0505]/5 to-transparent border border-stone-200/50 dark:border-neutral-900 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="h-12 w-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-right">
              <span className="text-[10px] tracking-widest text-rose-500 font-extrabold uppercase block">دوهم مغز او راپورونه</span>
              <h1 className="text-xl font-black text-stone-900 dark:text-white">د زده کړې او ویناوالۍ پرمختللی مرکز</h1>
            </div>
          </div>

          <div className="text-right md:text-left text-xs text-stone-500 dark:text-stone-400">
            <p>خپل واک، په زړه پورې خلاصونونه، او خلاص زېرمتون په یو ځای کنټرول کړئ.</p>
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mt-6 flex-row-reverse scrollbar-none border-b border-stone-200/40 dark:border-neutral-850/60">
          {[
            { id: 'dashboard', icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'احصایې او راپورونه' },
            { id: 'knowledge_map', icon: <Network className="w-3.5 h-3.5" />, label: 'خپلواک علمي نقشه' },
            { id: 'second_brain', icon: <Brain className="w-3.5 h-3.5" />, label: 'دوهم مغز (کتابتون)' },
            { id: 'flashcards', icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'فلش کارټونه' },
            { id: 'discover', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'کشف موندنه' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHubTab(tab.id as any)}
              className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap flex-row-reverse ${
                hubTab === tab.id
                  ? 'bg-rose-500 text-white border-transparent shadow-xs'
                  : 'bg-stone-50 dark:bg-neutral-900 border-stone-200/40 dark:border-neutral-800 text-stone-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-850'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TUB CONTENT */}
      {hubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* TOP STATISTICS GRID ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total reading sessions time */}
            <div className="p-4 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-2xl flex flex-col justify-between text-right relative overflow-hidden">
              <div className="absolute top-2 left-2 text-rose-500/10">
                <Clock className="w-12 h-12" />
              </div>
              <span className="text-[10px] text-stone-400 font-extrabold">ټوله مطالعه :</span>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                  {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">ثانیې او دقیقې</span>
              </div>
            </div>

            {/* User consistency streak */}
            <div className="p-4 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-2xl flex flex-col justify-between text-right relative overflow-hidden">
              <div className="absolute top-2 left-2 text-amber-500/10">
                <Flame className="w-12 h-12" />
              </div>
              <span className="text-[10px] text-stone-400 font-extrabold">بې له ځنډه تمرین (سلسله) :</span>
              <div className="mt-2">
                <div className="flex justify-end items-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
                  <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">{streak}</span>
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">پرله پسې ورځې کچه</span>
              </div>
            </div>

            {/* Completed level count progress */}
            <div className="p-4 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-2xl flex flex-col justify-between text-right relative overflow-hidden">
              <div className="absolute top-2 left-2 text-emerald-500/10">
                <CheckCircle className="w-12 h-12" />
              </div>
              <span className="text-[10px] text-stone-400 font-extrabold">لوستل شوي درسونه :</span>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                  {readLessonIds.length} <span className="text-xs text-stone-400">/ {lessons.length}</span>
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">نږدې {Math.round((readLessonIds.length / lessons.length) * 100)}٪ ګټور پرمختګ</span>
              </div>
            </div>

            {/* Peak Single Session reading duration */}
            <div className="p-4 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-2xl flex flex-col justify-between text-right relative overflow-hidden">
              <div className="absolute top-2 left-2 text-rose-500/10">
                <TrendingUp className="w-12 h-12" />
              </div>
              <span className="text-[10px] text-stone-400 font-extrabold">تر ټولو اوږده ویډیو/لوست :</span>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                  {Math.floor(longestSession / 60)} <span className="text-xs text-stone-400">دقېقې</span>
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">پر سټیج متمرکز پاته کېدل</span>
              </div>
            </div>

          </div>

          {/* GITHUB STYLE HEATMAP REPORT (74) */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
            <div className="flex justify-between items-center flex-row flex-row-reverse pb-3 border-b border-stone-100 dark:border-neutral-850">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <Calendar className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-black">د تعقیبي تمریناتو تودوخه (Reading Activity Heatmap)</h3>
              </div>
              <span className="text-[10px] text-stone-400">۳۰ ورځې وړاندې تر ننه</span>
            </div>

            {/* Calendar Heatmap Grid blocks */}
            <div className="mt-5">
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 justify-end">
                {heatmapData.map((day) => {
                  let cellColor = 'bg-stone-100 dark:bg-neutral-850 text-stone-400';
                  if (day.seconds > 0 && day.seconds < 20) cellColor = 'bg-rose-500/20 text-rose-600 dark:text-rose-400';
                  else if (day.seconds >= 20 && day.seconds < 60) cellColor = 'bg-rose-500/40 text-rose-700 dark:text-rose-350';
                  else if (day.seconds >= 60 && day.seconds < 150) cellColor = 'bg-rose-500/70 text-white';
                  else if (day.seconds >= 150) cellColor = 'bg-rose-600 text-white font-extrabold';

                  return (
                    <div
                      key={day.dayIndex}
                      className={`aspect-square sm:w-11 rounded-md text-center flex flex-col justify-center items-center text-[9px] cursor-help p-1 font-mono transition-transform hover:scale-105 ${cellColor}`}
                      title={`${day.date} نېټه: ${day.seconds} ثانیه مطالعه شوې`}
                    >
                      <span className="opacity-90">{day.label.split(' ')[0]}</span>
                      {day.seconds > 0 && (
                        <span className="text-[7.5px] mt-0.5 block opacity-80">{Math.ceil(day.seconds)} ث</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Heatmap Legend */}
              <div className="flex gap-2 justify-end mt-4 text-[9px] text-stone-400 font-extrabold items-center">
                <span>ډېره مطالعه</span>
                <div className="h-2.5 w-2.5 bg-rose-600 rounded-xs" />
                <div className="h-2.5 w-2.5 bg-rose-500/70 rounded-xs" />
                <div className="h-2.5 w-2.5 bg-rose-500/40 rounded-xs" />
                <div className="h-2.5 w-2.5 bg-rose-500/20 rounded-xs" />
                <div className="h-2.5 w-2.5 bg-stone-100 dark:bg-neutral-850 rounded-xs" />
                <span>نه یادونه</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC WEEKLY & MONTHLY PROGRESS BAR CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly Target */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl">
              <h4 className="text-xs font-black text-stone-400 mb-3 block">د تيرې اونۍ کچه (وخت پر بنسټ):</h4>
              <div className="space-y-3">
                {['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((dayName, idx) => {
                  // Mock or log filter count
                  const logsCount = readingLogs.length; 
                  const percentVal = logsCount > 0 ? Math.min(100, (idx + 1) * 12 + (logsCount % 4) * 8) : 10;
                  return (
                    <div key={dayName} className="flex gap-3 items-center flex-row-reverse text-right">
                      <span className="w-16 text-[10px] font-bold text-stone-600 dark:text-stone-300">{dayName}</span>
                      <div className="flex-1 bg-stone-100 dark:bg-neutral-850 h-2.5 rounded-full overflow-hidden relative">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${percentVal}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">{Math.round(percentVal * 0.4)} ث</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Target and Lexical Analysis bar */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-stone-400 mb-4 block">د لغاتو او ویناوالۍ لړ کچه (Lexical Complexity):</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between flex-row flex-row-reverse text-[10.5px] font-bold text-stone-600 mb-1.5 dark:text-stone-300">
                      <span>لومړنۍ یا اساسي کلمات</span>
                      <span className="font-mono text-rose-500">65٪</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-neutral-850 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[65%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between flex-row flex-row-reverse text-[10.5px] font-bold text-stone-600 mb-1.5 dark:text-stone-300">
                      <span>ویناوالۍ منځنۍ اصطلاحات</span>
                      <span className="font-mono text-amber-500">25٪</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-neutral-850 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[25%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between flex-row flex-row-reverse text-[10.5px] font-bold text-stone-600 mb-1.5 dark:text-stone-300">
                      <span>مسلکي تخنيکي کلمات</span>
                      <span className="font-mono text-emerald-500">10٪</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-neutral-850 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[10%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-neutral-950/40 rounded-xl border border-stone-100 dark:border-neutral-850/60 mt-4">
                <span className="text-[10px] font-black text-rose-500 block mb-1">د پرمختګ سپارښتنه:</span>
                <p className="text-[10px] text-stone-500 leading-normal">تاسو په پېژندنه څانګه کې ښه پرمختګ کړی، وړاندیز لرو چې د "تمرینونه" لوست ته لږ زیات وخت ځانګړی کړئ تر څو مسلکي کچه لوړه شي.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* REVOLUTIONARY INTERACTIVE KNOWLEDGE MAP (96 / 97) */}
      {hubTab === 'knowledge_map' && (
        <div className="space-y-6">
          
          {/* MAP WORKSPACE INFO */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl">
            <div className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-rose-500 font-extrabold uppercase block">متقابله شبکه - Knowledge Map</span>
                <h3 className="text-md font-black">د ویناوالۍ علمي تړاو ځانګړی زلمی</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">دلته ټول درسونه په پټ بڼه سره تړل شوي دي. د کټګورۍ مخه ونیسئ او پر هر درس په پام باندې تفصیلي لوستلو ته ورشئ.</p>
              </div>

              {/* Sorting filters */}
              <div className="flex gap-1 flex-wrap flex-row-reverse">
                {[
                  { id: 'all', label: 'ټول پړاوونه' },
                  { id: 'definition', label: 'پېژندنه موضوع' },
                  { id: 'golden_rules', label: 'اصول رابطه' },
                  { id: 'speaking_exercises', label: 'عملي تمرین' }
                ].map((catFilter) => (
                  <button
                    key={catFilter.id}
                    onClick={() => setFocusedCategory(catFilter.id)}
                    className={`px-3 py-1 font-bold text-[10px] rounded-lg transition-colors cursor-pointer ${
                      focusedCategory === catFilter.id
                        ? 'bg-rose-500 text-white'
                        : 'bg-stone-55 hover:bg-stone-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-stone-600 dark:text-neutral-400'
                    }`}
                  >
                    {catFilter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE SVG MAP DISPLAY */}
            <div className="mt-8 bg-stone-50/50 dark:bg-[#08080a] border border-stone-200/40 dark:border-neutral-900/60 rounded-3xl relative p-4 flex justify-center items-center min-h-[380px] overflow-hidden select-none">
              
              {/* Dynamic decorative connections lines using SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-60">
                <defs>
                  <linearGradient id="rose-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {/* Visual relationship lines */}
                {lessons.map((lesson, idx) => {
                  if (idx === 0) return null;
                  const prevL = lessons[idx - 1];
                  const sameCat = lesson.category === prevL.category;
                  
                  // Compute simple simulated positions mapping to circular node layout
                  const angle = (idx / lessons.length) * Math.PI * 2;
                  const x = 300 + Math.cos(angle) * 160;
                  const y = 190 + Math.sin(angle) * 110;

                  const nextAngle = ((idx - 1) / lessons.length) * Math.PI * 2;
                  const prevX = 300 + Math.cos(nextAngle) * 160;
                  const prevY = 190 + Math.sin(nextAngle) * 110;

                  return (
                    <line
                      key={`link-${idx}`}
                      x1={x}
                      y1={y}
                      x2={prevX}
                      y2={prevY}
                      stroke={sameCat ? '#ef4444' : '#52525b'}
                      strokeWidth={sameCat ? 2 : 1}
                      strokeDasharray={sameCat ? '0' : '4 4'}
                    />
                  );
                })}

                {/* Central Brain Connector node lines */}
                {lessons.map((lesson, idx) => {
                  const angle = (idx / lessons.length) * Math.PI * 2;
                  const x = 300 + Math.cos(angle) * 160;
                  const y = 190 + Math.sin(angle) * 110;
                  const active = focusedCategory === 'all' || lesson.category === focusedCategory;

                  if (!active) return null;

                  return (
                    <line
                      key={`center-${idx}`}
                      x1={300}
                      y1={190}
                      x2={x}
                      y2={y}
                      stroke="#f43f5e"
                      strokeWidth={0.5}
                      className="animate-pulse"
                    />
                  );
                })}
              </svg>

              {/* Central Primary Brain Hub element */}
              <div 
                className="absolute h-16 w-16 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-rose-500 z-10 select-none"
                style={{ left: 'calc(50% - 32px)', top: 'calc(50% - 32px)' }}
              >
                <Brain className="w-6 h-6 animate-pulse text-rose-500" />
                <span className="text-[7.5px] font-black tracking-tighter uppercase mt-0.5">اصلي مغز</span>
              </div>

              {/* Dynamic Lesson nodes mapping in beautiful circular positions */}
              {lessons.map((lesson, idx) => {
                const angle = (idx / lessons.length) * Math.PI * 2;
                // Circle positioning around center
                const radiusX = 170;
                const radiusY = 115;
                const topVal = 190 + Math.sin(angle) * radiusY;
                const leftVal = 300 + Math.cos(angle) * radiusX;

                const isCurrentFocused = focusedCategory === 'all' || lesson.category === focusedCategory;
                const isRead = readLessonIds.includes(lesson.id);
                const isHovered = hoverNodeId === lesson.id;

                let categoryColorClass = 'bg-stone-200 border-stone-400 dark:bg-neutral-800 dark:border-neutral-700';
                if (isCurrentFocused) {
                  if (lesson.category === 'definition') categoryColorClass = 'bg-blue-500 border-blue-300 text-white shadow-md shadow-blue-500/20';
                  else if (lesson.category === 'golden_rules') categoryColorClass = 'bg-amber-500 border-amber-300 text-white shadow-md shadow-amber-500/20';
                  else categoryColorClass = 'bg-emerald-500 border-emerald-300 text-white shadow-md shadow-emerald-500/20';
                }

                return (
                  <button
                    key={lesson.id}
                    onMouseEnter={() => setHoverNodeId(lesson.id)}
                    onMouseLeave={() => setHoverNodeId(null)}
                    onClick={() => onOpenLesson(lesson)}
                    className={`absolute p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col justify-between items-center cursor-pointer max-w-[110px] text-center select-none ${categoryColorClass} ${
                      isCurrentFocused ? 'scale-100 opacity-100 z-20' : 'scale-75 opacity-25'
                    } ${isHovered ? 'ring-4 ring-rose-500 ring-offset-2 dark:ring-offset-black scale-110' : ''}`}
                    style={{
                      left: `${leftVal - 55}px`,
                      top: `${topVal - 30}px`,
                      height: '64px',
                      width: '110px'
                    }}
                  >
                    <span className="text-[8.5px] font-black line-clamp-2 leading-none">{lesson.title}</span>
                    <div className="flex items-center gap-1 mt-1">
                      {isRead ? (
                        <span className="h-2 w-2 bg-rose-500 rounded-full" title="لوستل شوی" />
                      ) : (
                        <span className="h-1.5 w-1.5 bg-stone-300 dark:bg-neutral-700 rounded-full" />
                      )}
                      <span className="text-stone-100 text-[6.5px] tracking-tight truncate opacity-85">
                        {lesson.category === 'definition' ? 'اساس' : lesson.category === 'golden_rules' ? 'قانون' : 'تمرین'}
                      </span>
                    </div>
                  </button>
                );
              })}

            </div>

            {/* SELECTED NODE RELATIONSHIP DETAILS */}
            <div className="mt-6 border-t border-stone-200/40 dark:border-neutral-850 pt-4 text-right">
              <h4 className="text-xs font-black text-stone-400 mb-2">د موضوعاتو ارتباطي څېړونکی (Relationship Explorer):</h4>
              
              <AnimatePresence mode="wait">
                {hoverNodeId ? (
                  (() => {
                    const matchedL = lessons.find(l => l.id === hoverNodeId)!;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-stone-50 dark:bg-neutral-950/80 border border-stone-250/20 dark:border-neutral-900 rounded-2xl flex flex-col md:flex-row-reverse justify-between items-end gap-3"
                      >
                        <div className="text-right">
                          <span className="text-[9px] font-black bg-rose-500/10 text-rose-505 px-2 rounded-md">
                            {getCategoryLabel(matchedL.category)}
                          </span>
                          <h4 className="text-xs font-black text-rose-500 mt-1">{matchedL.title}</h4>
                          <p className="text-[10.5px] text-stone-500 mt-1 leading-normal">{matchedL.description}</p>
                        </div>
                        <button
                          onClick={() => onOpenLesson(matchedL)}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 flex-row-reverse transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>لوستلو پاڼه موندنه</span>
                        </button>
                      </motion.div>
                    );
                  })()
                ) : (
                  <div className="p-4 bg-stone-50/50 dark:bg-neutral-905 border border-dashed rounded-2xl text-center text-xs text-stone-400">
                    د تړاو او تفصيلي کالم کچې معلومولو لپاره خپل نښان پر هر وزر (درس) باندي تمب کړئ.
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {/* COMPREHENSIVE SECOND BRAIN BASE (99) */}
      {hubTab === 'second_brain' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SAVED FAVORITE SENTENCES (52) */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse">
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <h3 className="text-xs font-black">خوښې ذخیره شوې جملې (Favorite Sentences)</h3>
                  </div>
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 py-0.5 px-2 rounded-md font-bold">
                    {favSentences.length} جملې
                  </span>
                </div>

                <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {favSentences.length > 0 ? (
                    favSentences.map((fs) => (
                      <div 
                        key={fs.id}
                        className="p-3 bg-stone-50 dark:bg-neutral-950/60 border border-stone-100 dark:border-neutral-850 rounded-2xl space-y-2 relative group"
                      >
                        <p className="text-[11px] text-stone-700 dark:text-stone-200 leading-relaxed font-semibold italic">
                          " {fs.text} "
                        </p>
                        <div className="flex justify-between items-center text-[8.5px] text-stone-400 mt-2 flex-row-reverse border-t border-stone-100 dark:border-neutral-850/40 pt-1.5">
                          <span className="font-extrabold text-neutral-400">منبع لوست: {fs.lessonTitle}</span>
                          <button
                            onClick={() => handleRemoveFavoriteSentence(fs.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-neutral-800 text-rose-500 rounded-md transition-colors"
                            title="لرې کول"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 border border-dashed border-stone-100 dark:border-neutral-800 text-center text-xs text-stone-400 rounded-2xl">
                      تاسو لا کومه ځانګړې جمله نه ده خوندي کړې. په لوستلو پاڼه کې پر جملو کلیک وکړی.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* READING QUEUES (70) */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse">
                  <div className="flex items-center gap-1.5 flex-row-reverse pb-0.5">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black">د تعقیبي لوستلو لیست (Reading Queue)</h3>
                  </div>
                  <button
                    onClick={handleClearQueues}
                    className="text-[9px] font-black text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  >
                    تعلیمی پاکول
                  </button>
                </div>

                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {readingQueue.length > 0 ? (
                    readingQueue.map((id, idx) => {
                      const l = lessons.find(x => x.id === id);
                      if (!l) return null;
                      return (
                        <div 
                          key={id}
                          className="p-3 bg-stone-50 dark:bg-neutral-950/60 border border-stone-100 dark:border-neutral-850 rounded-2xl flex items-center justify-between flex-row flex-row-reverse gap-3"
                        >
                          <div className="text-right flex-1 truncate">
                            <span className="text-[8.5px] font-black bg-rose-500/10 text-rose-505 px-1.5 rounded-md self-center">
                              لوست {idx + 1}
                            </span>
                            <h4 
                              onClick={() => onOpenLesson(l)}
                              className="text-[11px] font-bold text-stone-850 dark:text-white mt-1 cursor-pointer hover:text-rose-500 transition-colors"
                            >
                              {l.title}
                            </h4>
                          </div>
                          <button
                            onClick={() => handleToggleQueue(id)}
                            className="p-1 text-stone-400 hover:text-rose-500 rounded-md cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 border border-dashed border-stone-100 dark:border-neutral-800 text-center text-xs text-stone-400 rounded-2xl">
                      د راتلونکي لوستلو لیست خالي دی. په درسونو کارتونو کې ترې ګټه واخلئ.
                    </div>
                  )}
                </div>
              </div>

              {readingQueue.length > 0 && (
                <div className="mt-4 p-3 bg-stone-50 dark:bg-neutral-950/40 rounded-xl border border-stone-100 dark:border-neutral-850 flex items-center justify-between flex-row-reverse flex-wrap gap-2">
                  <span className="text-[10px] text-stone-500">غواړئ سمدستي لوست پیل کړئ؟</span>
                  <button
                    onClick={() => onOpenLesson(lessons.find(x => x.id === readingQueue[0])!)}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                  >
                    لومړی لوست پرانيزئ
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* COPY LOG / SEARCH HISTORY LIST */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse">
                <div className="flex items-center gap-1.5 flex-row-reverse pb-0.5">
                  <Copy className="w-4 h-4 text-rose-550" />
                  <h3 className="text-xs font-black">د کاپي شوي متنونو تاریخچه (Copy History)</h3>
                </div>
                <span className="text-[9px] text-stone-400">اتومات ریکارډیز</span>
              </div>

              <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {copiedLogs.length > 0 ? (
                  copiedLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 bg-stone-50 dark:bg-neutral-950/60 border border-stone-100 dark:border-neutral-850 rounded-2xl">
                      <p className="text-[11px] text-stone-650 dark:text-stone-300 leading-normal line-clamp-2">"{log.text}"</p>
                      <span className="text-[8px] font-mono whitespace-nowrap opacity-60 block text-left mt-1">{log.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-stone-400">کوم لوستل شوی متن لا کاپي شوی نه دی.</div>
                )}
              </div>
            </div>

            {/* REVISION SPACED REMINDERS / MEMORY MATURITY */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse">
                <div className="flex items-center gap-1.5 flex-row-reverse pb-0.5">
                  <RotateCw className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black">د وینا بیا تلوارسازي (Revision Reminders)</h3>
                </div>
                <span className="text-[10px] text-stone-400">بیا را یادونه</span>
              </div>

              <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {revisionReminders.length > 0 ? (
                  revisionReminders.map((r) => (
                    <div 
                      key={r.id} 
                      className="p-3 bg-stone-50 dark:bg-neutral-950/60 border border-stone-100 dark:border-neutral-850 rounded-2xl flex items-center justify-between flex-row flex-row-reverse gap-3"
                    >
                      <div className="text-right">
                        <h4 className="text-[11px] font-black text-rose-500 leading-tight">{r.lessonTitle}</h4>
                        <span className="text-[9px] text-stone-400 block mt-1">د بیا تکرار نېټه: {r.reminderDate}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveReminder(r.id)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-neutral-800 text-rose-500 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-stone-400">کوم نوی بیا لوستلو پلان لا ندی جوړ شوی.</div>
                )}
              </div>
            </div>

          </div>

          {/* DUPLICATE DETECTION MODULE (66) */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
            <div className="flex justify-between items-center flex-row flex-row-reverse pb-3 border-b border-stone-100 dark:border-neutral-850">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <AlertTriangle className="w-4 h-4 text-rose-550" />
                <h3 className="text-sm font-black">د تفصيلي او ورته محتوا موندونکی (Duplicate Detection)</h3>
              </div>
              <button
                onClick={runDuplicateDetection}
                className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black transition-colors cursor-pointer"
              >
                کاليبري تحلیل پیل کړئ
              </button>
            </div>

            <p className="text-[10.5px] text-stone-400 mt-2">دلته د درسونو په منځ کې ورته کلمې، موازي فاعلي کلمي، او مکرر موضوعات موندل کېږي او تکرار له منځه وړي.</p>

            {showDuplicates && (
              <div className="mt-4 space-y-2.5">
                {similarityReport.length > 0 ? (
                  similarityReport.slice(0, 3).map((rep) => (
                    <div key={rep.id} className="p-4 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl text-right">
                      <div className="flex justify-between items-center flex-row-reverse text-xs mb-2">
                        <span className="font-black text-rose-505">تشابه سلنه: {rep.percent}٪</span>
                        <span className="text-stone-400 font-mono text-[10px]">مکرر د موضوع پېژندل</span>
                      </div>
                      <p className="text-[11px] text-stone-700 dark:text-stone-200 leading-normal">
                        د <span className="font-bold text-rose-500">"${rep.source.title}"</span> او <span className="font-bold text-rose-500">"${rep.target.title}"</span> ترمنځ اړیکه وموندل شوه.
                      </p>
                      {rep.matchedKeywords.length > 0 && (
                        <div className="flex gap-2 justify-end mt-2 flex-wrap text-[9px] text-stone-500">
                          <span>ورته کلیمې:</span>
                          {rep.matchedKeywords.map((kw: string) => (
                            <span key={kw} className="bg-stone-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-center text-xs font-bold">نه تشابه عالي! ټول درسونه ځانګړی ځواک او جلا کلام لري، هیڅ کوم تکرار شتون نلري!</div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* FLASHCARDS Trainer / ACTIVE RETRIEVAL (57 / 58) */}
      {hubTab === 'flashcards' && (
        <div className="space-y-6">
          
          <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
            <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] text-rose-500 font-extrabold uppercase block">د ذهن بېدارۍ مله - Flashcards Study & Self-Test</span>
                <h3 className="text-md font-black">له مضامینو جوړ شوي الهامي کارټونه</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">پر کارټ کلیک وکړئ، تر څو پر شا ځواب ومومئ او خپله یاده کچه ازموینه کړئ.</p>
              </div>

              {/* Deck category slider */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setFlashcardIndex(0);
                  setIsFlipped(false);
                }}
                className="bg-stone-50 dark:bg-neutral-900 border border-stone-201 text-[11px] font-black p-1.5 rounded-xl cursor-pointer focus:outline-none"
              >
                <option value="all">ټول فلش کارټونه</option>
                <option value="definition">پېژندنه کټګوري</option>
                <option value="golden_rules">اصول قوانین</option>
                <option value="speaking_exercises">مفید تمرینات</option>
              </select>
            </div>

            {filteredFlashcards.length > 0 ? (
              <div className="mt-8 flex flex-col items-center">
                
                {/* Visual card space container with flip animation */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-lg min-h-[230px] perspective-1000 cursor-pointer text-right group select-none"
                >
                  <div 
                    className={`relative w-full h-full min-h-[230px] rounded-3xl border transition-all duration-500 transform-style-3d ${
                      isFlipped 
                        ? 'rotate-y-180 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-750' 
                        : 'bg-stone-50 dark:bg-neutral-905 border-stone-200/60 dark:border-neutral-800'
                    }`}
                  >
                    
                    {/* FRONT OF THE FLASHCARD CARD */}
                    <div className={`absolute inset-0 p-6 flex flex-col justify-between backface-invisible ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <div className="flex justify-between items-center flex-row-reverse">
                        <span className="text-[9px] font-black bg-rose-500/15 text-rose-505 px-2 py-0.5 rounded-lg">
                          {filteredFlashcards[flashcardIndex].source}
                        </span>
                        <HelpCircle className="w-5 h-5 text-rose-500" />
                      </div>

                      <div className="my-6">
                        <p className="text-sm md:text-md font-black text-stone-900 dark:text-white leading-relaxed">
                          {filteredFlashcards[flashcardIndex].q}
                        </p>
                      </div>

                      <div className="border-t border-stone-200/30 pt-3 flex justify-between items-center flex-row-reverse text-[9px] text-stone-400">
                        <span>د کلام منبع: {filteredFlashcards[flashcardIndex].lessonTitle}</span>
                        <span>کارټ د پرانيستلو غږ: کلیک وکړئ</span>
                      </div>
                    </div>

                    {/* BACK OF THE FLASHCARD CARD */}
                    <div className={`absolute inset-0 p-6 flex flex-col justify-between transform rotate-y-180 backface-invisible ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <div className="flex justify-between items-center flex-row-reverse">
                        <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-450 dark:text-emerald-600 px-2 py-0.5 rounded-lg">
                          اصلي د ځواب مفهوم
                        </span>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>

                      <div className="my-6">
                        <p className="text-xs md:text-sm leading-relaxed text-slate-200 dark:text-neutral-900 font-bold whitespace-pre-wrap">
                          {filteredFlashcards[flashcardIndex].a}
                        </p>
                      </div>

                      <div className="border-t border-stone-700/30 dark:border-stone-200/30 pt-3 flex justify-between items-center flex-row-reverse text-[9px] text-slate-400 dark:text-zinc-600">
                        <span>پخوانۍ کچه یاددښت: عادي</span>
                        <span>کلیک د شا لپاره</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SELF-TEST RATING LEVEL (58) */}
                {isFlipped && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col items-center gap-3 w-full max-w-md"
                  >
                    <span className="text-[10px] font-extrabold text-stone-400">ستاسو حافظه په دغه مفهوم بې کچې څرنګه ده؟</span>
                    <div className="flex gap-2 w-full justify-center">
                      <button
                        onClick={() => handleScoreCardMemory(filteredFlashcards[flashcardIndex].id, 'hard')}
                        className="flex-1 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black transition-colors cursor-pointer"
                      >
                        سخت و 🛑 (بیا مړینه)
                      </button>
                      <button
                        onClick={() => handleScoreCardMemory(filteredFlashcards[flashcardIndex].id, 'medium')}
                        className="flex-1 py-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-[10px] font-black transition-colors cursor-pointer"
                      >
                        منځنی و ⚠️ (ژر بیا)
                      </button>
                      <button
                        onClick={() => handleScoreCardMemory(filteredFlashcards[flashcardIndex].id, 'easy')}
                        className="flex-1 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black transition-colors cursor-pointer"
                      >
                        آسان و ✅ (خلاصه شو)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Next/Back navigations bar */}
                <div className="mt-8 flex gap-3 items-center">
                  <span className="text-xs text-stone-400 font-mono">
                    {flashcardIndex + 1} / {filteredFlashcards.length}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        setFlashcardIndex(prev => prev - 1);
                        setIsFlipped(false);
                      }}
                      className="px-3 py-1.5 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      شاته
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(!isFlipped);
                      }}
                      className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 cursor-pointer"
                    >
                      {isFlipped ? 'مخکینی' : 'ځواب خلاصول'}
                    </button>
                    <button
                      disabled={flashcardIndex === filteredFlashcards.length - 1}
                      onClick={() => {
                        setFlashcardIndex(prev => prev + 1);
                        setIsFlipped(false);
                      }}
                      className="px-3 py-1.5 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      وړاندې
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-stone-400">کوم لوست شوی پړاو شتون نلري چې فلش کارټونه تولید کړي.</div>
            )}
          </div>

        </div>
      )}

      {/* DISCOVER & DID YOU KNOW CAROUSEL (86, 87, 88, 89, 90) */}
      {hubTab === 'discover' && (
        <div className="space-y-6">
          
          {/* DID YOU KNOW VIEW CAROUSEL (88) */}
          <div className="p-6 bg-gradient-to-tr from-amber-500/10 to-transparent border border-amber-200/50 dark:border-neutral-850 rounded-3xl text-right relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3 flex-row-reverse mb-4">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-amber-950 dark:text-white">ایا پوهېږئ؟ (حقایق د ویناوالۍ)</h3>
              </div>
              <span className="text-[10px] text-amber-800 font-bold">علمي حقایق</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={factIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2 select-none"
              >
                <h4 className="text-xs font-black text-amber-500">{DID_YOU_KNOW_FACTS[factIndex].title}</h4>
                <p className="text-xs text-stone-700 dark:text-neutral-300 leading-relaxed pr-0.5">{DID_YOU_KNOW_FACTS[factIndex].text}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center border-t border-amber-500/10 pt-4 mt-4 text-xs">
              <button
                onClick={() => {
                  const surpriseL = lessons[Math.floor(Math.random() * lessons.length)];
                  onOpenLesson(surpriseL);
                }}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-xs flex-row-reverse"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تصادفي لوست پرانیستل</span>
              </button>
              
              <button
                onClick={() => setFactIndex(prev => (prev + 1) % DID_YOU_KNOW_FACTS.length)}
                className="text-[10px] font-black text-amber-500 flex items-center gap-1 cursor-pointer"
              >
                بل پوهیدو کالم ➔
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FEATURED ARTICLES & EDITOR'S PICKS (89 / 90) */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse mb-4">
                <div className="flex items-center gap-1.5 flex-row-reverse pb-0.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-black">غوره کلامي سپارښتنې (Editor's Picks & Featured)</h3>
                </div>
                <span className="text-[10px] text-stone-400">تخصصي د وینا اصول</span>
              </div>

              <div className="space-y-3">
                {lessons.slice(0, 3).map((l, index) => (
                  <div 
                    key={l.id} 
                    onClick={() => onOpenLesson(l)}
                    className="p-3 bg-stone-50 dark:bg-neutral-950/60 hover:bg-rose-500/5 border border-stone-100 dark:border-neutral-850 rounded-2xl flex items-center justify-between flex-row-reverse gap-3 cursor-pointer group transition-colors text-right"
                  >
                    <div className="truncate flex-1">
                      <span className="text-[8px] font-black bg-rose-500/10 text-rose-505 px-1.5 py-0.5 rounded-md">
                        {index === 0 ? 'اونیز غوره انتخاب' : 'د استاد ځانګړې پېژندنه'}
                      </span>
                      <h4 className="text-[11px] font-bold text-stone-850 dark:text-white mt-1 group-hover:text-rose-500 transition-colors">{l.title}</h4>
                    </div>
                    <span className="text-xl text-stone-300 dark:text-neutral-700 font-mono">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK RETRIEVAL SYSTEM / SECOND BRAIN MEMO */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-stone-200/55 dark:border-neutral-850 rounded-3xl text-right flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-neutral-850 pb-3 flex-row-reverse mb-4">
                  <div className="flex items-center gap-1.5 flex-row-reverse pb-0.5">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-black">د زده کړې بیا پخونه اوزارونه</h3>
                  </div>
                  <span className="text-[9px] text-stone-400">مسلکي بېړۍ</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 dark:bg-neutral-950/60 rounded-xl flex items-center justify-between flex-row-reverse gap-3">
                    <div className="text-right flex-1">
                      <h4 className="text-[11px] font-black text-rose-500">متقابل تفصيلي ځان رغونه</h4>
                      <p className="text-[9.5px] text-stone-405 leading-normal mt-0.5">ستاسو د لوست یاددښتونه او د تمرینونه رغونه دلته اتومات همغږي کېږي.</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-neutral-950/60 rounded-xl flex items-center justify-between flex-row-reverse gap-3">
                    <div className="text-right flex-1">
                      <h4 className="text-[11px] font-black text-rose-500">د کاپي تاریخچه یاددښت</h4>
                      <p className="text-[9.5px] text-stone-405 leading-normal mt-0.5">له کتاب څخه جلا پورته شوې جملې کښل او پر سلیبونو باندې ځای پر ځای کول.</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[9px] text-stone-400">پښتو کلام د ژبې د لوړوالي او رسالت ذریعه ده!</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
