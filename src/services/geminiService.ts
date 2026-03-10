import { GoogleGenAI } from '@google/genai';
import { Note } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;

// ─── Model Configuration ────────────────────────────────────────────────────
// Last verified: March 9, 2026 against https://ai.google.dev/gemini-api/docs/models
//
// Model history for this file:
//   - "Gemini 3.1 Pro"        → NEVER EXISTED. Was a comment error in original code.
//   - "gemini-2.0-flash"      → RETIRING June 1, 2026. Do not use.
//   - "gemini-2.5-flash-lite" → ✅ CURRENT STABLE. Use this.
//   - "gemini-3.1-flash-lite-preview" → Preview only, not stable for production.
//
// To future-proof: if this starts returning 404s, check the deprecations page:
// https://ai.google.dev/gemini-api/docs/deprecations
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

/**
 * detectRelationships
 * Uses Gemini 2.5 Flash-Lite to semantically analyze the active note against
 * the entire vault and return IDs of strategically related notes.
 *
 * Falls back to local keyword + pillar-synergy matching if the API is
 * unavailable (offline / no API key / rate-limited).
 */
export const detectRelationships = async (
  activeNote: Note,
  allNotes: Note[]
): Promise<string[]> => {
  const otherNotes = allNotes.filter(n => n.id !== activeNote.id);
  if (otherNotes.length === 0) return [];

  // Always run local match first — instant and works offline.
  const localMatches = localRelationshipMatch(activeNote, otherNotes);

  // If no API key is configured, return local results immediately.
  if (!API_KEY) {
    console.warn('[NeuralVault] GEMINI_API_KEY not set. Using local relationship matching only.');
    return localMatches;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const vaultContext = otherNotes
      .map(n =>
        `ID: ${n.id}\nTitle: ${n.title}\nPillar: ${n.pillarType ?? 'unset'}\nPreview: ${n.content.substring(0, 200)}`
      )
      .join('\n---\n');

    const prompt = `You are a strategic intelligence engine for a personal knowledge vault built around the Megalithic Commandment Framework.

The vault has 4 strategic pillars:
- MODERN_MINISTRY: Visionary leadership and higher calling strategy
- HUMAN_ANCHOR: Community grounding and relatable human values
- LEAPFROG_INITIATIVE: Tactical disruption and aggressive innovation
- SOTHIC_GATEKEEPER: Protective intelligence and high-barrier security

Analyze the SOURCE NOTE and return the IDs of the OTHER NOTES that have strong semantic, strategic, or thematic overlap.

SOURCE NOTE:
Title: ${activeNote.title}
Pillar: ${activeNote.pillarType ?? 'unset'}
Content: ${activeNote.content.substring(0, 600)}

OTHER NOTES IN THE VAULT:
${vaultContext}

Return ONLY a valid JSON array of matching note IDs, e.g. ["id1", "id2"].
If no strong relationships exist, return [].
Do not include any explanation, preamble, or markdown formatting.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const raw = response.text?.trim() ?? '[]';
    // Strip any accidental markdown fences from the response
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed: string[] = JSON.parse(cleaned);

    // Validate that returned IDs actually exist in our vault
    const validIds = new Set(otherNotes.map(n => n.id));
    const verified = parsed.filter(id => validIds.has(id));

    console.log(`[NeuralVault] Gemini found ${verified.length} semantic links.`);
    return verified;

  } catch (error) {
    console.warn('[NeuralVault] Gemini API unavailable — falling back to local matching:', error);
    return localMatches;
  }
};

/**
 * localRelationshipMatch
 * Offline fallback: pillar-synergy rules + keyword overlap.
 * No API call required. Runs instantly.
 */
function localRelationshipMatch(activeNote: Note, otherNotes: Note[]): string[] {
  const PILLAR_SYNERGY: Partial<Record<string, string>> = {
    LEAPFROG_INITIATIVE: 'SOTHIC_GATEKEEPER',
    SOTHIC_GATEKEEPER: 'LEAPFROG_INITIATIVE',
    MODERN_MINISTRY: 'HUMAN_ANCHOR',
    HUMAN_ANCHOR: 'MODERN_MINISTRY',
  };

  const KEYWORDS = [
    'bronx', 'senior', 'outreach', 'strategy', 'community',
    'ai', 'course', 'scale', 'leadership', 'innovation'
  ];

  const activeText = activeNote.content.toLowerCase();
  const activeKeywords = KEYWORDS.filter(kw => activeText.includes(kw));

  return otherNotes
    .filter(note => {
      // Priority 1: Pillar synergy
      if (
        activeNote.pillarType &&
        PILLAR_SYNERGY[activeNote.pillarType] === note.pillarType
      ) {
        return true;
      }
      // Priority 2: Shared strategic keywords
      if (activeKeywords.length > 0) {
        const noteText = note.content.toLowerCase();
        return activeKeywords.some(kw => noteText.includes(kw));
      }
      return false;
    })
    .map(n => n.id);
}

/**
 * suggestPillar
 * Lightweight local keyword scan to auto-suggest the most likely Pillar.
 * No API call. Used for real-time suggestions as the user types.
 */
export function suggestPillar(content: string): string | null {
  if (!content || content.trim().length < 20) return null;

  const text = content.toLowerCase();
  const scores: Record<string, number> = {
    MODERN_MINISTRY: 0,
    HUMAN_ANCHOR: 0,
    LEAPFROG_INITIATIVE: 0,
    SOTHIC_GATEKEEPER: 0,
  };

  const keywords: Record<string, string[]> = {
    MODERN_MINISTRY: [
      'vision', 'leadership', 'mission', 'calling', 'strategy',
      'purpose', 'direction', 'ministry', 'philosophy', 'framework'
    ],
    HUMAN_ANCHOR: [
      'community', 'senior', 'neighbor', 'trust', 'local',
      'bronx', 'people', 'outreach', 'connect', 'family', 'humanity'
    ],
    LEAPFROG_INITIATIVE: [
      'scale', 'disrupt', 'ai', 'automate', 'launch', 'growth',
      'innovation', 'course', 'tech', 'system', 'platform', 'deploy'
    ],
    SOTHIC_GATEKEEPER: [
      'secure', 'protect', 'private', 'barrier', 'lock',
      'verify', 'boundary', 'gate', 'access', 'control', 'encrypt'
    ],
  };

  for (const [pillar, words] of Object.entries(keywords)) {
    scores[pillar] = words.filter(w => text.includes(w)).length;
  }

  const [bestPillar, bestScore] = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return bestScore > 0 ? bestPillar : null;
}
