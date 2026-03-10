/**
 * MasterStackPanel.tsx — Neural Vault v3.0 GOD MODE
 * 
 * The Master Stack ingestion interface.
 * Drop in bulk raw material (notes, articles, transcripts) and let 
 * Gemini deconstruct it into Atomic Units tagged to the 4 Pillars.
 * 
 * Each Atomic Unit can be:
 * - Saved as a new note
 * - Sent directly to Synthesis Preview
 * - Dismissed
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers, Loader2, Plus, Trash2, BookOpen, Zap,
  ArrowRight, Star, CheckSquare, ChevronDown
} from 'lucide-react';
import { AtomicUnit, deconstructMasterStack } from '../services/geminiSynthesis';
import { PILLAR_LABELS, PILLAR_DESCRIPTIONS } from '../services/valentineVoice';

interface MasterStackPanelProps {
  isOnline: boolean;
  onCreateNote: (title: string, content: string, pillarType: string) => void;
}

const PILLAR_COLORS: Record<string, string> = {
  MODERN_MINISTRY: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  HUMAN_ANCHOR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  LEAPFROG_INITIATIVE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  SOTHIC_GATEKEEPER: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  quote: '💬',
  fact: '📊',
  hook: '🪝',
  strategy: '⚡',
  story: '📖',
};

function StrengthBar({ strength }: { strength: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            i < strength ? 'bg-emerald-400' : 'bg-zinc-700'
          }`}
        />
      ))}
      <span className="text-[10px] text-zinc-500 ml-1">{strength}/10</span>
    </div>
  );
}

function AtomicUnitCard({
  unit,
  onSaveAsNote,
  onDismiss,
}: {
  unit: AtomicUnit;
  onSaveAsNote: (unit: AtomicUnit) => void;
  onDismiss: (id: string) => void;
}) {
  const pillarColor = PILLAR_COLORS[unit.suggestedPillar] ?? 'bg-zinc-700/20 text-zinc-400 border-zinc-700';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="rounded-xl border border-white/5 bg-zinc-900/60 p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{TYPE_ICONS[unit.type] ?? '•'}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{unit.type}</span>
        </div>
        <button
          onClick={() => onDismiss(unit.id)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <p className="text-sm text-zinc-200 leading-relaxed">{unit.content}</p>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillarColor}`}>
            {PILLAR_LABELS[unit.suggestedPillar] ?? unit.suggestedPillar}
          </span>
          <StrengthBar strength={unit.strength} />
        </div>
        <button
          onClick={() => onSaveAsNote(unit)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-bold"
        >
          <Plus size={12} />
          Save as Note
        </button>
      </div>
    </motion.div>
  );
}

export function MasterStackPanel({ isOnline, onCreateNote }: MasterStackPanelProps) {
  const [rawStack, setRawStack] = useState('');
  const [units, setUnits] = useState<AtomicUnit[]>([]);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleDeconstruct = async () => {
    if (!rawStack.trim() || !isOnline) return;
    setIsDeconstructing(true);
    setError(null);
    try {
      const result = await deconstructMasterStack(rawStack);
      setUnits(result);
    } catch (e: any) {
      setError(e.message ?? 'Deconstruction failed.');
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleSaveAsNote = (unit: AtomicUnit) => {
    const typeLabel = unit.type.charAt(0).toUpperCase() + unit.type.slice(1);
    const title = `[${typeLabel}] ${unit.content.substring(0, 50)}${unit.content.length > 50 ? '...' : ''}`;
    onCreateNote(title, unit.content, unit.suggestedPillar);
    setSavedCount(c => c + 1);
    handleDismiss(unit.id);
  };

  const handleDismiss = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const handleSaveAll = () => {
    units.forEach(unit => handleSaveAsNote(unit));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layers size={16} className="text-cyan-400" />
        <span className="text-sm font-bold tracking-wide text-zinc-200">Master Stack</span>
        <span className="text-[10px] text-zinc-500">→ Atomic Units</span>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        Drop in any raw material — meeting notes, transcripts, articles, ideas. Gemini deconstructs it into deployable Atomic Units, each tagged to a Pillar.
      </p>

      {/* Input */}
      <textarea
        value={rawStack}
        onChange={e => setRawStack(e.target.value)}
        placeholder="Paste your Master Stack here... notes from the Bronx route, client conversations, strategy sessions, articles you read..."
        className="w-full h-40 bg-zinc-900/80 border border-white/5 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-cyan-500/30 focus:bg-zinc-900 transition-colors font-mono"
      />

      <button
        onClick={handleDeconstruct}
        disabled={!rawStack.trim() || isDeconstructing || !isOnline}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
      >
        {isDeconstructing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Deconstructing Stack...
          </>
        ) : (
          <>
            <Zap size={16} />
            Deconstruct into Atomic Units
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Units */}
      <AnimatePresence mode="popLayout">
        {units.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-bold">
                {units.length} Atomic Unit{units.length !== 1 ? 's' : ''} extracted
              </span>
              {units.length > 1 && (
                <button
                  onClick={handleSaveAll}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <CheckSquare size={12} />
                  Save All
                </button>
              )}
            </div>

            {units.map(unit => (
              <AtomicUnitCard
                key={unit.id}
                unit={unit}
                onSaveAsNote={handleSaveAsNote}
                onDismiss={handleDismiss}
              />
            ))}

            {savedCount > 0 && units.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-emerald-400 py-4 font-bold"
              >
                ✓ {savedCount} unit{savedCount !== 1 ? 's' : ''} saved to vault
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
