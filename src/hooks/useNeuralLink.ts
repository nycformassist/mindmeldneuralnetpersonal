import { useMemo } from 'react';
import { Note, PillarType } from '../types';

export function useNeuralLink(currentNote: Note | null, allNotes: Note[]) {
  const recommendations = useMemo(() => {
    if (!currentNote || !currentNote.pillarType) return [];

    // Strategic logic: 
    // Leapfrog (Disruption) needs Sothic (Protection)
    // Modern Ministry (Vision) needs Human Anchor (Relatability)
    const strategyMap: Record<PillarType, PillarType> = {
      LEAPFROG_INITIATIVE: 'SOTHIC_GATEKEEPER',
      SOTHIC_GATEKEEPER: 'LEAPFROG_INITIATIVE',
      MODERN_MINISTRY: 'HUMAN_ANCHOR',
      HUMAN_ANCHOR: 'MODERN_MINISTRY'
    };

    const targetType = strategyMap[currentNote.pillarType];
    
    // Filter notes of the target type that aren't the current one
    return allNotes.filter(n => 
      n.id !== currentNote.id && 
      n.pillarType === targetType
    );
  }, [currentNote, allNotes]);

  return recommendations;
}
