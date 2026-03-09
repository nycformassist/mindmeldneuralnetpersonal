import React, { useRef } from 'react';
import Markdown from 'react-markdown';
import { Note } from '../types';
import { Maximize2, Minimize2, Edit3, Eye, Type } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  transcript?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  note, 
  onUpdate, 
  isFocusMode, 
  onToggleFocus,
  transcript 
}) => {
  const [isPreview, setIsPreview] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Append transcript at cursor position
  React.useEffect(() => {
    if (transcript && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      onUpdate({ content: before + transcript + after });
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + transcript.length;
        textarea.focus();
      }, 0);
    }
  }, [transcript]);

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full bg-vault-bg transition-all duration-500",
      isFocusMode ? "max-w-4xl mx-auto" : "w-full"
    )}>
      <div className="h-20 border-b border-vault-border flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Note Title"
            className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full placeholder:text-zinc-700"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-2.5 rounded-2xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? <Edit3 size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={onToggleFocus}
            className={cn(
              "p-2.5 rounded-2xl transition-all",
              isFocusMode ? "bg-emerald-500 text-vault-bg" : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            )}
            title="Focus Mode"
          >
            {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className={cn(
          "mx-auto h-full transition-all duration-500",
          isFocusMode ? "max-w-2xl" : "max-w-4xl"
        )}>
          <AnimatePresence mode="wait">
            {isPreview ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="markdown-body"
              >
                <Markdown>{note.content || "_No content. Start your neural download..._"}</Markdown>
              </motion.div>
            ) : (
              <motion.textarea
                key="editor"
                ref={textareaRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                value={note.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Start typing or use the mic..."
                className="w-full h-full bg-transparent text-zinc-200 resize-none focus:outline-none font-sans leading-relaxed text-xl placeholder:text-zinc-800"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
