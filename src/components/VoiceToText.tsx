import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
}

export const VoiceToText: React.FC<VoiceToTextProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    // Keep interimResults true for UI feedback, but we only "emit" the final result
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      // Iterate only through the latest results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      // Only send the text back to App.tsx when a full thought is finished
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={toggleListening}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden focus:outline-none",
          isListening ? "bg-red-500 text-white" : "bg-emerald-500 text-black"
        )}
      >
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-red-400 rounded-full"
            />
          )}
        </AnimatePresence>
        {isListening ? <MicOff size={24} className="relative z-10" /> : <Mic size={24} className="relative z-10" />}
      </button>
      
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute bottom-full mb-4 right-0 bg-[#1a1a1a] border border-white/10 p-3 rounded-2xl shadow-2xl whitespace-nowrap flex items-center gap-3 backdrop-blur-md"
        >
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5, 
                  delay: i * 0.1,
                  ease: "easeInOut" 
                }}
                className="w-1 bg-red-500 rounded-full"
              />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Listening</span>
        </motion.div>
      )}
    </div>
  );
};