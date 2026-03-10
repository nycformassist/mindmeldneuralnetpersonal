/**
 * geminiService.ts — Neural Vault v3.0 (GOD MODE)
 * 
 * MODEL CHANGE: gemini-2.0-flash → gemini-2.5-flash-lite
 * Reason: gemini-2.0-flash retires June 1, 2026. gemini-2.5-flash-lite
 * is Google's recommended replacement — faster, cheaper, same quality for
 * semantic tasks.
 */

import { GoogleGenAI } from '@google/genai';
import { Note } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;

/**
 * detectRelationships
 * Semantically maps the active note against the entire vault.
 * Returns IDs of strategically related notes.
 * Falls back to local matching when offline or API unavailable.
 */
export const detectRelationships = async (
  activeNote: Note,
  allNotes: Note[]
): Promise<string[]> => {
  const otherNotes = allNotes.filter(n => n.id !== activeNote.id);
  if (otherNotes.length === 0) return [];

  const localMatches = localRelationshipMatch(activeNote, otherNotes);

  if (!API_KEY) {
    console.warn('GEMINI_API_KEY not set. Using local relationship matching only.');
    return localMatches;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const vaultContext = otherNotes
      .map(n => `ID: ${n.id}\nTitle: ${n.title}\nPillar: ${n.pillarType ?? 'unset'}\nPreview: ${n.content.substring(0, 200)}`)
      .join('\n---\n');

    const prompt = `You are a strategic intelligence engine for a personal knowledge vault. 
Analyze the SOURCE NOTE and return the IDs of the OTHER NOTES that have strong semantic, strategic, or thematic overlap with it.

SOURCE NOTE:
Title: ${activeNote.title}
Pillar: ${activeNote.pillarType ?? 'unset'}
Content: ${activeNote.content.substring(0, 500)}

OTHER NOTES IN THE VAULT:
${vaultContext}

Return ONLY a JSON array of matching note IDs, e.g. ["id1", "id2"]. 
If no strong relationships exist, return [].
Do not include any explanation or markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // ← UPDATED from gemini-2.0-flash
      contents: prompt,
    });

    const raw = response.text?.trim() ?? '[]';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed: string[] = JSON.parse(cleaned);

    const validIds = new Set(otherNotes.map(n => n.id));
    return parsed.filter(id => validIds.has(id));
  } catch (error) {
    console.error('Gemini relationship detection failed — using local fallback:', error);
    return localMatches;
  }
};

/**
 * localRelationshipMatch
 * Offline fallback: pillar-synergy rules + keyword overlap.
 */
function localRelationshipMatch(activeNote: Note, otherNotes: Note[]): string[] {
  const PILLAR_SYNERGY: Partial<Record<string, string>> = {
    LEAPFROG_INITIATIVE: 'SOTHIC_GATEKEEPER',
    SOTHIC_GATEKEEPER: 'LEAPFROG_INITIATIVE',
    MODERN_MINISTRY: 'HUMAN_ANCHOR',
    HUMAN_ANCHOR: 'MODERN_MINISTRY',
  };

  const activeWords = activeNote.content.toLowerCase().split(/\s+/);
  const KEYWORDS = ['bronx', 'senior', 'outreach', 'strategy', 'community', 'ai', 'course', 'scale'];
  const activeKeywords = KEYWORDS.filter(kw => activeWords.includes(kw));

  return otherNotes
    .filter(note => {
      if (activeNote.pillarType && PILLAR_SYNERGY[activeNote.pillarType] === note.pillarType) {
        return true;
      }
      if (activeKeywords.length > 0) {
        const noteWords = note.content.toLowerCase();
        return activeKeywords.some(kw => noteWords.includes(kw));
      }
      return false;
    })
    .map(n => n.id);
}

/**
 * suggestPillar
 * Lightweight local keyword scan to auto-suggest the most likely Pillar.
 */
export function suggestPillar(content: string): string | null {
  const text = content.toLowerCase();
  const scores: Record<string, number> = {
    MODERN_MINISTRY: 0,
    HUMAN_ANCHOR: 0,
    LEAPFROG_INITIATIVE: 0,
    SOTHIC_GATEKEEPER: 0,
  };

  const keywords: Record<string, string[]> = {
    MODERN_MINISTRY: ['vision', 'leadership', 'mission', 'calling', 'strategy', 'purpose', 'direction'],
    HUMAN_ANCHOR: ['community', 'senior', 'neighbor', 'trust', 'local', 'bronx', 'people', 'outreach', 'connect'],
    LEAPFROG_INITIATIVE: ['scale', 'disrupt', 'ai', 'automate', 'launch', 'growth', 'innovation', 'course', 'tech'],
    SOTHIC_GATEKEEPER: ['secure', 'protect', 'private', 'barrier', 'lock', 'verify', 'boundary', 'gate'],
  };

  for (const [pillar, words] of Object.entries(keywords)) {
    scores[pillar] = words.filter(w => text.includes(w)).length;
  }

  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return best[1] > 0 ? best[0] : null;
}
