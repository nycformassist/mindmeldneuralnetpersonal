import React from 'react';
import { Note, PillarType } from '../types';
import { motion } from 'motion/react';
import { BookOpen, Heart, Zap, Shield, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface PillarPanelProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

const PILLARS = [
  {
    id: 'MODERN_MINISTRY' as PillarType,
    name: 'Modern Ministry',
    icon: <BookOpen size={20} />,
    description: 'Visionary leadership & philosophical strategy.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    id: 'HUMAN_ANCHOR' as PillarType,
    name: 'Human Anchor',
    icon: <Heart size={20} />,
    description: 'Community grounding & shared human values.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  {
    id: 'LEAPFROG_INITIATIVE' as PillarType,
    name: 'Leapfrog Initiative',
    icon: <Zap size={20} />,
    description: 'Tactical disruption & next-gen innovation.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  },
  {
    id: 'SOTHIC_GATEKEEPER' as PillarType,
    name: 'Sothic Gatekeeper',
    icon: <Shield size={20} />,
    description: 'Protective intelligence & elite boundaries.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  }
];

export const PillarPanel: React.FC<PillarPanelProps> = ({ note, onUpdate }) => {
  return (
    <div className="h-full bg-vault-card border-l border-white/5 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Sparkles className="text-emerald-500" size={20} />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Strategic Synthesis
        </h2>
      </div>

      <div className="space-y-4">
        {PILLARS.map((pillar) => (
          <button
            key={pillar.id}
            onClick={() => onUpdate({ pillarType: pillar.id })}
            className={cn(
              "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
              note.pillarType === pillar.id 
                ? `${pillar.bg} ${pillar.border} border-opacity-100 shadow-lg` 
                : "bg-transparent border-white/5 hover:bg-white/5"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                note.pillarType === pillar.id ? "bg-white/10" : "bg-zinc-900 group-hover:bg-zinc-800"
              )}>
                <div className={note.pillarType === pillar.id ? pillar.color : "text-zinc-500"}>
                  {pillar.icon}
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-sm mb-1",
                  note.pillarType === pillar.id ? "text-white" : "text-zinc-400"
                )}>
                  {pillar.name}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-[#0a0a0a] border border-white/5">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-2">
          Pillar Status
        </h4>
        <p className="text-xs text-zinc-400 italic">
          Select a pillar to re-frame this note's intelligence within your knowledge vault.
        </p>
      </div>
    </div>
  );
};