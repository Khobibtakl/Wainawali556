import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  CheckCircle, 
  BookOpen, 
  Mic, 
  Clock, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Award,
  ChevronLeft
} from 'lucide-react';
import { LessonItem, PracticeSession, NoteItem } from '../types';

interface ProgressSectionProps {
  lessons: LessonItem[];
  readLessonIds: string[];
  practiceHistory: PracticeSession[];
  notes: NoteItem[];
  fontSizeClass: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: React.ReactNode;
  color: string;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  lessons,
  readLessonIds,
  practiceHistory,
  notes,
  fontSizeClass
}) => {
  // Statistics Calculations
  const totalLessonsCount = lessons.length;
  const readLessonsCount = readLessonIds.length;
  const readLessonsPercent = totalLessonsCount > 0 
    ? Math.round((readLessonsCount / totalLessonsCount) * 100) 
    : 0;

  const totalPracticeCount = practiceHistory.length;
  const totalPracticeSeconds = practiceHistory.reduce((sum, item) => sum + item.duration, 0);
  const totalPracticeMinutes = Math.round(totalPracticeSeconds / 60);

  // Analyze achievements
  const achievementsList: Achievement[] = [
    {
      id: 'first-read',
      title: 'د علم پيل او چمتووالی',
      description: 'د فن بايان لومړی لوست په بشپړ ډول ولولئ.',
      isUnlocked: readLessonsCount >= 1,
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      color: 'from-indigo-500/10 to-transparent border-indigo-200'
    },
    {
      id: 'all-rules-read',
      title: 'د اصولو ريښتینی ځواب ویونکی',
      description: 'د فن بیان ۲۰ طلایي اصول او پېژندنه په پوره ځان سره ولولئ.',
      isUnlocked: readLessonIds.includes('golden-rules') && readLessonIds.includes('intro-def'),
      icon: <Award className="w-5 h-5 text-amber-500 animate-bounce" />,
      color: 'from-amber-500/10 to-transparent border-amber-200'
    },
    {
      id: 'first-practice',
      title: 'لومړنی وینا کلام ثبتول',
      description: 'خپل د غږ لومړنی تمرين یا ټایمر په بریالیتوب ثبت کړئ.',
      isUnlocked: totalPracticeCount >= 1,
      icon: <Mic className="w-5 h-5 text-rose-500" />,
      color: 'from-rose-500/10 to-transparent border-rose-200'
    },
    {
      id: 'speech-scribe',
      title: 'خلاق ليکوال (Scribe)',
      description: 'د خپل ځان لپاره په شخصی نوټپېډ کې لږ تر لږه ۲ یادښتونه ولیکئ.',
      isUnlocked: notes.length >= 2,
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      color: 'from-emerald-500/10 to-transparent border-emerald-200'
    },
    {
      id: 'dedicated-speaker',
      title: 'کاريګر او نه درېدونکی سټېج وال',
      description: 'له ۳ څخه ډېر ثبت بېلګې او د خبرو ریکارډونه ترسره کړئ.',
      isUnlocked: totalPracticeCount >= 3,
      icon: <Flame className="w-5 h-5 text-orange-500 animate-pulse" />,
      color: 'from-orange-500/10 to-transparent border-orange-200'
    },
    {
      id: 'master-knowledge',
      title: 'د ویناوالۍ لمر',
      description: 'ټول موجود لوستونه او مقالې مو په نښه او بشپړ لوستي کړي دي.',
      isUnlocked: readLessonsCount === totalLessonsCount && totalLessonsCount > 0,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      color: 'from-yellow-500/10 to-transparent border-yellow-250'
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.isUnlocked).length;
  const achievementProgress = Math.round((unlockedCount / achievementsList.length) * 105);

  return (
    <div className="space-y-6 text-right">
      
      {/* Intro Header banner */}
      <div className="p-5 bg-gradient-to-l from-indigo-500/10 to-transparent dark:from-indigo-950/20 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/5">
        <h2 className="text-xl font-bold font-sans text-stone-900 dark:text-white sepia:text-amber-950 flex items-center justify-end gap-2">
          <span>ستاسو د پرمختګ او بریالیتوبونو کچه</span>
          <Trophy className="w-5 h-5 text-amber-500" />
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-900/80 mt-1">
          دلته ستاسو په لوستل شوو درسونو، غږ ثبتونو او فعال فعالیت کچه څارل کېږي ترڅو د سټېج نوی ویناوال شي.
        </p>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Lessons Read */}
        <div className="p-5 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl flex items-center justify-between gap-4 flex-row-reverse">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-stone-400">لوستل شوي درسونه</span>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-white sepia:text-amber-950">
              {readLessonsCount} / {totalLessonsCount}
            </h3>
            <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">
              {readLessonsPercent}% بشپړ شوی
            </p>
          </div>
        </div>

        {/* Stat 2: Speech recordings completed */}
        <div className="p-5 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl flex items-center justify-between gap-4 flex-row-reverse">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <Mic className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-stone-400">بشپړ شوي تمرینونه</span>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-white sepia:text-amber-950">
              {totalPracticeCount} تمرينونه
            </h3>
            <p className="text-[10px] text-rose-550 font-semibold mt-0.5">
              تر ټولو ګټور کلام
            </p>
          </div>
        </div>

        {/* Stat 3: Accumulated duration */}
        <div className="p-5 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl flex items-center justify-between gap-4 flex-row-reverse">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-stone-400">ټولیز تمرین موده</span>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-white sepia:text-amber-950">
              {totalPracticeMinutes > 0 ? `${totalPracticeMinutes} دقيقې` : `${totalPracticeSeconds} ثانیې`}
            </h3>
            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
              مسلسل روان تمرين
            </p>
          </div>
        </div>

      </div>

      {/* DETAILED LESSONS PROGRESS METER */}
      <div className="p-6 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-white sepia:text-amber-950">
              د درسونو د مطالعه کولو کچه
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-500">
            {readLessonsPercent}%
          </span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-[#202023] rounded-full h-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${readLessonsPercent}%` }}
            className="bg-gradient-to-l from-rose-500 to-amber-400 h-full rounded-full"
          />
        </div>
        <p className="text-[11px] text-left text-stone-400">
          د مطالعې لوړ ښودنه ستاسو د جرأت ۲ کوټه په کټه زیاتوي.
        </p>
      </div>

      {/* GAMIFICATION ACHIEVEMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-row-reverse pr-1">
          <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-md">
            بریاوې: {unlockedCount} / {achievementsList.length}
          </span>
          <h3 className="text-base font-bold text-stone-900 dark:text-white sepia:text-amber-950 flex items-center justify-end gap-2">
            <span>د ویناوالۍ مالي لاسته راوړنې</span>
            <Award className="w-4 h-4 text-amber-500" />
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievementsList.map((item) => (
            <div
              key={item.id}
              className={`p-4 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border rounded-2xl flex items-start gap-4 text-right flex-row-reverse transition-all ${
                item.isUnlocked
                  ? `bg-gradient-to-l border-stone-250 dark:border-stone-800 sepia:border-amber-250 ${item.color}`
                  : 'opacity-50 border-stone-200 dark:border-stone-900 sepia:border-amber-200/40 bg-stone-50/50 dark:bg-[#131315]/10'
              }`}
            >
              {/* Achievement Badge Status icon */}
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                item.isUnlocked
                  ? 'bg-white dark:bg-[#121214] border-stone-150'
                  : 'bg-stone-100 dark:bg-stone-900 border-transparent text-stone-400'
              }`}>
                {item.icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-row-reverse gap-2">
                  <h4 className={`font-bold font-sans ${
                    item.isUnlocked 
                      ? 'text-stone-950 dark:text-white sepia:text-amber-950' 
                      : 'text-stone-500 dark:text-stone-400'
                  } ${
                    fontSizeClass === 'sm' ? 'text-xs' :
                    fontSizeClass === 'md' ? 'text-sm' :
                    fontSizeClass === 'lg' ? 'text-base' : 'text-lg'
                  }`}>
                    {item.title}
                  </h4>
                  {item.isUnlocked ? (
                    <span className="text-[9px] bg-emerald-550/10 text-emerald-650 font-bold px-1.5 py-0.5 rounded-sm">
                      تائید شوی
                    </span>
                  ) : (
                    <span className="text-[9px] bg-stone-100 dark:bg-stone-850 text-stone-400 font-bold px-1.5 py-0.5 rounded-sm">
                      لاک شوې
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 sepia:text-amber-800/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
