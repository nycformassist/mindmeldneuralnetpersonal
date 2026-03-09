import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
}

export const VoiceToText: React.FC<VoiceToTextProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          onTranscript(transcript + ' ');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={toggleListening}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden",
          isListening ? "bg-red-500 text-white" : "bg-emerald-500 text-vault-bg"
        )}
      >
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-red-400 rounded-full"
            />
          )}
        </AnimatePresence>
        {isListening ? <MicOff size={24} className="relative z-10" /> : <Mic size={24} className="relative z-10" />}
      </button>
      
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-4 right-0 bg-vault-card border border-vault-border p-3 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-3"
        >
          <div className="flex gap-1 items-center h-4">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                className="w-1 bg-red-500 rounded-full"
              />
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-300">Listening...</span>
        </motion.div>
      )}
    </div>
  );
};
