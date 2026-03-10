/**
 * SynthesisPreview.tsx — Neural Vault v3.0 GOD MODE
 * 
 * THE FIREWALL GATE. This is where raw notes become deployable content.
 * 
 * STEALTH MODE GUARANTEE: This component generates drafts and previews them.
 * Nothing leaves the vault until the user explicitly approves and copies.
 * Autonomous posting is a future sprint — this UI is the audit checkpoint.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Twitter, Linkedin, Video, Instagram,
  Copy, Check, ChevronDown, ChevronUp, Zap, Lock,
  RefreshCw, AlertTriangle, Loader2
} from 'lucide-react';
import { Note } from '../types';
import { synthesizeNote, SynthesisResult, PlatformDraft } from '../services/geminiSynthesis';
import { PILLAR_DESCRIPTIONS } from '../services/valentineVoice';

interface SynthesisPreviewProps {
  note: Note;
  isOnline: boolean;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <Twitter size={14} />,
  linkedin: <Linkedin size={14} />,
  tiktok: <Video size={14} />,
  instagram: <Instagram size={14} />,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  linkedin: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  tiktok: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
  instagram: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

const PILLAR_COLORS: Record<string, string> = {
  MODERN_MINISTRY: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  HUMAN_ANCHOR: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
  LEAPFROG_INITIATIVE: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
  SOTHIC_GATEKEEPER: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
};

function DraftCard({ draft }: { draft: PlatformDraft }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = `${draft.content}\n\n${draft.cta}: ${draft.ctaUrl}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorClass = PLATFORM_COLORS[draft.platform] ?? 'text-zinc-400 border-zinc-700 bg-zinc-800/50';

  return (
    <div className={`rounded-xl border p-4 ${colorClass} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          {PLATFORM_ICONS[draft.platform]}
          {draft.platform}
        </div>
        <span className="text-[10px] text-zinc-500">{draft.charCount} chars</span>
      </div>

      <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{draft.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="text-[10px] text-zinc-500">
          CTA: <span className="text-zinc-300">{draft.cta}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy Draft'}
        </button>
      </div>
    </div>
  );
}

function PillarResultCard({ result }: { result: SynthesisResult }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter');

  const colorClass = PILLAR_COLORS[result.pillar] ?? 'from-zinc-700/20 to-zinc-800/10 border-zinc-700 text-zinc-400';
  const activeDraft = result.drafts.find(d => d.platform === selectedPlatform);

  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-gradient-to-br p-5 flex flex-col gap-4 ${colorClass}`}
    >
      <button
        className="flex items-start justify-between gap-3 text-left w-full"
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <p className="font-bold text-sm tracking-wide">{result.pillarLabel}</p>
          <p className="text-xs text-zinc-400 mt-1 italic">{result.angle}</p>
        </div>
        {expanded ? <ChevronUp size={16} className="shrink-0 mt-0.5" /> : <ChevronDown size={16} className="shrink-0 mt-0.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Platform tabs */}
            <div className="flex gap-2 flex-wrap">
              {result.drafts.map(d => (
                <button
                  key={d.platform}
                  onClick={() => setSelectedPlatform(d.platform)}
                  className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-all border ${
                    selectedPlatform === d.platform
                      ? PLATFORM_COLORS[d.platform]
                      : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {PLATFORM_ICONS[d.platform]}
                  {d.platform}
                </button>
              ))}
            </div>

            {activeDraft && <DraftCard draft={activeDraft} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SynthesisPreview({ note, isOnline }: SynthesisPreviewProps) {
  const [results, setResults] = useState<SynthesisResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const runSynthesis = useCallback(async () => {
    if (!isOnline) return;
    setIsRunning(true);
    setError(null);
    setHasRun(false);

    try {
      const synthesis = await synthesizeNote(note);
      setResults(synthesis);
      setHasRun(true);
    } catch (e: any) {
      setError(e.message ?? 'Synthesis failed. Check console.');
    } finally {
      setIsRunning(false);
    }
  }, [note, isOnline]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <span className="text-sm font-bold tracking-wide text-zinc-200">Synthesis Preview</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">
            Firewall Gate
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
          <Lock size={10} />
          STEALTH MODE
        </div>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        Generates 4-Pillar content drafts from this note. <strong className="text-zinc-400">Nothing posts automatically.</strong> Review, copy, and deploy manually.
      </p>

      {/* Trigger button */}
      <button
        onClick={runSynthesis}
        disabled={isRunning || !isOnline || !note.content}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Running 4-Pillar Rotation...
          </>
        ) : hasRun ? (
          <>
            <RefreshCw size={16} />
            Re-Synthesize
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Synthesize This Note
          </>
        )}
      </button>

      {!isOnline && (
        <p className="text-xs text-amber-400 text-center">Synthesis requires an internet connection.</p>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 text-center">
              — 4 Pillar Drafts Ready —
            </div>
            {results.map(result => (
              <PillarResultCard key={result.pillar} result={result} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
