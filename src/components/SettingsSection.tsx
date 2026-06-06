import React, { useRef, useState } from 'react';
import { 
  Sun, 
  Moon, 
  Coffee, 
  Palette, 
  Type, 
  Database, 
  Download, 
  Upload, 
  Check, 
  Info, 
  AlertTriangle,
  Heart,
  Layout,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Eye,
  LineChart
} from 'lucide-react';
import { ThemeType, FontSizeType, LineHeightType, LayoutType } from '../types';

interface SettingsSectionProps {
  theme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
  fontSize: FontSizeType;
  onChangeFontSize: (size: FontSizeType) => void;
  lineHeight: LineHeightType;
  onChangeLineHeight: (height: LineHeightType) => void;
  layoutType: LayoutType;
  onChangeLayoutType: (layout: LayoutType) => void;
  onBackup: () => void;
  onRestore: (jsonData: string) => boolean;
  fontSizeClass: string;
  onTriggerContact: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  theme,
  onChangeTheme,
  fontSize,
  onChangeFontSize,
  lineHeight,
  onChangeLineHeight,
  layoutType,
  onChangeLayoutType,
  onBackup,
  onRestore,
  fontSizeClass,
  onTriggerContact
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccess(null);
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contents = event.target?.result as string;
        const parsed = JSON.parse(contents);
        
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error("بې باوره منځپانګه");
        }

        const success = onRestore(contents);
        if (success) {
          setImportSuccess(true);
        } else {
          setImportError("دا فایل باوري بڼه نلري.");
        }
      } catch (err) {
        setImportError("فایل خراب دی یا سم پښتو بڼه نلري.");
      }
    };
    reader.readAsText(file);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Detailed styling descriptor list of our 10 beautiful themes
  const availableThemes: { id: ThemeType; name: string; bgBtn: string; textBtn: string; colorDot: string }[] = [
    { id: 'light', name: '۱. خالص سپین (کلاسیک)', bgBtn: 'bg-[#fbfbfa] text-stone-900 border-stone-200', textBtn: 'text-stone-750', colorDot: 'bg-[#000000]' },
    { id: 'dark', name: '۲. ښاري تیاره (زنځیر)', bgBtn: 'bg-[#09090b] text-[#f4f4f5] border-zinc-800', textBtn: 'text-[#a1a1aa]', colorDot: 'bg-[#f43f5e]' },
    { id: 'sepia', name: '۳. سېپيا آرام کوټه', bgBtn: 'bg-[#FAF6EE] text-[#432A15] border-amber-250', textBtn: 'text-[#78350f]', colorDot: 'bg-[#d97706]' },
    { id: 'emerald', name: '۴. زمرد شین (اسلامي)', bgBtn: 'bg-[#f0f9f4] text-[#064e3b] border-emerald-250', textBtn: 'text-[#047857]', colorDot: 'bg-[#10b981]' },
    { id: 'ocean', name: '۵. اسماني رڼا (آبي)', bgBtn: 'bg-[#f0fdfa] text-[#164e63] border-cyan-200', textBtn: 'text-[#0891b2]', colorDot: 'bg-[#06b6d4]' },
    { id: 'rose', name: '۶. ملغلره ګلابي (شاهي)', bgBtn: 'bg-[#fff1f2] text-[#881337] border-rose-200', textBtn: 'text-[#e11d48]', colorDot: 'bg-[#f43f5e]' },
    { id: 'coffee', name: '۷. کاهوه لمر (قهوه يي)', bgBtn: 'bg-[#fafaf9] text-[#451a03] border-amber-200/60', textBtn: 'text-[#b45309]', colorDot: 'bg-[#d97706]' },
    { id: 'lavender', name: '۸. لاونډر نرم غاټول', bgBtn: 'bg-[#faf5ff] text-[#4a044e] border-purple-250', textBtn: 'text-[#9c33ca]', colorDot: 'bg-[#c084fc]' },
    { id: 'crimson', name: '۹. سرې لمبې (طوفاني)', bgBtn: 'bg-[#fef2f2] text-[#7f1d1d] border-red-200', textBtn: 'text-[#dc2626]', colorDot: 'bg-[#ef4444]' },
    { id: 'navy', name: '۱۰. د کښتي ژور تور شین', bgBtn: 'bg-[#0f172a] text-[#f1f5f9] border-blue-900/60', textBtn: 'text-[#cbd5e1]', colorDot: 'bg-[#3b82f6]' }
  ];

  return (
    <div className="space-y-5 text-right select-none">
      
      {/* Intro Header banner */}
      <div className="p-4 bg-gradient-to-l from-rose-500/10 to-transparent dark:from-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-850">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-row-reverse">
          <div className="text-right">
            <h2 className="text-base font-black font-sans text-stone-900 dark:text-white flex items-center justify-end gap-2">
              <span>د اپلیکیشن سمونې او تنظیمات</span>
              <Database className="w-4 h-4 text-stone-500" />
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              دلته د ۱۰ مختلفو رنګارنګ تمونو پورته کول، د ازموینو حالتونه، او د ډیټا لیږد ملاتړ تنظیم کړئ.
            </p>
          </div>
          <button
            id="btn-settings-contact-developer"
            onClick={onTriggerContact}
            className="px-3.5 py-1.5 self-start sm:self-center bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black cursor-pointer transition-all flex items-center gap-1.5 flex-row-reverse"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>طالب العلم خبیب تکل سره اړیکه</span>
          </button>
        </div>
      </div>

      {/* THEME SELECTOR CARD: 10 BEAUTIFUL THEMES */}
      <div className="p-4 bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3">
        <h3 className="text-xs font-black text-stone-950 dark:text-white flex items-center gap-2 flex-row-reverse border-b border-stone-100 dark:border-zinc-850 pb-2">
          <Palette className="w-4 h-4 text-rose-500" />
          <span>د اپلکيشن لس ښایسته رنګونه او تمونه (۱۰ مختلف تمونه)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableThemes.map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                id={`theme-selector-btn-${item.id}`}
                onClick={() => onChangeTheme(item.id)}
                className={`p-2.5 rounded-xl border text-right text-[11px] font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 h-16 ${item.bgBtn} ${
                  isSelected ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-black scale-97' : 'hover:scale-98 opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-row-reverse w-full">
                  <span className={`h-2 w-2 rounded-full ${item.colorDot} shrink-0`} />
                  <span className="truncate">{item.name.split(' ')[1] || item.name}</span>
                </div>
                <span className={`text-[9px] font-mono font-medium ${item.textBtn} block truncate`}>
                  {item.id.toUpperCase()} بڼه
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* READING & VIEW SETTINGS CARD */}
      <div className="p-4 bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3.5">
        <h3 className="text-xs font-black text-stone-950 dark:text-white flex items-center gap-2 flex-row-reverse border-b border-stone-100 dark:border-zinc-850 pb-2">
          <Eye className="w-4 h-4 text-rose-500" />
          <span>دمطالعې پاڼې او محتوا پرمختللي تنظیمات</span>
        </h3>

        <div className="space-y-3">
          {/* FONT SIZE CONTROLLER */}
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 block">د لیکنې عمومی اندازه (رسم الخط)</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'sm', label: 'وړوکی (کوچنی)' },
                { id: 'md', label: 'طبیعي (منځنی)' },
                { id: 'lg', label: 'لوی (واضح)' },
                { id: 'xl', label: 'خورا غټ (روښانه)' }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`font-ctrl-btn-${item.id}`}
                  onClick={() => onChangeFontSize(item.id as FontSizeType)}
                  className={`py-1.5 px-0.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                    fontSize === item.id
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-605'
                  }`}
                >
                  {item.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* FONT LINE HEIGHT CONTROLLER */}
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 block">د افقي لیکنو ترمنځ فاصله (Line Spacing)</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'normal', label: 'تړلی (نورمال)' },
                { id: 'relaxed', label: 'آرام (مناسب)' },
                { id: 'loose', label: 'ارزانه (پراخه)' }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`lineheight-ctrl-btn-${item.id}`}
                  onClick={() => onChangeLineHeight(item.id as LineHeightType)}
                  className={`py-1.5 px-0.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                    lineHeight === item.id
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-605'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW TYPE LAYOUT TOGGLE */}
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 block">د لوستونو د کتګوریو ننداره (Layout Grid)</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'list', label: 'په عمودي لیست بڼه' },
                { id: 'grid', label: 'خپور پرمختللی ګریډ' }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`layout-ctrl-btn-${item.id}`}
                  onClick={() => onChangeLayoutType(item.id as LayoutType)}
                  className={`py-1.5 px-0.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                    layoutType === item.id
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-650'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* BACKUP & RESTORE */}
      <div className="p-4 bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3">
        <h3 className="text-xs font-black text-stone-950 dark:text-white flex items-center gap-2 flex-row-reverse border-b border-stone-100 dark:border-zinc-850 pb-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>پښتو ډیټا او د مسودو خوندیتوب</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center">
          <button
            id="settings-backup-btn"
            onClick={onBackup}
            className="flex items-center justify-center gap-1 py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>بیک اپ بڼه ډاونلوډ</span>
          </button>

          <button
            id="settings-restore-btn"
            onClick={triggerUploadClick}
            className="flex items-center justify-center gap-1 py-1.5 px-1 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 rounded-xl text-[10px] font-black cursor-pointer border border-stone-200 dark:border-zinc-700 hover:bg-stone-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ډیټا تایید راګرځول</span>
          </button>
          <input
            id="settings-restore-file-input"
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {importSuccess && (
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-center">
            بیک اپ فایل تایید شو، اپلیکیشن پاڼه بېرته چالان شوه!
          </div>
        )}
        {importError && (
          <div className="p-2 bg-rose-500/10 text-rose-505 dark:text-rose-405 border border-rose-500/20 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1 flex-row-reverse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ستونزه: {importError}</span>
          </div>
        )}
      </div>

      {/* FOOTER APP CREDITS */}
      <div className="text-center space-y-1.5 py-1 border-t border-stone-105 dark:border-stone-850/80 pt-3">
        <p className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center justify-center gap-1 select-none">
          <span>د رښتینې هڅې او مېړانې سره جوړ شوی</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
        </p>
        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium select-none">
          جمع او ترتيب: <span className="font-extrabold text-amber-600 dark:text-amber-500">الحاج ډاکټر صاحب فريدون احرار</span>
        </p>
        <p className="text-[9px] text-stone-450 select-none">
          اپلیکیشن جوړونکی: <span className="font-extrabold text-rose-500">طالب العلم خبيب تکل</span> د پښتو ویناوالۍ مالتړی © ۲۰۲۶
        </p>
      </div>

    </div>
  );
};
