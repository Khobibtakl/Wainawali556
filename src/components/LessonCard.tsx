import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquareText, 
  Award, 
  Mic, 
  Flame, 
  Compass, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Circle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { LessonItem } from '../types';

interface LessonCardProps {
  lesson: LessonItem;
  isRead: boolean;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  fontSizeClass: string;
  onOpenDetailedReader?: (lesson: LessonItem) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'MessageSquareText': return <MessageSquareText className="w-5 h-5" />;
    case 'Award': return <Award className="w-5 h-5" />;
    case 'Mic': return <Mic className="w-5 h-5" />;
    case 'Flame': return <Flame className="w-5 h-5" />;
    case 'Compass': return <Compass className="w-5 h-5 text-amber-500" />;
    case 'Home': return <Home className="w-5 h-5 text-emerald-500" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'definition':
      return { label: 'پېژندنه', bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900' };
    case 'golden_rules':
      return { label: 'زرین اصول', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900' };
    case 'speaking_exercises':
      return { label: 'ګټور تمرینونه', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' };
    case 'courage_exercises':
      return { label: 'د جرأت لوړول', bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900' };
    case 'courage_qualities':
      return { label: 'د زړورتيا نښې', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900' };
    case 'home_exercises':
      return { label: 'د کور تمرينونه', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900' };
    default:
      return { label: 'درس', bg: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' };
  }
};

export const LessonCard: React.FC<LessonCardProps> = ({ 
  lesson, 
  isRead, 
  onToggleRead,
  fontSizeClass,
  onOpenDetailedReader
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const badge = getCategoryBadge(lesson.category);

  return (
    <div 
      id={`lesson-card-${lesson.id}`}
      className="bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-[#27272a] sepia:border-amber-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Header section (Clickable to Toggle) */}
      <div 
        id={`lesson-header-${lesson.id}`}
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Category Icon and styling */}
          <div className={`p-3 rounded-full flex items-center justify-center transition-all ${
            isOpen 
              ? 'bg-rose-500 text-white shadow-xs' 
              : 'bg-stone-100 dark:bg-[#27272a] sepia:bg-[#F3EAD3] text-stone-700 dark:text-stone-300 sepia:text-amber-900'
          }`}>
            {getIcon(lesson.iconName)}
          </div>

          <div className="flex-1 text-right">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}>
                {badge.label}
              </span>
              {isRead && (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md">
                  لوستی
                </span>
              )}
            </div>
            <h3 className={`font-sans font-bold tracking-tight text-stone-900 dark:text-white sepia:text-amber-950 ${
              fontSizeClass === 'sm' ? 'text-base' :
              fontSizeClass === 'md' ? 'text-lg' :
              fontSizeClass === 'lg' ? 'text-xl' : 'text-2xl'
            }`}>
              {lesson.title}
            </h3>
            {lesson.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-800/80 mt-1 line-clamp-1">
                {lesson.description}
              </p>
            )}
          </div>
        </div>

        {/* Access controls & expand indicators */}
        <div className="flex items-center gap-3">
          <button 
            id={`lesson-read-btn-${lesson.id}`}
            onClick={(e) => onToggleRead(lesson.id, e)}
            title={isRead ? "بې لوستو نښه کول" : "د لوستلو نښه کول"}
            className={`p-2 rounded-xl transition-all border ${
              isRead 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100' 
                : 'bg-stone-50 dark:bg-[#1e1e1e] sepia:bg-[#f6f0dd] text-stone-400 dark:text-stone-600 border-stone-200 dark:border-[#2d2d2d] sepia:border-amber-200 hover:text-emerald-600'
            }`}
          >
            {isRead ? <CheckCircle className="w-5 h-5 fill-current text-emerald-500/10" /> : <Circle className="w-5 h-5" />}
          </button>
          
          <div className="text-stone-400 dark:text-stone-500">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable content area with animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 pt-2 border-t border-stone-100 dark:border-[#27272a] sepia:border-amber-200 bg-stone-50/50 dark:bg-stone-900/10 sepia:bg-amber-50/30 text-right leading-relaxed">
              {/* If simple content is available */}
              {lesson.content && (
                <p className={`text-stone-700 dark:text-stone-300 sepia:text-amber-950/90 whitespace-pre-wrap ${
                  fontSizeClass === 'sm' ? 'text-xs' :
                  fontSizeClass === 'md' ? 'text-sm' :
                  fontSizeClass === 'lg' ? 'text-base' : 'text-lg'
                }`}>
                  {lesson.content}
                </p>
              )}

              {/* If structured points exist */}
              {lesson.points && (
                <div className="space-y-4">
                  {lesson.points.map((point, index) => (
                    <motion.div 
                      key={point.id}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="p-4 bg-white dark:bg-[#1e1e21] sepia:bg-[#FAF6EE] rounded-xl border border-stone-100 dark:border-stone-800 sepia:border-amber-140 shadow-2xs hover:border-amber-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h4 className={`text-stone-950 dark:text-stone-100 sepia:text-amber-950 font-bold mb-1.5 flex items-center justify-between gap-2 ${
                        fontSizeClass === 'sm' ? 'text-sm' :
                        fontSizeClass === 'md' ? 'text-base' :
                        fontSizeClass === 'lg' ? 'text-lg' : 'text-xl'
                      }`}>
                        <span>{point.title}</span>
                      </h4>
                      <p className={`text-stone-600 dark:text-stone-400 sepia:text-amber-900/80 ${
                        fontSizeClass === 'sm' ? 'text-xs' :
                        fontSizeClass === 'md' ? 'text-xs md:text-sm' :
                        fontSizeClass === 'lg' ? 'text-sm md:text-base' : 'text-base md:text-lg'
                      }`}>
                        {point.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mark as read helper button and reader button inside content */}
              <div className="mt-5 flex flex-wrap justify-between items-center gap-2 border-t border-stone-100 dark:border-stone-800/80 pt-4">
                {onOpenDetailedReader && (
                  <button
                    id={`lesson-open-reader-btn-${lesson.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailedReader(lesson);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>برابر لوستل (لوستلو موډ)</span>
                  </button>
                )}
                <button
                  id={`lesson-inner-read-btn-${lesson.id}`}
                  onClick={(e) => {
                    onToggleRead(lesson.id, e);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                    isRead 
                      ? 'bg-emerald-550/10 text-emerald-650 border-emerald-500/20' 
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border-transparent hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {isRead ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 fill-current text-emerald-550" />
                      لوستل شوی و پېژنئ
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      د لوستلو نښه کول
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
