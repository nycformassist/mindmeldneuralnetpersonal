/**
 * SourceImport.tsx — Neural Vault v3.0 GOD MODE
 * 
 * Multi-source ingestion interface.
 * Pull intelligence from anywhere — URLs, PDFs, images — directly into
 * the vault as Atomic Units ready for synthesis.
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link, FileText, Image, Upload, Loader2, Plus,
  AlertTriangle, CheckCircle, Globe
} from 'lucide-react';
import { importFromUrl, importFromBase64, ImportedSource, AtomicUnit } from '../services/geminiSynthesis';
import { PILLAR_LABELS } from '../services/valentineVoice';

interface SourceImportProps {
  isOnline: boolean;
  onCreateNote: (title: string, content: string, pillarType: string) => void;
}

type ImportTab = 'url' | 'file';

const PILLAR_COLORS: Record<string, string> = {
  MODERN_MINISTRY: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  HUMAN_ANCHOR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  LEAPFROG_INITIATIVE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  SOTHIC_GATEKEEPER: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

function ImportedSourceCard({
  source,
  onSaveUnit,
}: {
  source: ImportedSource;
  onSaveUnit: (unit: AtomicUnit, source: ImportedSource) => void;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {source.sourceType === 'url' ? (
          <Globe size={12} className="text-zinc-500" />
        ) : source.sourceType === 'pdf' ? (
          <FileText size={12} className="text-zinc-500" />
        ) : (
          <Image size={12} className="text-zinc-500" />
        )}
        <span className="text-[11px] text-zinc-400 truncate">{source.sourceLabel}</span>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">{source.rawContent.substring(0, 200)}...</p>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">
          {source.atomicUnits.length} Atomic Unit{source.atomicUnits.length !== 1 ? 's' : ''} found
        </span>
        {source.atomicUnits.map(unit => (
          <div
            key={unit.id}
            className="flex items-start justify-between gap-3 rounded-lg bg-zinc-800/60 p-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-200 leading-relaxed">{unit.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PILLAR_COLORS[unit.suggestedPillar] ?? 'bg-zinc-700/20 text-zinc-400 border-zinc-700'}`}>
                  {PILLAR_LABELS[unit.suggestedPillar] ?? unit.suggestedPillar}
                </span>
                <span className="text-[9px] text-zinc-600">strength {unit.strength}/10</span>
              </div>
            </div>
            <button
              onClick={() => onSaveUnit(unit, source)}
              className="shrink-0 flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-bold"
            >
              <Plus size={10} />
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SourceImport({ isOnline, onCreateNote }: SourceImportProps) {
  const [tab, setTab] = useState<ImportTab>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedSources, setImportedSources] = useState<ImportedSource[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUrlImport = async () => {
    if (!urlInput.trim() || !isOnline) return;
    setIsLoading(true);
    setError(null);
    try {
      const source = await importFromUrl(urlInput.trim());
      setImportedSources(prev => [source, ...prev]);
      setUrlInput('');
    } catch (e: any) {
      setError(e.message ?? 'URL import failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOnline) return;

    const mimeType = file.type as 'application/pdf' | 'image/jpeg' | 'image/png';
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Supported formats: PDF, JPEG, PNG');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Strip data URI prefix
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });

      const source = await importFromBase64(base64, mimeType, file.name);
      setImportedSources(prev => [source, ...prev]);
    } catch (e: any) {
      setError(e.message ?? 'File import failed.');
    } finally {
      setIsLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSaveUnit = (unit: AtomicUnit, source: ImportedSource) => {
    const title = `[Import] ${unit.content.substring(0, 50)}${unit.content.length > 50 ? '...' : ''}`;
    const content = `${unit.content}\n\n---\nSource: ${source.sourceLabel}`;
    onCreateNote(title, content, unit.suggestedPillar);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Upload size={16} className="text-violet-400" />
        <span className="text-sm font-bold tracking-wide text-zinc-200">Source Import</span>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        Import intelligence from any source. Gemini extracts Atomic Units automatically.
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-white/5">
        {(['url', 'file'] as ImportTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === t
                ? 'bg-white/10 text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {t === 'url' ? <Link size={12} /> : <Upload size={12} />}
            {t === 'url' ? 'URL' : 'PDF / Image'}
          </button>
        ))}
      </div>

      {/* URL input */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUrlImport()}
            placeholder="https://article-url.com"
            className="flex-1 bg-zinc-900/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500/30 transition-colors"
          />
          <button
            onClick={handleUrlImport}
            disabled={!urlInput.trim() || isLoading || !isOnline}
            className="px-4 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-400 transition-colors disabled:opacity-40"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      )}

      {/* File input */}
      {tab === 'file' && (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading || !isOnline}
          className="w-full py-8 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          <span className="text-xs font-bold">
            {isLoading ? 'Processing...' : 'Click to upload PDF or Image'}
          </span>
          <span className="text-[10px] text-zinc-600">PDF · JPEG · PNG</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,image/jpeg,image/png"
        onChange={handleFileImport}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertTriangle size={12} />
          {error}
        </div>
      )}

      {!isOnline && (
        <p className="text-xs text-amber-400 text-center">Source import requires internet connection.</p>
      )}

      {/* Imported sources */}
      <AnimatePresence mode="popLayout">
        {importedSources.map(source => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ImportedSourceCard source={source} onSaveUnit={handleSaveUnit} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
