import React from 'react';
import { Share2, Link2, ExternalLink, BrainCircuit, Zap } from 'lucide-react';
import { Note } from '../types';
import { useNeuralLink } from '../hooks/useNeuralLink';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RelationshipGraphProps {
  currentNote: Note;
  allNotes: Note[];
  onNoteSelect: (id: string) => void;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  currentNote,
  allNotes,
  onNoteSelect,
}) => {
  const recommendations = useNeuralLink(currentNote, allNotes);
  const detectedLinks = allNotes.filter(n => currentNote.relatedNoteIds.includes(n.id));

  return (
    <div className="p-8 bg-vault-card/40 rounded-[32px] border border-vault-border mt-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
          <BrainCircuit size={20} className="text-emerald-500" />
          Neural Links
        </h3>
        <div className="flex gap-4">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
            {detectedLinks.length} Detected
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
            {recommendations.length} Strategic
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {recommendations.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-4">Strategic Recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(note => (
                <button
                  key={note.id}
                  onClick={() => onNoteSelect(note.id)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Zap size={16} />
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                      {note.title || "Untitled"}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {detectedLinks.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Semantic Links</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detectedLinks.map(note => (
                <button
                  key={note.id}
                  onClick={() => onNoteSelect(note.id)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-vault-border hover:border-white/20 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2 rounded-xl bg-white/5 text-zinc-500">
                      <Link2 size={16} />
                    </div>
                    <span className="text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">
                      {note.title || "Untitled"}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-zinc-600 group-hover:text-white transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {recommendations.length === 0 && detectedLinks.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-sm italic font-medium">
            Neural link engine awaiting data input...
          </div>
        )}
      </div>
    </div>
  );
};
