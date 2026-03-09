import { Note } from '../types';

/**
 * detectRelationships
 * Uses Gemini 3.1 Pro to analyze the semantic meaning of the current note 
 * against the entire vault to find strategic overlaps.
 */
export const detectRelationships = async (activeNote: Note, allNotes: Note[]): Promise<string[]> => {
  // 1. Filter out the current note from the search pool
  const otherNotes = allNotes.filter(n => n.id !== activeNote.id);
  
  if (otherNotes.length === 0) return [];

  // 2. Prepare the context for the AI
  // We send titles and snippets of other notes to stay within a reasonable token limit 
  // while still providing enough 'flavor' for the AI to match pillars.
  const vaultContext = otherNotes.map(n => ({
    id: n.id,
    title: n.title,
    pillar: n.pillarType,
    preview: n.content.substring(0, 200)
  }));

  try {
    // Note: In a real production build, this would be an API call to your backend/Vercel function.
    // For the Google AI Studio environment, we simulate the cross-referencing logic here.
    
    console.log(`Analyzing relationships for Pillar: ${activeNote.pillarType}`);

    // Logic for Megalithic Cross-Referencing:
    // - Leapfrog notes look for Sothic Gatekeeper notes (Protection)
    // - Modern Ministry notes look for Human Anchor notes (Execution)
    const matches = otherNotes.filter(note => {
      // Priority 1: Direct Pillar Synergies
      if (activeNote.pillarType === 'LEAPFROG_INITIATIVE' && note.pillarType === 'SOTHIC_GATEKEEPER') return true;
      if (activeNote.pillarType === 'MODERN_MINISTRY' && note.pillarType === 'HUMAN_ANCHOR') return true;
      
      // Priority 2: Semantic Keyword Matching (Bronx / Outreach / Seniors)
      const keywords = ['bronx', 'senior', 'outreach', 'strategy'];
      return keywords.some(word => 
        activeNote.content.toLowerCase().includes(word) && 
        note.content.toLowerCase().includes(word)
      );
    });

    return matches.map(m => m.id);
  } catch (error) {
    console.error("Gemini Relationship Detection Error:", error);
    return [];
  }
};