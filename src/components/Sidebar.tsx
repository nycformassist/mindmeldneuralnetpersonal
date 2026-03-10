import React, { useState } from 'react';
import { Search, Plus, Shield, Zap, Heart, Crown, Trash2 } from 'lucide-react';
import { Note, PillarType } from '../types';
import { cn, formatDate } from '../lib/utils';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PILLAR_ICONS: Record<PillarType, React.ElementType> = {
  MODERN_MINISTRY: Crown,
  HUMAN_ANCHOR: Heart,
  LEAPFROG_INITIATIVE: Zap,
  SOTHIC_GATEKEEPER: Shield,
};

const PILLAR_COLORS: Record<PillarType, string> = {
  MODERN_MINISTRY: 'text-amber-400 bg-amber-400/10',
  HUMAN_ANCHOR: 'text-rose-400 bg-rose-400/10',
  LEAPFROG_INITIATIVE: 'text-emerald-400 bg-emerald-400/10',
  SOTHIC_GATEKEEPER: 'text-indigo-400 bg-indigo-400/10',
};

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}) => {
  const [hoverNoteId, setHoverNoteId] = useState<string | null>(null);

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remove this note from the vault?')) {
      onDeleteNote(id);
    }
  };

  return (
    <div className="w-80 h-full bg-vault-sidebar border-r border-vault-border flex flex-col overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">Vault</h1>
          <button
            onClick={onNewNote}
            className="w-10 h-10 rounded-full bg-emerald-500 text-vault-bg flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
            title="New note"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-vault-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 custom-scrollbar">
        {filteredNotes.length === 0 && (
          <p className="text-center text-zinc-600 text-xs py-8 italic">
            {searchQuery ? 'No matching notes.' : 'Your vault is empty.'}
          </p>
        )}

        {filteredNotes.map(note => {
          const PillarIcon = note.pillarType ? PILLAR_ICONS[note.pillarType] : null;
          const isActive = activeNoteId === note.id;
          const isHovered = hoverNoteId === note.id;

          return (
            <button
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              onMouseEnter={() => setHoverNoteId(note.id)}
              onMouseLeave={() => setHoverNoteId(null)}
              className={cn(
                'w-full text-left p-5 rounded-[24px] transition-all duration-300 group relative',
                isActive ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      'font-semibold truncate text-base',
                      isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    )}
                  >
                    {note.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {note.pillarType && PillarIcon && (
                      <div className={cn('p-1.5 rounded-lg', PILLAR_COLORS[note.pillarType])}>
                        <PillarIcon size={12} />
                      </div>
                    )}
                    {isHovered && (
                      <button
                        onClick={e => handleDelete(e, note.id)}
                        className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-500 line-clamp-2 leading-snug">
                  {note.content || 'No content'}
                </p>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.relatedNoteIds.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      {note.relatedNoteIds.length} link{note.relatedNoteIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
