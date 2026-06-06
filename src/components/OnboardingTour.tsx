import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Mic, 
  FileText, 
  Palette, 
  Award, 
  ChevronRight, 
  Flame, 
  HelpCircle,
  X 
} from 'lucide-react';

interface OnboardingTourProps {
  onFinish: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: 'ښه راغلاست – د فن بیان لارښود ته!',
      description: 'دا اپلیکیشن تاسو سره د عامه خبرو، ويناوالۍ هنر، او پر نفس د خورا غښتلي باور موندلو په لارو چارو کې وړیا، افلاین او هر اړخیزه علمي مرسته کوي.',
      icon: <Flame className="w-10 h-10 text-rose-500 animate-bounce" />,
      accent: 'from-rose-500 to-amber-400'
    },
    {
      title: '۱. د فن بیان ۲۰ طلایي اصول او لوستونه',
      description: 'په لومړۍ پاڼه کې به د وینا جامع پیل، د سترګو همغږي، د بدن ژبې کنټرول، او ۵ تر ټولو ښه تمریناتي لوستونه په ګریډ او لیست بڼو کې ومومئ.',
      icon: <BookOpen className="w-10 h-10 text-indigo-500" />,
      accent: 'from-indigo-500 to-sky-400'
    },
    {
      title: '۲. ځواکمن غږ ثبتیار او تمرین',
      description: 'ستاسو د خبرو د سرعت موندلو او غامونو د پېژندنې لپاره د غږ د ثبت ثبتیار کار وکړئ. خپل غږ به ثبت کوئ، موده به یې ساتئ او بېرته واورئ.',
      icon: <Mic className="w-10 h-10 text-emerald-500" />,
      accent: 'from-emerald-500 to-teal-400'
    },
    {
      title: '۳. د وینا بیداره مسودې او یادښتونه',
      description: 'ستاسو د سټېج خبرو، مقالو او شخصي نظریاتو په رنګینګ بڼه ساتلو لپاره یو بشپړ د مسودو کتابتون شتون لري چې افلاین خوندي کېږي.',
      icon: <FileText className="w-10 h-10 text-amber-500" />,
      accent: 'from-amber-500 to-orange-450'
    },
    {
      title: '۴. لس (۱۰) پرمختللي ښایسته رنګونه',
      description: 'تاسو کولی شئ په پرمختللو تنظیماتو کې ۱۰ رنګارنګ او ښکلي تمونه وګرځوئ، د ورځې روښانه حالت بدل کړئ، او د لیکنو اندازې عالي تنظیم کړئ.',
      icon: <Palette className="w-10 h-10 text-purple-500" />,
      accent: 'from-purple-500 to-pink-400'
    },
    {
      title: '۵. د فن بیان پر بنسټ تحریري ازموینه',
      description: 'په لوستل شوو موضوعاتو باندې ازموینه ترسره کړئ. خپلې نمرې ومومئ، په فیصدي حساب یې وڅارئ او خپل ځان یو ښه او پیاوړی ویناوال وګرځوئ.',
      icon: <Award className="w-10 h-10 text-rose-500" />,
      accent: 'from-rose-500 to-rose-700'
    }
  ];

  const handleNext = () => {
    if (currentStep + 1 < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('elocution_onboarding_completed', 'true');
    onFinish();
  };

  const stepInfo = steps[currentStep];

  return (
    <div className="fixed inset-0 z-99 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 text-right">
      <div className="bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] rounded-3xl max-w-md w-full border border-stone-200 dark:border-stone-800 sepia:border-amber-200 overflow-hidden shadow-2xl flex flex-col justify-between relative select-none">
        
        {/* Top Gradient Banner strip */}
        <div className={`h-2.5 bg-gradient-to-l ${stepInfo.accent} transition-all duration-300`} />

        {/* Skip button absolutely placed */}
        <button 
          id="btn-skip-tour"
          onClick={handleComplete}
          className="absolute top-5 left-5 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
          title="د لارښود پرېښودل"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Animated Central Icon with gradient ring */}
          <div className="flex justify-center py-2">
            <div className="h-20 w-20 rounded-2xl bg-stone-50 dark:bg-zinc-800 sepia:bg-[#EADCBF] flex items-center justify-center shadow-inner relative">
              <span className="absolute inset-0 rounded-2xl bg-zinc-400/5 animate-ping" />
              {stepInfo.icon}
            </div>
          </div>

          {/* Stepper progress bullets */}
          <div className="flex justify-center gap-1">
            {steps.map((_, idx) => (
              <span 
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-rose-500' : 'w-1.5 bg-stone-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-base md:text-lg font-black text-stone-900 dark:text-white sepia:text-amber-950">
              {stepInfo.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-900/80 leading-relaxed px-2">
              {stepInfo.description}
            </p>
          </div>

        </div>

        {/* Bottom Bar Controls */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-900 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center flex-row-reverse">
          <button
            id="btn-tour-next"
            onClick={handleNext}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 flex-row-reverse cursor-pointer shadow-xs transition-all"
          >
            <span>{currentStep === steps.length - 1 ? 'پیل کړئ' : 'بل ګام'}</span>
            <ChevronRight className="w-4 h-4 turn-180" />
          </button>

          <button
            id="btn-tour-skip-bottom"
            onClick={handleComplete}
            className="text-xs text-stone-500 hover:text-stone-850 dark:text-stone-400 font-bold transition-colors cursor-pointer"
          >
            تېرېدل
          </button>
        </div>

      </div>
    </div>
  );
};
