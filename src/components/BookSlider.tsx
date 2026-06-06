import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, ChevronRight, ChevronLeft, Award } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string;
  description: string;
  coverGradient: string;
  badge: string;
}

const FEATURED_BOOKS: BookItem[] = [
  {
    id: 'b1',
    title: 'د ویناوالۍ پرمختللي رازونه',
    author: 'د فکر او بيان خپرندویه اداره',
    description: 'د سترو او نامتو ویناوالو پټ مهارتونه، د خبرو اترو عالي تګلارې، او پر نفس کټ مټ د پوره ډاډ موندلو بنسټ په دې کتاب کې موندلی شئ.',
    coverGradient: 'from-emerald-600 via-teal-700 to-green-800',
    badge: 'تر ټولو ډېر لوستل شوی'
  },
  {
    id: 'b2',
    title: 'پر ځان باور او د جرأت مېړانه',
    author: 'د ژباړې او کلامي ارتقاء ټولنه',
    description: 'د سټېج د وېرې، وارخطایۍ او تشویش ریښه موندل او د ټولنیز جرأت د سمدستي لوړولو لپاره بې ساري ۲۱ ورځنۍ عملي تګلاره.',
    coverGradient: 'from-amber-600 via-orange-600 to-rose-700',
    badge: 'نوی او ګټور'
  },
  {
    id: 'b3',
    title: 'د غږ جادو او نوښتګر بیان',
    author: 'د ويناوالۍ هنر عالي اکاډمي',
    description: 'ستاسو غږ ستاسو هویت دی. د غږ لوړوالي، ټیټوالي، سرعت بدلونونو او د الفاظو د صمیمي تودوالي عالي تمرینونه او لارښود.',
    coverGradient: 'from-indigo-605 via-purple-700 to-pink-700',
    badge: 'ځانګړی انتخاب'
  }
];

export const BookSlider: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-rotate every 10 seconds as requested by the user
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % FEATURED_BOOKS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % FEATURED_BOOKS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + FEATURED_BOOKS.length) % FEATURED_BOOKS.length);
  };

  const activeBook = FEATURED_BOOKS[activeIdx];

  return (
    <div 
      id="book-carousel-wrapper"
      className="p-4 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl relative overflow-hidden text-right select-none"
    >
      {/* Background decor accents */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl" />
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-xl" />

      {/* Top Title/Action buttons */}
      <div className="flex justify-between items-center mb-3 flex-row-reverse pb-1.5 border-b border-stone-105 dark:border-stone-850/80">
        <span className="text-xs font-black text-rose-500 dark:text-rose-400 flex items-center gap-1.5 flex-row-reverse">
          <BookOpen className="w-3.5 h-3.5" />
          <span>وړاندیز شوي کتابونه (په هرو ۱۰ ثانیو کې تغیرېدونکی)</span>
        </span>
        <div className="flex gap-1">
          <button 
            id="book-slider-prev-btn"
            onClick={handlePrev}
            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 dark:bg-zinc-805 dark:hover:bg-zinc-700 text-stone-600 dark:text-stone-300 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            id="book-slider-next-btn"
            onClick={handleNext}
            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 dark:bg-zinc-805 dark:hover:bg-zinc-700 text-stone-600 dark:text-stone-300 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeBook.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 flex-row-reverse sm:items-center"
        >
          {/* Simulated 3D CSS Book Cover on left of RTL (meaning right in view) */}
          <div className="flex-none flex justify-center py-2">
            <div className={`w-28 h-40 rounded-r-lg rounded-l-xs shadow-lg bg-gradient-to-br ${activeBook.coverGradient} relative p-3 text-white flex flex-col justify-between overflow-hidden border-r-4 border-black/25 transform hover:-rotate-2 transition-transform duration-300`}>
              {/* Cover shiny line simulation */}
              <div className="absolute top-0 bottom-0 left-1 w-[2px] bg-white/20" />
              <div className="absolute top-0 bottom-0 left-2 w-[4px] bg-white/10" />

              <div className="flex justify-between items-start">
                <span className="text-[8px] tracking-wider uppercase font-extrabold bg-white/20 py-0.5 px-1.5 rounded-sm">پښتو</span>
                <Award className="w-4 h-4 text-amber-300" />
              </div>

              <div className="space-y-1">
                <h4 className="text-[11px] font-black leading-tight text-right text-amber-200 tracking-tight">
                  {activeBook.title}
                </h4>
                <div className="w-6 h-[2px] bg-amber-300 ml-auto" />
              </div>

              <div className="text-right text-[8px] text-white/80 font-bold block">
                {activeBook.author}
              </div>
            </div>
          </div>

          {/* Book Details content section */}
          <div className="flex-1 space-y-1.5 text-right flex flex-col justify-center">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="inline-block py-0.5 px-2 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-bold">
                {activeBook.badge}
              </span>
              <span className="text-[10px] text-stone-400 font-bold">لیکوال: {activeBook.author}</span>
            </div>

            <h3 className="text-sm font-black text-stone-900 dark:text-white">
              {activeBook.title}
            </h3>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {activeBook.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-1 mt-3">
        {FEATURED_BOOKS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeIdx ? 'w-4 bg-rose-500' : 'w-1.5 bg-stone-200 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
