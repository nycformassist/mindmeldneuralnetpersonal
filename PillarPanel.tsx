/**
 * PillarPanel.tsx — Neural Vault v3.0 GOD MODE
 * 
 * Right-side panel. Now has 4 tabs:
 * 1. Pillars (original — assign Pillar type)
 * 2. Synthesis (new — 4-Pillar content generation preview)
 * 3. Master Stack (new — bulk input deconstruction)
 * 4. Import (new — URL/PDF/Image ingestion)
 */

import React, { useState } from 'react';
import { Note } from '../types';
import { Layers, Zap, Upload, Tag } from 'lucide-react';
import { SynthesisPreview } from './SynthesisPreview';
import { MasterStackPanel } from './MasterStackPanel';
import { SourceImport } from './SourceImport';
import { PILLAR_LABELS, PILLAR_DESCRIPTIONS } from '../services/valentineVoice';

interface PillarPanelProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  isOnline: boolean;
  onCreateNote: (title: string, content: string, pillarType: string) => void;
}

type PanelTab = 'pillars' | 'synthesis' | 'stack' | 'import';

const PILLARS = [
  { key: 'MODERN_MINISTRY', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20' },
  { key: 'HUMAN_ANCHOR', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { key: 'LEAPFROG_INITIATIVE', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { key: 'SOTHIC_GATEKEEPER', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20' },
];

const TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'pillars', label: 'Pillars', icon: <Tag size={12} /> },
  { id: 'synthesis', label: 'Synthesize', icon: <Zap size={12} /> },
  { id: 'stack', label: 'Stack', icon: <Layers size={12} /> },
  { id: 'import', label: 'Import', icon: <Upload size={12} /> },
];

export function PillarPanel({ note, onUpdate, isOnline, onCreateNote }: PillarPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('pillars');

  return (
    <div className="h-full flex flex-col bg-[#0d0d0f] border-l border-white/5">
      {/* Tab bar */}
      <div className="flex border-b border-white/5 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'pillars' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-zinc-500" />
              <span className="text-sm font-bold text-zinc-300">Assign Pillar</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every note feeds into your Megalithic Commandment Framework. Tag it to amplify its strategic reach.
            </p>

            {PILLARS.map(p => {
              const isActive = note.pillarType === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onUpdate({ pillarType: isActive ? undefined : (p.key as any) })}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isActive
                      ? p.color + ' ring-1 ring-offset-0'
                      : 'border-white/5 text-zinc-500 bg-zinc-900/40 hover:bg-zinc-900/80 hover:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{PILLAR_LABELS[p.key]}</div>
                  <div className="text-[11px] opacity-70 leading-relaxed">{PILLAR_DESCRIPTIONS[p.key]}</div>
                </button>
              );
            })}

            {note.pillarType && (
              <button
                onClick={() => onUpdate({ pillarType: undefined })}
                className="text-xs text-zinc-600 hover:text-zinc-400 text-center mt-2 transition-colors"
              >
                Clear Pillar
              </button>
            )}
          </div>
        )}

        {activeTab === 'synthesis' && (
          <SynthesisPreview note={note} isOnline={isOnline} />
        )}

        {activeTab === 'stack' && (
          <MasterStackPanel isOnline={isOnline} onCreateNote={onCreateNote} />
        )}

        {activeTab === 'import' && (
          <SourceImport isOnline={isOnline} onCreateNote={onCreateNote} />
        )}
      </div>
    </div>
  );
}
