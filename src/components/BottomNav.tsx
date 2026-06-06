import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Mic, 
  FileText, 
  Trophy, 
  Settings,
  Brain
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadNotesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadNotesCount = 0
}) => {
  const tabs = [
    { id: 'settings', label: 'تنظیمات', icon: <Settings className="w-5 h-5" /> },
    { id: 'brain', label: 'دوهم مغز', icon: <Brain className="w-5 h-5" /> },
    { id: 'progress', label: 'پړاوونه', icon: <Trophy className="w-5 h-5" /> },
    { id: 'notes', label: 'یادښتونه', icon: <FileText className="w-5 h-5" />, badgeCount: unreadNotesCount },
    { id: 'practice', label: 'تمرین', icon: <Mic className="w-5 h-5" /> },
    { id: 'home', label: 'کورپاڼه', icon: <Home className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* MOBILE STICKY BOTTOM BAR (max-w handles centering) */}
      <div 
        id="bottom-nav-mobile"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0c0c0e]/95 sepia:bg-[#FAF6EE]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-900 sepia:border-amber-200/60 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] block md:hidden"
      >
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`btn-nav-mobile-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none cursor-pointer group transition-colors ${
                  isActive 
                    ? 'text-rose-500 font-bold' 
                    : 'text-stone-400 dark:text-stone-500 sepia:text-amber-900/60 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                {/* Active state background pill animation */}
                {isActive && (
                  <motion.span
                    layoutId="activeTabMobile"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="absolute inset-x-2 top-1.5 bottom-1.5 bg-rose-500/10 rounded-xl"
                  />
                )}

                <div className="relative">
                  {tab.icon}
                  {/* Optional dynamic badge */}
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0c0c0e]">
                      {tab.badgeCount}
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] mt-1 font-sans z-10 font-bold">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP SIDE BAR RAIL (RTL Side Rail on extreme right or clean layout) */}
      <div 
        id="bottom-nav-desktop"
        className="hidden md:flex flex-col justify-between fixed top-0 right-0 h-screen w-64 z-40 bg-white dark:bg-[#0c0c0e] sepia:bg-[#FAF6EE] border-l border-stone-200 dark:border-stone-900 sepia:border-amber-250 p-6 shadow-sm text-right"
      >
        <div className="space-y-8">
          {/* Branded Logo/Title header */}
          <div className="pr-2 border-r-4 border-rose-500 py-1">
            <h1 className="text-lg font-black font-sans text-stone-900 dark:text-white sepia:text-amber-950">
              د فن بيان لارښود
            </h1>
            <p className="text-[10px] text-stone-400 font-medium">
              د عامه خبرو د ويناوالۍ ځواک
            </p>
          </div>

          {/* Nav Items stack */}
          <nav className="space-y-1.5 direction-rtl">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-nav-desktop-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all flex items-center justify-end gap-3 cursor-pointer group ${
                    isActive
                      ? 'text-rose-500 bg-rose-500/10'
                      : 'text-stone-600 dark:text-stone-400 sepia:text-amber-900/80 hover:bg-stone-50 dark:hover:bg-[#141416] sepia:hover:bg-[#f6f0dd] hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex-1 text-right">
                    {tab.label}
                  </span>
                  <div className="relative">
                    {tab.icon}
                    {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Small desktop developer watermark credit */}
        <div className="pr-4 border-r border-stone-200 dark:border-stone-800 sepia:border-amber-200 text-stone-400 dark:text-stone-600 text-[11px] font-medium leading-relaxed">
          <p>پښتو علمي همکار</p>
          <p className="text-[9px] mt-0.5">نسخه ۱.۰.۰</p>
        </div>
      </div>
    </>
  );
};
