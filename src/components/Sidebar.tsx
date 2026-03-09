import React from 'react';
import { Search, Plus, Hash, Clock, Shield, Zap, Heart, Crown } from 'lucide-react';
import { Note, PillarType } from '../types';
import { cn, formatDate } from '../lib/utils';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PILLAR_ICONS: Record<PillarType, any> = {
  MODERN_MINISTRY: Crown,
  HUMAN_ANCHOR: Heart,
  LEAPFROG_INITIATIVE: Zap,
  SOTHIC_GATEKEEPER: Shield
};

const PILLAR_COLORS: Record<PillarType, string> = {
  MODERN_MINISTRY: 'text-amber-400 bg-amber-400/10',
  HUMAN_ANCHOR: 'text-rose-400 bg-rose-400/10',
  LEAPFROG_INITIATIVE: 'text-emerald-400 bg-emerald-400/10',
  SOTHIC_GATEKEEPER: 'text-indigo-400 bg-indigo-400/10'
};

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onNoteSelect,
  onNewNote,
  searchQuery,
  onSearchChange,
}) => {
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-vault-sidebar border-r border-vault-border flex flex-col overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">Vault</h1>
          <button 
            onClick={onNewNote}
            className="w-10 h-10 rounded-full bg-emerald-500 text-vault-bg flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-vault-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 custom-scrollbar">
        {filteredNotes.map((note) => {
          const PillarIcon = note.pillarType ? PILLAR_ICONS[note.pillarType] : null;
          return (
            <button
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              className={cn(
                "w-full text-left p-5 rounded-[24px] transition-all duration-300 group relative",
                activeNoteId === note.id 
                  ? "bg-white/10 shadow-xl" 
                  : "hover:bg-white/5"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn(
                    "font-semibold truncate text-base",
                    activeNoteId === note.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {note.title || "Untitled"}
                  </h3>
                  {note.pillarType && PillarIcon && (
                    <div className={cn("p-1.5 rounded-lg shrink-0", PILLAR_COLORS[note.pillarType])}>
                      <PillarIcon size={12} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-snug">
                  {note.content || "No content"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
