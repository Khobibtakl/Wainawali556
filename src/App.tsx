/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  RotateCw, 
  Layers, 
  ListCollapse, 
  TrendingUp,
  Award,
  CircleAlert,
  Grid,
  List,
  PhoneCall,
  User,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

// Capacitor Native Shell API imports
import { App as CapacitorApp } from '@capacitor/app';

// Core Resources & Types
import { LESSONS_DATA, INSPIRATIONAL_QUOTES } from './data';
import { 
  LessonItem, 
  PracticeSession, 
  NoteItem, 
  ThemeType, 
  FontSizeType, 
  LineHeightType, 
  LayoutType 
} from './types';

// Custom Sub-views
import { BottomNav } from './components/BottomNav';
import { LessonCard } from './components/LessonCard';
import { AudioPractice } from './components/AudioPractice';
import { NotesSection } from './components/NotesSection';
import { ProgressSection } from './components/ProgressSection';
import { SettingsSection } from './components/SettingsSection';

// Newly Added Modular Assets
import { SplashView } from './components/SplashView';
import { OnboardingTour } from './components/OnboardingTour';
import { ContactDialog } from './components/ContactDialog';
import { BookSlider } from './components/BookSlider';
import { WrittenQuiz } from './components/WrittenQuiz';
import { DetailedLessonReader } from './components/DetailedLessonReader';

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-default-1',
    title: 'د لومړۍ مبارکې وينا مسوده (مقدمه)',
    content: 'محترمو او ګرانو اورېدونکو، السلام عليکم ورحمة الله وبرکاته!\n\nنن ورځ زما د ژوند تر ټولو خوږه شېبه ده چې ستاسو د پام او درناوي تر غېږې لاندې ولاړ یم. د خبرو مېړانه او د بيان ځواک هغه وسلې دي چې د انسان پر زړه علمي پانګه کري. په هر کار کې د چمتووالي مخه مه نیسئ...\n\n(يادښت: په دغه څپرکي کې خپل غږ لوړ او باډي لنګویج پیاوړې کړئ.)',
    createdAt: new Date().toLocaleDateString('ps-AF')
  },
  {
    id: 'note-default-2',
    title: 'د بدن د اشارو (Body Language) مهم ارکان',
    content: '۱. کله چې سټیج ته ځئ، د چوکۍ پر مخ خپل نظرونه په مساوی ډول ووېشئ.\n۲. د خپلو لیدونکو له لومړۍ لړۍ مه وارخطا کېږئ، سترګې د سترګو مخ ته ونیسئ.\n۳. دواړه لاسونه د قهر پر مهال مه تړئ، بلکې د مخلصې کلمې خوند ورکولو لپاره یې روښانه او ازاد وساتئ.',
    createdAt: new Date().toLocaleDateString('ps-AF')
  }
];

function normalizePashto(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
    .replace(/[يېۍئ]/g, 'ی') // Normalize Yaa types
    .replace(/[کګ]/g, 'ک') // Normalize Kaaf / Gaaf
    .replace(/[ۀہة]/g, 'ه') // Normalize Heh types
    .replace(/[ \-\t\r\n]+/g, ' ')
    .trim();
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');

  // Launch states
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  // Core App states
  const [readLessonIds, setReadLessonIds] = useState<string[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<PracticeSession[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  
  // Advanced Favorites and Bookmarks
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [selectedLessonForReader, setSelectedLessonForReader] = useState<LessonItem | null>(null);

  // Custom interface states - expanded for 10 themes and formatting settings
  const [theme, setTheme] = useState<ThemeType>('light');
  const [fontSize, setFontSize] = useState<FontSizeType>('md');
  const [lineHeight, setLineHeight] = useState<LineHeightType>('normal');
  const [layoutType, setLayoutType] = useState<LayoutType>('list');

  // Search & Filter state on Home page
  const [searchText, setSearchText] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Quote of the Day
  const [currentQuote, setCurrentQuote] = useState(INSPIRATIONAL_QUOTES[0]);

  // Capacitor Physical Back Button Binding Integration
  useEffect(() => {
    let backListener: any = null;

    const setupHardwareBack = async () => {
      try {
        backListener = await CapacitorApp.addListener('backButton', () => {
          // If we have contact dialogue open, close it
          if (isContactOpen) {
            setIsContactOpen(false);
            return;
          }

          // If we are on some secondary tab, navigate to homepage tab
          setActiveTab((current) => {
            if (current !== 'home') {
              return 'home';
            } else {
              // We are already on homepage, let us minimize and park nicely on phone launcher
              CapacitorApp.minimizeApp();
              return 'home';
            }
          });
        });
      } catch (err) {
        // Safe console feedback inside sandboxed iframe preview
        console.log("Hardware back subscription skipped: environment is standard web-browser");
      }
    };

    setupHardwareBack();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [isContactOpen]);

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const storedReadLessons = localStorage.getItem('elocution_read_lessons');
      if (storedReadLessons) setReadLessonIds(JSON.parse(storedReadLessons));

      const storedHistory = localStorage.getItem('elocution_practice_history');
      if (storedHistory) setPracticeHistory(JSON.parse(storedHistory));

      // Load Favorites & Bookmarks
      const storedFavorites = localStorage.getItem('elocution_favorite_lessons');
      if (storedFavorites) setFavoriteLessonIds(JSON.parse(storedFavorites));

      const storedBookmarks = localStorage.getItem('elocution_bookmarked_lessons');
      if (storedBookmarks) setBookmarkedLessonIds(JSON.parse(storedBookmarks));

      // Load Notes or instantiate defaults if empty
      const storedNotes = localStorage.getItem('elocution_notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes(DEFAULT_NOTES);
        localStorage.setItem('elocution_notes', JSON.stringify(DEFAULT_NOTES));
      }

      const storedTheme = localStorage.getItem('elocution_theme') as ThemeType;
      if (storedTheme) setTheme(storedTheme);

      const storedFontSize = localStorage.getItem('elocution_font_size') as FontSizeType;
      if (storedFontSize) setFontSize(storedFontSize);

      const storedLineHeight = localStorage.getItem('elocution_line_height') as LineHeightType;
      if (storedLineHeight) setLineHeight(storedLineHeight);

      const storedLayout = localStorage.getItem('elocution_layout_type') as LayoutType;
      if (storedLayout) setLayoutType(storedLayout);

    } catch (e) {
      console.warn("Could not read stored user data from localStorage", e);
    }

    // Set inspirational quote
    const randomIdx = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    setCurrentQuote(INSPIRATIONAL_QUOTES[randomIdx]);
  }, []);

  // Check onboarding status after splash finishes
  const handleSplashFinish = () => {
    setShowSplash(false);
    const onboardingCompleted = localStorage.getItem('elocution_onboarding_completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  // Sync state helpers
  const updateReadLessons = (newIds: string[]) => {
    setReadLessonIds(newIds);
    localStorage.setItem('elocution_read_lessons', JSON.stringify(newIds));
  };

  const updatePracticeHistory = (newHistory: PracticeSession[]) => {
    setPracticeHistory(newHistory);
    localStorage.setItem('elocution_practice_history', JSON.stringify(newHistory));
  };

  const updateNotes = (newNotes: NoteItem[]) => {
    setNotes(newNotes);
    localStorage.setItem('elocution_notes', JSON.stringify(newNotes));
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteLessonIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('elocution_favorite_lessons', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedLessonIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('elocution_bookmarked_lessons', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (readLessonIds.includes(id)) {
      updateReadLessons(readLessonIds.filter(item => item !== id));
    } else {
      updateReadLessons([...readLessonIds, id]);
    }
  };

  // Add recording or practice timing
  const handleAddPracticeSession = (session: PracticeSession) => {
    const updated = [session, ...practiceHistory];
    updatePracticeHistory(updated);
  };

  const handleDeletePracticeSession = (id: string) => {
    if (window.confirm("ایا غواړئ دغه ثبت شوی لوست له تاریخچې وباسئ؟")) {
      const updated = practiceHistory.filter(item => item.id !== id);
      updatePracticeHistory(updated);
    }
  };

  // Note actions
  const handleAddNote = (title: string, content: string) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title,
      content,
      createdAt: new Date().toLocaleDateString('ps-AF', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    updateNotes([newNote, ...notes]);
  };

  const handleEditNote = (id: string, title: string, content: string) => {
    const updated = notes.map(note => 
      note.id === id 
        ? { ...note, title, content, createdAt: new Date().toLocaleDateString('ps-AF') } 
        : note
    );
    updateNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("ایا غواړئ دغه شخصي یادښت بیخي صفا کړئ؟")) {
      const updated = notes.filter(note => note.id !== id);
      updateNotes(updated);
    }
  };

  // Modern 10 Themes Configuration Engine
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('elocution_theme', newTheme);
  };

  const handleFontSizeChange = (newSize: FontSizeType) => {
    setFontSize(newSize);
    localStorage.setItem('elocution_font_size', newSize);
  };

  const handleLineHeightChange = (newLineHeight: LineHeightType) => {
    setLineHeight(newLineHeight);
    localStorage.setItem('elocution_line_height', newLineHeight);
  };

  const handleLayoutTypeChange = (newLayout: LayoutType) => {
    setLayoutType(newLayout);
    localStorage.setItem('elocution_layout_type', newLayout);
  };

  const rollNewQuote = () => {
    const currentIndex = INSPIRATIONAL_QUOTES.findIndex(q => q.text === currentQuote.text);
    let nextIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    if (nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % INSPIRATIONAL_QUOTES.length;
    }
    setCurrentQuote(INSPIRATIONAL_QUOTES[nextIndex]);
  };

  // Export JSON Backup
  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify({
        readLessons: readLessonIds,
        practiceHistory,
        notes,
        theme,
        fontSize,
        lineHeight,
        layoutType
      }, null, 2);
      
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `د_مسلکي_وينا_راز_بیک_اپ_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("د ډیټا بهر کولو پر مهال تېروتنه رامنځته شوه.");
    }
  };

  // Restore JSON Backup
  const handleRestore = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.readLessons) updateReadLessons(parsed.readLessons);
      if (parsed.practiceHistory) updatePracticeHistory(parsed.practiceHistory);
      if (parsed.notes) updateNotes(parsed.notes);
      if (parsed.theme) handleThemeChange(parsed.theme);
      if (parsed.fontSize) handleFontSizeChange(parsed.fontSize);
      if (parsed.lineHeight) handleLineHeightChange(parsed.lineHeight);
      if (parsed.layoutType) handleLayoutTypeChange(parsed.layoutType);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Filtering lessons based on search text and Category Filter
  const filteredLessons = LESSONS_DATA.filter((lesson) => {
    const norm = normalizePashto(searchText);
    const matchesSearch = !searchText || 
      normalizePashto(lesson.title).includes(norm) ||
      (lesson.description && normalizePashto(lesson.description).includes(norm)) ||
      (lesson.content && normalizePashto(lesson.content).includes(norm)) ||
      (lesson.points && lesson.points.some(p => normalizePashto(p.title).includes(norm) || normalizePashto(p.text).includes(norm)));
      
    let matchesCategory = false;
    if (activeCategoryFilter === 'all') {
      matchesCategory = true;
    } else if (activeCategoryFilter === 'favorite') {
      matchesCategory = favoriteLessonIds.includes(lesson.id);
    } else if (activeCategoryFilter === 'bookmark') {
      matchesCategory = bookmarkedLessonIds.includes(lesson.id);
    } else {
      matchesCategory = lesson.category === activeCategoryFilter;
    }
    return matchesSearch && matchesCategory;
  });

  const getSearchSuggestions = () => {
    if (!searchText.trim()) return [];
    const norm = normalizePashto(searchText);
    const suggestions: string[] = [];
    
    if ('تمرینونه'.includes(norm) || 'تمرین'.includes(norm)) suggestions.push('تمرینونه');
    if ('اصول'.includes(norm) || 'زرین'.includes(norm)) suggestions.push('۲۰ طلایي اصول');
    if ('جرأت'.includes(norm) || 'جرات'.includes(norm) || 'روان'.includes(norm)) suggestions.push('جرأت');
    if ('تعریف'.includes(norm) || 'معلومات'.includes(norm)) suggestions.push('پېژندنه');
    if ('ساه'.includes(norm) || 'تنفس'.includes(norm)) suggestions.push('ساه اخېستل');
    
    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggest: string) => {
    if (suggest === 'تمرینونه') setSearchText('تمرین');
    else if (suggest === '۲۰ طلایي اصول') setSearchText('اصول');
    else if (suggest === 'جرأت') setSearchText('جرأت');
    else if (suggest === 'پېژندنه') setSearchText('تعریف');
    else if (suggest === 'ساه اخېستل') setSearchText('ساه');
  };

  const handleMarkAllRead = () => {
    const allIds = LESSONS_DATA.map(l => l.id);
    updateReadLessons(allIds);
  };

  const handleMarkAllUnread = () => {
    updateReadLessons([]);
  };

  // Translation of font sizes to smaller custom ratios
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-[11px] md:text-xs leading-normal';
      case 'lg': return 'text-sm md:text-base leading-relaxed';
      case 'xl': return 'text-base md:text-lg leading-loose';
      default: return 'text-xs md:text-sm leading-relaxed'; // md size, slightly smaller than traditional templates
    }
  };

  const getLineSpacingClass = () => {
    switch (lineHeight) {
      case 'relaxed': return 'leading-relaxed';
      case 'loose': return 'leading-loose';
      default: return 'leading-normal';
    }
  };

  // 10 theme styles mapping object for dynamic status bar coloring
  const getThemeMap = (themeId: string) => {
    switch (themeId) {
      case 'dark':
        return {
          wrapper: 'bg-[#09090b] text-[#f4f4f5] dark',
          card: 'bg-[#18181b] border-zinc-800 text-[#f4f4f5]',
          inputBg: 'bg-[#121214] border-zinc-850 text-white',
          statusBarBg: 'bg-[#0f0f12] text-zinc-400 border-zinc-850',
          statusBarPoint: 'bg-rose-500 animate-pulse',
          statusBarText: 'text-rose-500',
          bannerHeader: 'from-zinc-900 to-transparent border-zinc-800',
          border: 'border-zinc-800/80'
        };
      case 'sepia':
        return {
          wrapper: 'bg-[#FAF6EE] text-[#432A15] sepia-mode',
          card: 'bg-[#f4efe3] border-amber-205 text-[#432A15]',
          inputBg: 'bg-white border-amber-200 text-[#432A15]',
          statusBarBg: 'bg-[#f3ead3] text-amber-900 border-amber-250',
          statusBarPoint: 'bg-amber-600 animate-pulse',
          statusBarText: 'text-amber-850',
          bannerHeader: 'from-amber-100/50 to-transparent border-amber-200',
          border: 'border-amber-200'
        };
      case 'emerald':
        return {
          wrapper: 'bg-[#f0f9f4] text-[#064e3b]',
          card: 'bg-[#def7ec] border-emerald-200 text-[#064e3b]',
          inputBg: 'bg-white border-emerald-250 text-[#064e3b]',
          statusBarBg: 'bg-[#def7ec] text-emerald-800 border-emerald-200',
          statusBarPoint: 'bg-emerald-600 animate-pulse',
          statusBarText: 'text-emerald-700',
          bannerHeader: 'from-emerald-50 to-transparent border-emerald-200',
          border: 'border-emerald-250'
        };
      case 'ocean':
        return {
          wrapper: 'bg-[#f0fdfa] text-[#164e63]',
          card: 'bg-[#e0f7fa] border-cyan-200 text-[#164e63]',
          inputBg: 'bg-white border-cyan-250 text-[#164e63]',
          statusBarBg: 'bg-[#e0f7fa] text-cyan-800 border-cyan-200',
          statusBarPoint: 'bg-cyan-500 animate-pulse',
          statusBarText: 'text-cyan-650',
          bannerHeader: 'from-cyan-50 to-transparent border-cyan-100',
          border: 'border-cyan-200'
        };
      case 'rose':
        return {
          wrapper: 'bg-[#fff1f2] text-[#881337]',
          card: 'bg-[#ffe4e6] border-rose-200 text-[#881337]',
          inputBg: 'bg-white border-rose-250 text-[#881337]',
          statusBarBg: 'bg-[#ffe4e6] text-rose-800 border-rose-250',
          statusBarPoint: 'bg-[#e11d48] animate-pulse',
          statusBarText: 'text-[#e11d48]',
          bannerHeader: 'from-rose-50 to-transparent border-rose-201',
          border: 'border-rose-201'
        };
      case 'coffee':
        return {
          wrapper: 'bg-[#fafaf9] text-[#451a03]',
          card: 'bg-[#fef3c7] border-amber-205 text-[#451a03]',
          inputBg: 'bg-white border-amber-205 text-[#451a03]',
          statusBarBg: 'bg-[#fef3c7] text-amber-900 border-amber-205',
          statusBarPoint: 'bg-[#b45309] animate-pulse',
          statusBarText: 'text-[#b45309]',
          bannerHeader: 'from-amber-50 to-transparent border-amber-200',
          border: 'border-amber-205'
        };
      case 'lavender':
        return {
          wrapper: 'bg-[#faf5ff] text-[#4a044e]',
          card: 'bg-[#f3e8ff] border-purple-200 text-[#4a044e]',
          inputBg: 'bg-white border-purple-250 text-[#4a044e]',
          statusBarBg: 'bg-[#f3e8ff] text-purple-800 border-purple-200',
          statusBarPoint: 'bg-[#a855f7] animate-pulse',
          statusBarText: 'text-[#a855f7]',
          bannerHeader: 'from-purple-50 to-transparent border-purple-200',
          border: 'border-purple-200'
        };
      case 'crimson':
        return {
          wrapper: 'bg-[#fef2f2] text-[#7f1d1d]',
          card: 'bg-[#fee2e2] border-red-200 text-[#7f1d1d]',
          inputBg: 'bg-white border-red-250 text-[#7f1d1d]',
          statusBarBg: 'bg-[#fee2e2] text-red-800 border-red-200',
          statusBarPoint: 'bg-red-500 animate-pulse',
          statusBarText: 'text-red-650',
          bannerHeader: 'from-red-50 to-transparent border-red-200',
          border: 'border-red-200'
        };
      case 'navy':
        return {
          wrapper: 'bg-[#0f172a] text-[#f1f5f9] darkTheme',
          card: 'bg-[#1e293b] border-blue-900/40 text-[#f1f5f9]',
          inputBg: 'bg-[#1e293b]/80 border-blue-900/30 text-white',
          statusBarBg: 'bg-[#1e293b] text-blue-300 border-blue-900/50',
          statusBarPoint: 'bg-blue-500 animate-pulse',
          statusBarText: 'text-blue-400',
          bannerHeader: 'from-blue-952/20 to-transparent border-blue-900/30',
          border: 'border-blue-900/40'
        };
      default: // light
        return {
          wrapper: 'bg-[#fbfbfa] text-stone-900 light',
          card: 'bg-white border-stone-200 text-stone-900',
          inputBg: 'bg-white border-stone-200 text-stone-900',
          statusBarBg: 'bg-[#f2f2ee] text-stone-605 border-stone-200/80',
          statusBarPoint: 'bg-emerald-500 animate-pulse',
          statusBarText: 'text-stone-700',
          bannerHeader: 'from-stone-100 to-transparent border-stone-200/50',
          border: 'border-stone-200/50'
        };
    }
  };

  const activeThemeMap = getThemeMap(theme);

  // If splash view is active, render it exclusively
  if (showSplash) {
    return <SplashView onFinish={handleSplashFinish} />;
  }

  return (
    <div 
      id="app-root"
      dir="rtl" 
      className={`min-h-screen pb-20 md:pb-6 md:pr-64 transition-colors duration-300 ${activeThemeMap.wrapper}`}
    >
      {/* Central responsive workspace wrapper container */}
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 select-none">
        
        {/* UPPER STATUS STRIP (Dynamically matches the selected theme's style and values) */}
        <div className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 flex-row border-stone-200/80 ${activeThemeMap.statusBarBg}`}>
          <button 
            id="btn-creator-contact"
            onClick={() => setIsContactOpen(true)}
            className="text-[10px] bg-rose-500/10 text-rose-505 font-black hover:bg-rose-500/20 py-0.5 px-2.5 rounded-lg flex items-center gap-1 flex-row-reverse shadow-2xs transition-colors cursor-pointer"
          >
            <User className="h-3 w-3" />
            <span>د مرستې او ملاتړ مېز</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${activeThemeMap.statusBarPoint}`} />
            <span className={`text-[10px] font-sans font-black ${activeThemeMap.statusBarText}`}>
              د ویناوالۍ مینه وال
            </span>
          </div>
          <div className="text-[9px] font-mono font-medium opacity-80">
            {new Date().toLocaleDateString('ps-AF')}
          </div>
        </div>

        {/* DAILY INSPIRATIONAL QUOTE BLOCK */}
        <div 
          id="daily-quote-card"
          className={`p-4 border rounded-2xl relative overflow-hidden flex items-start justify-between gap-4 flex-row-reverse ${activeThemeMap.card}`}
        >
          <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-l from-rose-500 to-amber-300" />
          
          <div className="flex-1 text-right">
            <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider block mb-1">
              د ورځې الهام بخښونکې جمله
            </span>
            <p className={`font-serif italic font-medium leading-relaxed text-xs`}>
              « {currentQuote.text} »
            </p>
            {currentQuote.source && (
              <span className="text-[9px] text-stone-400 block mt-1">
                — له سرچینې: {currentQuote.source}
              </span>
            )}
          </div>

          <button
            id="quote-roll-btn"
            onClick={rollNewQuote}
            className="p-1.5 bg-stone-50/15 rounded-lg text-stone-400 hover:text-rose-500 cursor-pointer transition-all self-center shrink-0"
            title="بله جمله"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ACTIVE MODULE VIEW SWITCHER */}
        <main id="tab-viewport" className="pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB 1: 🏠 کورپاڼه (HOME / LESSON HUB) */}
              {activeTab === 'home' && (
                <div className="space-y-4">
                  
                  {/* COMPACT AUTO-SLIDING BOOK CAROUSEL */}
                  <BookSlider />

                  {/* Dashboard header and descriptions */}
                  <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b pb-2 ${activeThemeMap.border}`}>
                    <div className="text-right">
                      <h2 className="text-lg font-black font-sans">
                        د مسلکي وينا راز په څه کې ده
                      </h2>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        دا لړۍ په ۶ مختلفه برخو وېشل شوې ده. یو کتګوري وټاکئ او لوستل یې پېل کړئ.
                      </p>
                    </div>

                    {/* Bulk actions */}
                    <div className="flex gap-1.5 justify-end mt-1 sm:mt-0">
                      <button
                        id="btn-all-read"
                        onClick={handleMarkAllRead}
                        className="px-2.5 py-1 bg-stone-100/10 border border-stone-200/40 text-[10px] font-black text-rose-500 rounded-lg hover:bg-stone-200/20 transition-colors cursor-pointer"
                      >
                        بشپړ لوستل
                      </button>
                      <button
                        id="btn-all-unread"
                        onClick={handleMarkAllUnread}
                        className="px-2.5 py-1 bg-stone-100/10 border border-stone-200/40 text-[10px] font-black text-stone-405 dark:text-stone-400 rounded-lg hover:text-rose-505 transition-colors cursor-pointer"
                      >
                        صفر پاکول
                      </button>
                    </div>
                  </div>

                  {/* Filter Rail & Search trigger */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                    
                    {/* Category Filter Pills (Pashto) */}
                    <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none flex-row-reverse">
                      {[
                        { id: 'all', label: 'ټول درسونه' },
                        { id: 'favorite', label: '❤️ خوښې' },
                        { id: 'bookmark', label: '🔖 نښه شوي' },
                        { id: 'definition', label: 'پېژندنه' },
                        { id: 'golden_rules', label: '۲۰ زرین اصول' },
                        { id: 'speaking_exercises', label: 'تمرینونه' },
                        { id: 'quiz_pill', label: '✍️ ازموينه' }
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          id={`category-pill-${pill.id}`}
                          onClick={() => {
                            setActiveCategoryFilter(pill.id);
                          }}
                          className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeCategoryFilter === pill.id
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-stone-100/40 dark:bg-zinc-900 text-stone-500 dark:text-stone-400 hover:bg-stone-200/50'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Integrated Search block */}
                    {activeCategoryFilter !== 'quiz_pill' && (
                      <div className="relative w-full sm:max-w-xs text-right">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                          <input
                            id="search-input-lessons"
                            type="text"
                            className={`w-full text-right py-1.5 pl-8 pr-3 text-[11px] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 ${activeThemeMap.inputBg}`}
                            placeholder="درسونو کې لټون..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                        </div>

                        {/* Smart Search Suggestions chips and quick prompts */}
                        {getSearchSuggestions().length > 0 && (
                          <div className="flex gap-1.5 justify-end flex-wrap mt-1.5">
                            <span className="text-[10px] text-stone-400 self-center">د وړاندیز نښه:</span>
                            {getSearchSuggestions().map((suggest) => (
                              <button
                                key={suggest}
                                onClick={() => handleSuggestionClick(suggest)}
                                className="px-2 py-0.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-md text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                {suggest}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RENDER THE SELECTED FILTERED VIEW */}
                  {activeCategoryFilter === 'quiz_pill' ? (
                    <WrittenQuiz fontSizeClass={fontSize} />
                  ) : filteredLessons.length === 0 ? (
                    <div className="p-10 border border-dashed border-stone-200 dark:border-stone-850 text-center rounded-2xl text-stone-400">
                      <CircleAlert className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-2" />
                      <p className="text-[11px] font-bold">بښنه غواړو، په دې سرلیک کوم درس ونه موندل شو!</p>
                      <button
                        id="btn-reset-search"
                        onClick={() => { setSearchText(''); setActiveCategoryFilter('all'); }}
                        className="mt-2 px-3 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        اصلي لیست وګورئ
                      </button>
                    </div>
                  ) : (
                    /* Display Grid or elegant vertical stack based on Layout Settings */
                    <div 
                      id="lessons-container-body"
                      className={`transition-all duration-300 ${
                        layoutType === 'grid' 
                          ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                          : 'space-y-3'
                      }`}
                    >
                      {filteredLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          isRead={readLessonIds.includes(lesson.id)}
                          onToggleRead={handleToggleRead}
                          fontSizeClass={fontSize}
                          onOpenDetailedReader={(l) => setSelectedLessonForReader(l)}
                        />
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: 🎤 تمرین (AUDIO PRACTICE RECORDER) */}
              {activeTab === 'practice' && (
                <AudioPractice
                  onAddPracticeSession={handleAddPracticeSession}
                  history={practiceHistory}
                  onDeleteSession={handleDeletePracticeSession}
                  fontSizeClass={fontSize}
                />
              )}

              {/* TAB 3: 📝 یادښتونه (USER DRAFTS & SCRIPTS) */}
              {activeTab === 'notes' && (
                <NotesSection
                  notes={notes}
                  onAddNote={handleAddNote}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                  fontSizeClass={fontSize}
                />
              )}

              {/* TAB 4: 📊 پرمختګ (PROGRESS TRACKER & MILESTONES) */}
              {activeTab === 'progress' && (
                <ProgressSection
                  lessons={LESSONS_DATA}
                  readLessonIds={readLessonIds}
                  practiceHistory={practiceHistory}
                  notes={notes}
                  fontSizeClass={fontSize}
                />
              )}

              {/* TAB 5: ⚙️ تنظیمات (ADVANCED SETTINGS) */}
              {activeTab === 'settings' && (
                <SettingsSection
                  theme={theme}
                  onChangeTheme={handleThemeChange}
                  fontSize={fontSize}
                  onChangeFontSize={handleFontSizeChange}
                  lineHeight={lineHeight}
                  onChangeLineHeight={handleLineHeightChange}
                  layoutType={layoutType}
                  onChangeLayoutType={handleLayoutTypeChange}
                  onBackup={handleBackup}
                  onRestore={handleRestore}
                  fontSizeClass={fontSize}
                  onTriggerContact={() => setIsContactOpen(true)}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* FIXED BOTTOM FLOATING NAVIGATION BAR */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadNotesCount={notes.length}
      />

      {/* COMPANION ONBOARDING & CONTACT SCREEN MODULES */}
      <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      
      {showOnboarding && (
        <OnboardingTour onFinish={() => setShowOnboarding(false)} />
      )}

      {/* IMMERSIVE DETAILED LESSON READER OUTLINE OVERLAY */}
      {selectedLessonForReader && (
        <DetailedLessonReader
          lesson={selectedLessonForReader}
          allLessons={LESSONS_DATA}
          isOpen={!!selectedLessonForReader}
          onClose={() => setSelectedLessonForReader(null)}
          isFavorite={favoriteLessonIds.includes(selectedLessonForReader.id)}
          onToggleFavorite={handleToggleFavorite}
          isBookmarked={bookmarkedLessonIds.includes(selectedLessonForReader.id)}
          onToggleBookmark={handleToggleBookmark}
          onSelectLesson={(l) => setSelectedLessonForReader(l)}
          fontSize={fontSize}
        />
      )}
    </div>
  );
}
