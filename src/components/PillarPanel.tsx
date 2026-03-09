import React from 'react';
import { Crown, Heart, Zap, Shield, Sparkles, Copy, Check, Loader2, ChevronRight } from 'lucide-react';
import { Note, PillarType } from '../types';
import { generatePillarContent } from '../services/geminiService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PillarPanelProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

const PILLARS = [
  { id: 'MODERN_MINISTRY', name: 'Modern Ministry', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'Visionary & Stoic' },
  { id: 'HUMAN_ANCHOR', name: 'Human Anchor', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10', desc: 'Warm & Relatable' },
  { id: 'LEAPFROG_INITIATIVE', name: 'Leapfrog Initiative', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Disruptive & Fast' },
  { id: 'SOTHIC_GATEKEEPER', name: 'Sothic Gatekeeper', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Protective & Elite' },
];

export const PillarPanel: React.FC<PillarPanelProps> = ({ note, onUpdate }) => {
  const [loading, setLoading] = React.useState<PillarType | null>(null);
  const [outputs, setOutputs] = React.useState<Record<string, string>>({});
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleGenerate = async (type: PillarType) => {
    if (!note.content) return;
    setLoading(type);
    try {
      const content = await generatePillarContent(note, type);
      setOutputs(prev => ({ ...prev, [type]: content }));
      onUpdate({ pillarType: type });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-96 h-full bg-vault-sidebar border-l border-vault-border flex flex-col overflow-hidden">
      <div className="p-8 border-b border-vault-border shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Sparkles size={24} className="text-emerald-500" />
          Factory
        </h2>
        <p className="text-sm text-zinc-500 mt-2">Synthesize through Megalithic Pillars.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {PILLARS.map((pillar) => (
          <div key={pillar.id} className="space-y-4">
            <button
              onClick={() => handleGenerate(pillar.id as PillarType)}
              disabled={loading !== null || !note.content}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-[24px] transition-all group",
                note.pillarType === pillar.id ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", pillar.bg, pillar.color)}>
                  <pillar.icon size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">{pillar.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{pillar.desc}</p>
                </div>
              </div>
              {loading === pillar.id ? (
                <Loader2 size={16} className="animate-spin text-emerald-500" />
              ) : (
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {outputs[pillar.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative group bg-vault-bg border border-vault-border rounded-[24px] p-5 mt-2">
                    <div className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar">
                      {outputs[pillar.id]}
                    </div>
                    <button
                      onClick={() => copyToClipboard(outputs[pillar.id], pillar.id)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-vault-border text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      {copied === pillar.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
