import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Phone, 
  Facebook, 
  Mail, 
  MessageCircle,
  X,
  Award,
  BookOpen
} from 'lucide-react';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose }) => {
  const contactLinks = [
    {
      id: 'telegram',
      title: 'ټیلیګرام ادرس',
      value: 't.me/khubaib_takl',
      url: 'https://t.me/khubaib_takl',
      icon: <Send className="w-5 h-5 text-sky-500 fill-sky-500/10" />,
      colorClass: 'hover:border-sky-305 hover:bg-sky-50/15'
    },
    {
      id: 'whatsapp',
      title: 'واټساپ شمیره',
      value: '+93 76 544 3156',
      url: 'https://wa.me/93765443156',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />,
      colorClass: 'hover:border-emerald-305 hover:bg-emerald-50/15'
    },
    {
      id: 'facebook',
      title: 'فیسبوک پاڼه',
      value: 'Khobaib Takal (خبیب تکل)',
      url: 'https://www.facebook.com/khobaib.takal.',
      icon: <Facebook className="w-5 h-5 text-blue-600 fill-blue-600/10" />,
      colorClass: 'hover:border-blue-305 hover:bg-blue-50/15'
    },
    {
      id: 'phone',
      title: 'تلیفون اړیکه',
      value: '0777233699',
      url: 'tel:0777233699',
      icon: <Phone className="w-5 h-5 text-amber-500 fill-amber-500/10" />,
      colorClass: 'hover:border-amber-305 hover:bg-amber-50/15'
    },
    {
      id: 'gmail',
      title: 'جمیل ادرس',
      value: 'khobibtakl@gmail.com',
      url: 'mailto:khobibtakl@gmail.com',
      icon: <Mail className="w-5 h-5 text-rose-500 fill-rose-500/10" />,
      colorClass: 'hover:border-rose-305 hover:bg-rose-50/15'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 text-right">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] rounded-3xl max-w-sm w-full border border-stone-200 dark:border-stone-800 sepia:border-amber-200 overflow-hidden shadow-2xl relative z-10 select-none pb-4"
          >
            {/* Header section with gradient */}
            <div className="p-4 bg-gradient-to-l from-rose-500/10 via-amber-500/5 to-transparent flex items-center justify-between border-b border-stone-100 dark:border-zinc-850 flex-row-reverse pb-3">
              <div className="flex items-center gap-2 flex-row-reverse">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-stone-900 dark:text-white sepia:text-amber-950 font-sans">
                  د اپلیکیشن جوړونکي سره اړیکه
                </h3>
              </div>
              <button 
                id="contact-close-btn"
                onClick={onClose}
                className="p-1 rounded-lg bg-stone-50 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Intro Card */}
            <div className="p-4 flex flex-col items-center text-center space-y-2 border-b border-stone-50 dark:border-zinc-850/60 pb-3">
              <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-lg font-black tracking-wider">
                خ
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 dark:text-white sepia:text-amber-950">طالب العلم خبيب تکل</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">پښتو هڅاند، ژباړونکی او د مباحثې د علومو پوهنپال</p>
              </div>
            </div>

            {/* Links Stack */}
            <div className="p-4 space-y-2">
              {contactLinks.map((link) => (
                <a
                  key={link.id}
                  id={`contact-link-${link.id}`}
                  href={link.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className={`w-full p-2.5 rounded-xl border border-stone-100 dark:border-zinc-800/80 bg-stone-50/40 dark:bg-[#1c1c1f]/40 flex items-center justify-between gap-3 flex-row-reverse cursor-pointer transition-all ${link.colorClass}`}
                >
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <span className="p-2 bg-white dark:bg-zinc-850 rounded-xl shadow-2xs border border-stone-100/50 dark:border-zinc-800">
                      {link.icon}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-bold font-sans">
                        {link.title}
                      </span>
                      <span className="text-xs text-stone-800 dark:text-stone-200 sepia:text-amber-900 font-mono font-medium block mt-0.5">
                        {link.value}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center px-6">
              <p className="text-[9px] text-stone-450 leading-relaxed leading-normal">
                که په وینا، تمرینونو او یا ځانګړو اصولو کې کوم مادي اصلاح، مشوره یا وړاندیز لرئ، زموږ ور در خلاص دی.
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
