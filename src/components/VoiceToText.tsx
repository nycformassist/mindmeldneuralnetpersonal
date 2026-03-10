import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
}

type RecognitionState = 'idle' | 'thinking' | 'captured';

export const VoiceToText: React.FC<VoiceToTextProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [state, setState] = useState<RecognitionState>('idle');
  const [interimText, setInterimText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  // Track intent separately from isListening state to avoid stale closure issues
  const shouldRestartRef = useRef(false);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition not supported in this browser. Try Chrome on Android.');
      return;
    }

    setMicError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    // interimResults: true gives us visual "thinking" feedback.
    // We ONLY emit final results to the parent — interim is display-only.
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // THE CORE FIX: start from event.resultIndex, not 0.
      // This prevents re-reading already-confirmed words on every event.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setInterimText(interimTranscript);
        setState('thinking');
      }

      if (finalTranscript) {
        // Commit final text — add trailing space for natural word joining
        onTranscript(finalTranscript.trim() + ' ');
        setInterimText('');
        setState('captured');
        // Brief visual confirmation, then reset to idle
        setTimeout(() => setState('idle'), 800);
      }
    };

    recognition.onerror = (event: any) => {
      // 'aborted' fires when we call .stop() ourselves — not an error
      if (event.error === 'aborted') return;

      if (event.error === 'not-allowed') {
        setMicError('Mic blocked. Check browser permissions and tap the button again.');
      } else if (event.error === 'network') {
        setMicError('Network error. Recognition needs internet on first use.');
      } else if (event.error === 'no-speech') {
        // Silence timeout — not an error, just reset state
        setState('idle');
        setInterimText('');
        return;
      } else {
        setMicError(`Recognition error: ${event.error}`);
      }

      shouldRestartRef.current = false;
      setIsListening(false);
      setState('idle');
      setInterimText('');
    };

    recognition.onend = () => {
      // Auto-restart if the user hasn't explicitly stopped.
      // Handles Android Chrome's ~60-second silence timeout gracefully.
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // If restart fails, clean up gracefully
          shouldRestartRef.current = false;
          setIsListening(false);
          setState('idle');
        }
      } else {
        setIsListening(false);
        setState('idle');
        setInterimText('');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    setIsListening(true);
    setState('idle');
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setState('idle');
    setInterimText('');
  }, []);

  // Hard-lock: mic only initializes on explicit physical tap.
  // Required for 2026 browser security policies on Android.
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stateConfig: Record<RecognitionState, { color: string; label: string; barSpeed: number }> = {
    idle:     { color: 'bg-zinc-500',    label: 'Listening...',  barSpeed: 1.2 },
    thinking: { color: 'bg-amber-400',   label: 'Processing...', barSpeed: 0.35 },
    captured: { color: 'bg-emerald-400', label: '✓ Captured',    barSpeed: 0.8 },
  };

  const cfg = stateConfig[state];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">

      {/* Error toast */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="flex items-start gap-2 bg-red-950/90 border border-red-500/40 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-[240px]"
          >
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300 leading-snug">{micError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stability Log bubble */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-[#161618] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md w-64"
          >
            {/* State row */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-[3px] items-end h-4">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [3, state === 'thinking' ? 16 : 7, 3] }}
                    transition={{
                      repeat: Infinity,
                      duration: cfg.barSpeed,
                      delay: i * 0.08,
                      ease: 'easeInOut',
                    }}
                    className={cn('w-1 rounded-full transition-colors duration-300', cfg.color)}
                  />
                ))}
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest transition-colors duration-300',
                state === 'thinking' ? 'text-amber-400' :
                state === 'captured' ? 'text-emerald-400' : 'text-zinc-500'
              )}>
                {cfg.label}
              </span>
            </div>

            {/* Interim preview */}
            {interimText ? (
              <p className="text-[11px] text-zinc-500 italic leading-snug line-clamp-2">
                "{interimText}"
              </p>
            ) : (
              <p className="text-[10px] text-zinc-700">
                Field notes will auto-append to your active note.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button — minimum 56×56px for Galaxy A17 touch accuracy */}
      <button
        onClick={toggleListening}
        aria-label={isListening ? 'Stop recording' : 'Start voice capture'}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl',
          'transition-all duration-300 relative overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
          isListening
            ? 'bg-red-500 text-white focus:ring-red-500 scale-100'
            : 'bg-emerald-500 text-black focus:ring-emerald-500 hover:scale-105 active:scale-95'
        )}
      >
        {/* Pulse ring when active */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="absolute inset-0 bg-red-400 rounded-full"
            />
          )}
        </AnimatePresence>

        {isListening
          ? <MicOff size={24} className="relative z-10" />
          : <Mic size={24} className="relative z-10" />
        }
      </button>
    </div>
  );
};
