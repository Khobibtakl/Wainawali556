import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Search, 
  X,
  BookOpen, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { NoteItem } from '../types';

interface NotesSectionProps {
  notes: NoteItem[];
  onAddNote: (title: string, content: string) => void;
  onEditNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  fontSizeClass: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  fontSizeClass
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Search filter
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreate = () => {
    setNoteTitle('');
    setNoteContent('');
    setIsCreating(true);
    setEditingId(null);
  };

  const handleStartEdit = (note: NoteItem) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditingId(note.id);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    if (editingId) {
      onEditNote(editingId, noteTitle.trim(), noteContent.trim());
    } else {
      onAddNote(noteTitle.trim(), noteContent.trim());
    }

    setIsCreating(false);
    setEditingId(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Intro Header banner */}
      <div className="p-5 bg-gradient-to-l from-emerald-500/10 to-transparent dark:from-emerald-950/20 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5">
        <h2 className="text-xl font-bold font-sans text-stone-900 dark:text-white sepia:text-amber-950 flex items-center justify-end gap-2">
          <span>شخصي یادښتونه او مسودې</span>
          <FileText className="w-5 h-5 text-emerald-500" />
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 sepia:text-amber-900/80 mt-1">
          خپلې ویناګانې، شعرونه، او د وینا چوکاټونه دلته په اسانۍ ولیکئ ترڅو په راتلونکي کې په غږیز ډول ورته تمرین وکړئ.
        </p>
      </div>

      {/* Control Actions / Search and Add Note Buttons */}
      {!isCreating && (
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <button
            id="btn-add-note-init"
            onClick={handleStartCreate}
            className="w-full md:w-auto px-5 py-3 bg-[#18181b] dark:bg-rose-500 sepia:bg-amber-900 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>نوی یادښت اضافه کړئ</span>
          </button>

          <div className="relative w-full md:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-search-notes"
              type="text"
              className="w-full text-right py-2.5 pl-10 pr-4 bg-stone-50 dark:bg-[#1e1e21] sepia:bg-[#f6f0dd] border border-stone-200 dark:border-stone-800 sepia:border-amber-200/50 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              placeholder="یادښتونو کې لټون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Editor & Creation Drawer Form */}
      <AnimatePresence mode="wait">
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-5 border border-stone-200 dark:border-stone-800 sepia:border-amber-200 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] rounded-2xl shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 flex-row-reverse">
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white sepia:text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>{editingId ? 'یادښت ایډیټ کول' : 'د نوي یادښت جوړول'}</span>
              </h3>
              <button 
                id="btn-cancel-note-top"
                onClick={handleCancel}
                className="p-1 text-stone-400 hover:text-rose-500 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 sepia:text-amber-900 mb-1">
                  سرلیک / موضوع:
                </label>
                <input
                  id="input-note-title"
                  type="text"
                  required
                  className="w-full text-right p-3 bg-stone-50 dark:bg-[#121214] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 text-xs text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-rose-500"
                  placeholder="لکه: د بريا زرين اصول وینا"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 sepia:text-amber-900 mb-1">
                  یاداښت / د غږ مسوده متن:
                </label>
                <textarea
                  id="textarea-note-content"
                  rows={6}
                  required
                  className="w-full text-right p-3 bg-stone-50 dark:bg-[#121214] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 text-xs text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-rose-500 leading-relaxed"
                  placeholder="دلته د خپلې وینا مقدمه او اصلي ټکي یو په بل پسې ولیکئ..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  id="btn-cancel-note-bot"
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 sepia:bg-[#eadebd] text-stone-700 dark:text-stone-300 sepia:text-amber-900 rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-200 transition-colors"
                >
                  بندول
                </button>
                <button
                  id="btn-save-note"
                  type="submit"
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
                >
                  خوندي کول
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes lists render */}
      {!isCreating && (
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="p-12 border border-dashed border-stone-200 dark:border-stone-800 text-center rounded-2xl text-stone-400 dark:text-stone-600">
              <FileText className="w-10 h-10 mx-auto stroke-1 text-stone-300 dark:text-stone-700 mb-2" />
              <p className="text-xs">هیڅ خوندي یادښتونه ونه موندل شول.</p>
              <button
                id="btn-create-first-note"
                onClick={handleStartCreate}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>لومړی یادښت اضافه کړئ</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  id={`note-card-${note.id}`}
                  className="p-5 bg-white dark:bg-[#18181b] sepia:bg-[#FAF6EE] border border-stone-200 dark:border-stone-800 sepia:border-amber-200 rounded-2xl shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between text-right"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <span className="p-1.5 bg-amber-500/10 text-amber-600 sepia:text-amber-900 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{note.createdAt}</span>
                      </span>
                    </div>

                    <h3 className={`font-bold font-sans text-stone-900 dark:text-white sepia:text-amber-950 ${
                      fontSizeClass === 'sm' ? 'text-sm' :
                      fontSizeClass === 'md' ? 'text-base' :
                      fontSizeClass === 'lg' ? 'text-lg' : 'text-xl'
                    }`}>
                      {note.title}
                    </h3>

                    <p className={`text-stone-600 dark:text-stone-450 sepia:text-amber-900/80 leading-relaxed whitespace-pre-wrap ${
                      fontSizeClass === 'sm' ? 'text-xs' :
                      fontSizeClass === 'md' ? 'text-xs md:text-sm' :
                      fontSizeClass === 'lg' ? 'text-sm md:text-base' : 'text-base md:text-lg'
                    }`}>
                      {note.content}
                    </p>
                  </div>

                  {/* Actions layout */}
                  <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80">
                    <button
                      id={`btn-edit-note-${note.id}`}
                      onClick={() => handleStartEdit(note)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-rose-500 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
                      title="سرلیک او متن سمول"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-note-${note.id}`}
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                      title="یادښت ایستل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
