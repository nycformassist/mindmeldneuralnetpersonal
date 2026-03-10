/**
 * App.tsx — Neural Vault v3.0 GOD MODE
 * 
 * Full system integration:
 * - gemini-2.5-flash-lite (model updated from retiring 2.0-flash)
 * - Synthesis Preview (Firewall Gate)
 * - Master Stack deconstruction
 * - Source Import (URL / PDF / Image)
 * - Voice capture (race condition fixed in v2)
 * - Offline queue
 * - Pillar auto-suggestion
 * - Delete notes
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { PillarPanel } from './components/PillarPanel';
import { RelationshipGraph } from './components/RelationshipGraph';
import { VoiceToText } from './components/VoiceToText';
import { Note } from './types';
import { detectRelationships, suggestPillar } from './services/geminiService';
import { cn } from './lib/utils';
import { Loader2, BrainCircuit, Sparkles, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'neural_vault_notes_v3';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pillarSuggestion, setPillarSuggestion] = useState<string | null>(null);
  const pendingAnalysisQueue = useRef<Set<string>>(new Set());

  // ─── Online / offline detection ─────────────────────────────────────────────
  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  // Flush pending analysis queue when back online
  useEffect(() => {
    if (isOnline && pendingAnalysisQueue.current.size > 0) {
      const queue = [...pendingAnalysisQueue.current];
      pendingAnalysisQueue.current.clear();
      queue.forEach(noteId => {
        const note = notes.find(n => n.id === noteId);
        if (note) runAnalysis(note);
      });
    }
  }, [isOnline]);

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Note[] = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) setActiveNoteId(parsed[0].id);
      } catch (e) {
        console.error('Failed to parse saved notes', e);
      }
    } else {
      const welcomeNote: Note = {
        id: crypto.randomUUID(),
        title: 'Neural Vault: Genesis',
        content:
          '# Megalithic Commandment Framework\n\nWelcome to your Knowledge Clone. Every note feeds into your 4 strategic pillars.\n\n### GOD MODE is active:\n- **Synthesis Preview** — turn any note into 4-platform content drafts\n- **Master Stack** — drop raw material, get Atomic Units\n- **Source Import** — ingest URLs, PDFs, and images\n- **Voice Capture** — speak directly into the vault\n\n### Pillars:\n- **Modern Ministry**: Visionary leadership.\n- **Human Anchor**: Community grounding.\n- **Leapfrog Initiative**: Tactical disruption.\n- **Sothic Gatekeeper**: Protective intelligence.',
        updatedAt: Date.now(),
        tags: ['genesis', 'framework'],
        pillarType: 'MODERN_MINISTRY',
        relatedNoteIds: [],
      };
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
    }
    setIsLoaded(true);
  }, []);

  // ─── Persistent storage sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const activeNote = useMemo(
    () => notes.find(n => n.id === activeNoteId) ?? null,
    [notes, activeNoteId]
  );

  // ─── Note mutations ───────────────────────────────────────────────────────────
  const updateNote = useCallback(
    (updates: Partial<Note>) => {
      if (!activeNoteId) return;
      setNotes(prev =>
        prev.map(n =>
          n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      );
    },
    [activeNoteId]
  );

  const handleNewNote = useCallback((
    title: string = '',
    content: string = '',
    pillarType?: string
  ) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      updatedAt: Date.now(),
      tags: [],
      relatedNoteIds: [],
      ...(pillarType ? { pillarType: pillarType as any } : {}),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsFocusMode(false);
    setPillarSuggestion(null);
  }, []);

  // Used by MasterStack and SourceImport to create notes programmatically
  const handleCreateNote = useCallback((
    title: string,
    content: string,
    pillarType: string
  ) => {
    handleNewNote(title, content, pillarType);
  }, [handleNewNote]);

  const handleDeleteNote = useCallback(
    (id: string) => {
      setNotes(prev => {
        const updated = prev.filter(n => n.id !== id);
        if (activeNoteId === id) {
          setActiveNoteId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });
    },
    [activeNoteId]
  );

  // ─── Voice transcript injection (race-condition-free) ─────────────────────────
  const handleTranscript = useCallback(
    (text: string) => {
      if (!activeNoteId) return;
      setNotes(prev =>
        prev.map(n => {
          if (n.id !== activeNoteId) return n;
          const separator = n.content && !n.content.endsWith(' ') ? ' ' : '';
          return { ...n, content: n.content + separator + text, updatedAt: Date.now() };
        })
      );
    },
    [activeNoteId]
  );

  // ─── Pillar auto-suggestion ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activeNote || activeNote.pillarType) {
      setPillarSuggestion(null);
      return;
    }
    const suggestion = suggestPillar(activeNote.content);
    setPillarSuggestion(suggestion);
  }, [activeNote?.content, activeNote?.pillarType]);

  // ─── Gemini semantic analysis ─────────────────────────────────────────────────
  const runAnalysis = async (note: Note) => {
    setIsAnalyzing(true);
    try {
      if (!isOnline) {
        pendingAnalysisQueue.current.add(note.id);
        return;
      }
      const relatedIds = await detectRelationships(note, notes);
      setNotes(prev =>
        prev.map(n =>
          n.id === note.id ? { ...n, relatedNoteIds: relatedIds } : n
        )
      );
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (activeNote && activeNote.content) runAnalysis(activeNote);
  };

  // ─── Loading screen ───────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-vault-bg flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="text-emerald-500" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-vault-bg font-sans selection:bg-emerald-500/30">
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            exit={{ y: -48 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500/90 text-black text-xs font-bold py-2 backdrop-blur-md"
          >
            <WifiOff size={14} />
            Offline — notes saved locally. Synthesis + analysis queued for reconnect.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full overflow-hidden shrink-0 border-r border-white/5"
          >
            <Sidebar
              notes={notes}
              activeNoteId={activeNoteId}
              onNoteSelect={setActiveNoteId}
              onNewNote={() => handleNewNote()}
              onDeleteNote={handleDeleteNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div
              key={activeNote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Editor
                    note={activeNote}
                    onUpdate={updateNote}
                    isFocusMode={isFocusMode}
                    onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                  />

                  {/* Pillar suggestion banner */}
                  <AnimatePresence>
                    {pillarSuggestion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-8 py-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center gap-3 text-xs"
                      >
                        <Sparkles size={14} className="text-emerald-400 shrink-0" />
                        <span className="text-zinc-400">
                          Suggested Pillar:{' '}
                          <span className="text-emerald-400 font-bold">
                            {pillarSuggestion.replace(/_/g, ' ')}
                          </span>
                        </span>
                        <button
                          onClick={() => updateNote({ pillarType: pillarSuggestion as any })}
                          className="ml-auto text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => setPillarSuggestion(null)}
                          className="text-zinc-600 hover:text-zinc-400"
                        >
                          Dismiss
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      'px-8 pb-12 shrink-0 transition-all duration-500',
                      isFocusMode
                        ? 'max-w-3xl mx-auto opacity-40 hover:opacity-100'
                        : 'w-full'
                    )}
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-6 mb-6">
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !activeNote.content}
                          className="flex items-center gap-3 px-6 py-3 rounded-[24px] bg-emerald-500 text-[#050505] font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 group"
                        >
                          {isAnalyzing ? (
                            <Loader2 size={18} className="animate-spin text-black" />
                          ) : (
                            <BrainCircuit
                              size={18}
                              className="group-hover:rotate-12 transition-transform"
                            />
                          )}
                          {isAnalyzing ? 'Mapping Neural Links...' : 'Synthesize Semantic Map'}
                        </button>
                        {!isOnline && (
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <WifiOff size={12} /> Will run when online
                          </span>
                        )}
                      </div>

                      <RelationshipGraph
                        currentNote={activeNote}
                        allNotes={notes}
                        onNoteSelect={setActiveNoteId}
                      />
                    </div>
                  </div>
                </div>

                {/* GOD MODE Right Panel */}
                <AnimatePresence>
                  {!isFocusMode && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 400, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="h-full overflow-hidden shrink-0"
                    >
                      <PillarPanel
                        note={activeNote}
                        onUpdate={updateNote}
                        isOnline={isOnline}
                        onCreateNote={handleCreateNote}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
              <Sparkles size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-medium tracking-tight">
                Select a thought to begin synthesis
              </p>
              <button
                onClick={() => handleNewNote()}
                className="mt-6 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-sm hover:scale-105 transition-transform"
              >
                New Note
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <VoiceToText onTranscript={handleTranscript} />
    </div>
  );
}
