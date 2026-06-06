import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Award,
  ChevronRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data';

interface WrittenQuizProps {
  fontSizeClass: string;
}

export const WrittenQuiz: React.FC<WrittenQuizProps> = ({ fontSizeClass }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answersLog, setAnswersLog] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || isSubmitted) return;
    
    const isCorrect = selectedOpt === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev, 
      { questionId: currentQuestion.id, selectedIndex: selectedOpt, isCorrect }
    ]);

    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setAnswersLog([]);
    setQuizFinished(false);
  };

  // Score Calculations
  const scorePercent = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  const getFontSizeStyle = () => {
    switch (fontSizeClass) {
      case 'sm': return 'text-xs md:text-sm';
      case 'lg': return 'text-base md:text-lg';
      case 'xl': return 'text-lg md:text-xl';
      default: return 'text-sm md:text-base';
    }
  };

  return (
    <div className="space-y-4 text-right">
      
      {/* Quiz Introduction / Banner */}
      <div className="p-4 bg-gradient-to-l from-rose-500/10 to-transparent dark:from-rose-950/20 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col items-end gap-1 select-none">
        <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-1.5 flex-row-reverse">
          <Award className="w-5 h-5 text-rose-500" />
          <span>د فن بیان او جرأت کچې پېژندنې ازموینه</span>
        </h3>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
          د ويناوالۍ د زرینو اصولو، تمرینونو او د زړور شخص د ځانګړتیاو پر اساس خپله وړتیا وڅارئ.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="bg-white dark:bg-[#18181b] border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4"
          >
            {/* Top Indicator */}
            <div className="flex justify-between items-center text-xs text-stone-400 font-bold flex-row-reverse border-b border-stone-100 dark:border-zinc-850 pb-2">
              <span>ازموینه: {currentIdx + 1} / {QUIZ_QUESTIONS.length}</span>
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <span className="inline-block py-0.5 px-2 bg-rose-500/10 text-rose-500 rounded-md text-[10px]">عمومي توري</span>
                <span className="font-mono">نمرې: {score}</span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="text-right">
              <h4 className={`font-black text-stone-900 dark:text-white leading-relaxed ${getFontSizeStyle()}`}>
                {currentQuestion.question}
              </h4>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrectIndex = idx === currentQuestion.correctIndex;
                
                let optionStyle = "border-stone-150 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/30 hover:bg-stone-50 dark:hover:bg-zinc-850";
                if (isSelected) {
                  optionStyle = "border-rose-500 bg-rose-500/5 text-rose-650 dark:bg-rose-500/10 dark:text-rose-400 font-semibold";
                }
                
                if (isSubmitted) {
                  if (isCorrectIndex) {
                    optionStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-semibold";
                  } else if (isSelected) {
                    optionStyle = "border-rose-500 bg-rose-500/5 text-rose-500 dark:bg-rose-950/20";
                  } else {
                    optionStyle = "opacity-40 border-stone-100 dark:border-zinc-900";
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isSubmitted}
                    className={`w-full p-2.5 md:p-3 rounded-xl border text-right text-xs transition-all cursor-pointer flex items-center justify-between gap-3 flex-row-reverse ${optionStyle}`}
                  >
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-stone-200/50 dark:bg-zinc-800 rounded-md text-stone-500 dark:text-stone-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSubmitted && isCorrectIndex && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrectIndex && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer feedback & actions */}
            <div className="pt-2 border-t border-stone-100 dark:border-zinc-850 gap-3 flex flex-col">
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-stone-50 dark:bg-stone-900/30 border border-stone-100 dark:border-zinc-850 rounded-xl text-xs space-y-1"
                >
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">تشریح او وضاحت:</span>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}

              <div className="flex justify-between items-center flex-row-reverse">
                {!isSubmitted ? (
                  <button
                    id="btn-quiz-submit"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOpt === null}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedOpt === null
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-zinc-800'
                        : 'bg-rose-500 text-white shadow-xs hover:bg-rose-600'
                    }`}
                  >
                    ځواب نهایی کړئ
                  </button>
                ) : (
                  <button
                    id="btn-quiz-next"
                    onClick={handleNextQuestion}
                    className="px-5 py-2 bg-stone-900 dark:bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-stone-800 dark:hover:bg-rose-600 cursor-pointer transition-all flex items-center gap-1.5 flex-row-reverse"
                  >
                    <span>{currentIdx + 1 === QUIZ_QUESTIONS.length ? 'نتیجه وګورئ' : 'بلې پوښتنې ته تلل'}</span>
                    <ChevronRight className="w-4 h-4 turn-180" />
                  </button>
                )}

                <span className="text-[10px] text-stone-400">
                  {isSubmitted ? 'تشریح په غور سره موندل کړئ' : 'صحیح انتخاب کلیک کړئ'}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#18181b] border border-stone-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 text-center select-none space-y-5"
          >
            {/* Crown / Finish Banner */}
            <div className="relative inline-block mt-2">
              <span className="absolute -top-3 -right-3 block p-1.5 bg-amber-500 text-white rounded-full animate-bounce">
                <Sparkles className="w-5 h-5" />
              </span>
              <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ٪{scorePercent}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900 dark:text-white">ازموینه په بریا پای ته ورسېده!</h3>
              <p className="text-xs text-stone-400">
                تاسو په برياليتوب سره د ټولو {QUIZ_QUESTIONS.length} پوښتنو ځوابونه بشپړ کړل.
              </p>
            </div>

            {/* Scorecard detail board */}
            <div className="max-w-xs mx-auto p-3.5 bg-stone-50 dark:bg-stone-900/40 border border-stone-150 dark:border-zinc-850 rounded-2xl text-[11px] text-stone-600 dark:text-stone-300 space-y-2">
              <div className="flex justify-between flex-row-reverse font-medium">
                <span>برابر ځوابونه:</span>
                <span className="font-bold text-emerald-500">{score} پوښتنې</span>
              </div>
              <div className="flex justify-between flex-row-reverse font-medium">
                <span>اشتباه ځوابونه:</span>
                <span className="font-bold text-rose-500">{QUIZ_QUESTIONS.length - score} پوښتنې</span>
              </div>
              <div className="w-full h-[1px] bg-stone-200 dark:bg-zinc-800" />
              <div className="flex justify-between flex-row-reverse font-black text-sm text-stone-900 dark:text-white">
                <span>مجموعي فیصدي:</span>
                <span className="text-rose-500">٪ {scorePercent} نمرې</span>
              </div>
            </div>

            {/* Performance Text Statement */}
            <p className="text-xs text-stone-500 dark:text-stone-400 px-4 leading-relaxed max-w-sm mx-auto">
              {scorePercent >= 80 
                ? 'مبارک شه! ستاسو د ویناوالۍ اصول خورا په زړه پورې دي، تاسو د یو غښتلي او زړور رول د پیل لپاره پوره چمتو یاست!' 
                : scorePercent >= 50 
                ? 'ښه هڅه وه. ستاسو معلومات د عامه اړیکو اصول رانغاړي، مګر هره ورځ د یادښتونو او د غږ تمرینونه هم مه هېروئ.'
                : 'تاسو د فن بیان لا زیاتې مطالعې ته اړتیا لرئ. په پرله پسې ډول د ۲۰ زرینو اصولو لوستل او په کور کې تمرین کول پیل کړئ.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="btn-quiz-reset"
                onClick={handleResetQuiz}
                className="flex items-center justify-center gap-1.5 py-2 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ځان بیا وارزوئ</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
