import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, Mic, Play } from 'lucide-react';

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fill up the progress bar over 3.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5; 
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 450);
      return () => clearTimeout(finishTimer);
    }
  }, [progress, onFinish]);

  return (
    <div className="fixed inset-0 z-100 bg-[#0c0c0e] text-[#f4f4f5] flex flex-col justify-between items-center p-6 md:p-10 select-none text-right">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0,transparent_60%)] animate-pulse" />

      {/* Top subtle branding info */}
      <div className="w-full max-w-sm flex items-center justify-between border-b border-stone-850 pb-3 flex-row-reverse z-10">
        <span className="text-[10px] text-zinc-500 font-bold">پښتو آفلاین کلام</span>
        <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest bg-rose-500/10 py-0.5 px-2 rounded-md">خپور بڼه ۱.۰.۰</span>
      </div>

      {/* Main Beautiful Logo Group */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-6 z-10 my-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 1.2 }}
          className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 p-[2px] shadow-2xl flex items-center justify-center"
        >
          <div className="h-full w-full bg-[#0c0c0e] rounded-[22px] flex items-center justify-center relative">
            <Mic className="w-9 h-9 text-rose-500 animate-pulse" />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inline-flex h-full w-full rounded-[22px] bg-rose-500/15"
            />
          </div>
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl md:text-3xl font-black font-sans tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-l from-white via-[#f4f4f5] to-zinc-400"
          >
            د مسلکي وينا راز په څه کې ده
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xs text-zinc-400 font-medium"
          >
            عامه ويناوالي، ځانګړي اصول او عملي تمریني مرستندوی
          </motion.p>
        </div>

        {/* Small animated features pill list */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-wrap gap-1.5 justify-center items-center text-[9px] text-zinc-400 font-bold"
        >
          <span className="py-0.5 px-2 bg-zinc-850/60 border border-zinc-800 rounded-md">🎤 غږ ثبتیار</span>
          <span className="py-0.5 px-2 bg-zinc-850/60 border border-zinc-800 rounded-md">📜 ۲۰ زرین اصول</span>
          <span className="py-0.5 px-2 bg-zinc-850/60 border border-zinc-800 rounded-md">🏆 ۱۰ پرمختللي لیدونه</span>
          <span className="py-0.5 px-2 bg-zinc-850/60 border border-zinc-800 rounded-md">📝 وړیا یادښتونه</span>
        </motion.div>
      </div>

      {/* Loading Progress Frame & Creator watermark */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-5 z-10 mt-auto">
        
        {/* Loader percentage progress bar */}
        <div className="w-full space-y-1.5 text-center">
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-bold">
            <span>٪{Math.round(progress)}</span>
            <span>ډیټابیس چمتو کول</span>
          </div>
          <div className="w-full bg-[#18181c] h-1 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-l from-rose-500 to-amber-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Creator Name block */}
        <div className="text-center pt-2 select-none">
          <span className="text-[9px] text-zinc-650 block">اپلیکیشن جوړونکی:</span>
          <span className="text-xs font-black text-rose-500 block tracking-wide font-sans mt-0.5">
            طالب العلم خبيب تکل
          </span>
        </div>

      </div>
    </div>
  );
};
