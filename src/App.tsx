import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { PillarPanel } from './components/PillarPanel';
import { RelationshipGraph } from './components/RelationshipGraph';
import { VoiceToText } from './components/VoiceToText';
import { Note } from './types';
import { detectRelationships } from './services/geminiService';
import { cn } from './lib/utils';
import { Loader2, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'neural_vault_notes_v2';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) setActiveNoteId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    } else {
      const welcomeNote: Note = {
        id: crypto.randomUUID(),
        title: 'Neural Vault: Genesis',
        content: '# Neural Vault v2.0\n\nWelcome to your personal knowledge clone. This environment is designed for high-performance synthesis.\n\n### Pillars of Intelligence:\n- **Modern Ministry**: Visionary strategy.\n- **Human Anchor**: Community grounding.\n- **Leapfrog Initiative**: Tactical disruption.\n- **Sothic Gatekeeper**: Protective intelligence.\n\nUse the **Mic** button to dictate thoughts directly into the vault.',
        updatedAt: Date.now(),
        tags: ['genesis'],
        pillarType: 'MODERN_MINISTRY',
        relatedNoteIds: []
      };
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      updatedAt: Date.now(),
      tags: [],
      relatedNoteIds: []
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsFocusMode(false);
  };

  const updateNote = (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => 
      n.id === activeNoteId 
        ? { ...n, ...updates, updatedAt: Date.now() } 
        : n
    ));
  };

  const handleAnalyze = async () => {
    if (!activeNote || !activeNote.content) return;
    setIsAnalyzing(true);
    try {
      const relatedIds = await detectRelationships(activeNote, notes);
      updateNote({ relatedNoteIds: relatedIds });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranscript = (text: string) => {
    setTranscript(text);
    // Reset transcript after a short delay to allow Editor to consume it
    setTimeout(() => setTranscript(''), 100);
  };

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
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full overflow-hidden shrink-0"
          >
            <Sidebar
              notes={notes}
              activeNoteId={activeNoteId}
              onNoteSelect={setActiveNoteId}
              onNewNote={handleNewNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div 
              key={activeNote.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Editor 
                    note={activeNote} 
                    onUpdate={updateNote}
                    isFocusMode={isFocusMode}
                    onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                    transcript={transcript}
                  />
                  
                  <div className={cn(
                    "px-8 pb-12 shrink-0 transition-all duration-500",
                    isFocusMode ? "max-w-3xl mx-auto opacity-40 hover:opacity-100" : "w-full"
                  )}>
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-6 mb-6">
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !activeNote.content}
                          className="flex items-center gap-3 px-6 py-3 rounded-[24px] bg-emerald-500 text-vault-bg font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <BrainCircuit size={18} />
                          )}
                          {isAnalyzing ? 'Mapping Neural Links...' : 'Analyze Semantic Map'}
                        </button>
                      </div>
                      
                      <RelationshipGraph 
                        currentNote={activeNote}
                        allNotes={notes}
                        onNoteSelect={setActiveNoteId}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {!isFocusMode && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 384, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="h-full overflow-hidden shrink-0"
                    >
                      <PillarPanel note={activeNote} onUpdate={updateNote} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
              <Sparkles size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-medium tracking-tight">Select a thought to begin synthesis</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      <VoiceToText onTranscript={handleTranscript} />
    </div>
  );
}
