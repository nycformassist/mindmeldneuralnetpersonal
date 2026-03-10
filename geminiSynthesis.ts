/**
 * geminiSynthesis.ts — Neural Vault v3.0 GOD MODE
 * 
 * The Synthesis Engine. This is what transforms raw notes into
 * platform-ready, revenue-generating content through the 4-Pillar framework.
 * 
 * STEALTH MODE: This service GENERATES content but NEVER posts.
 * The Firewall Gate (SynthesisPreview.tsx) is the human checkpoint.
 */

import { GoogleGenAI } from '@google/genai';
import { VOICE_PROFILE, PILLAR_CTAs, PLATFORM_CONSTRAINTS } from './valentineVoice';
import { Note } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;

export interface PlatformDraft {
  platform: 'twitter' | 'linkedin' | 'tiktok' | 'instagram';
  content: string;
  cta: string;
  ctaUrl: string;
  charCount: number;
  pillar: string;
}

export interface SynthesisResult {
  pillar: string;
  pillarLabel: string;
  angle: string; // How this pillar reframed the content
  drafts: PlatformDraft[];
}

export interface AtomicUnit {
  id: string;
  type: 'quote' | 'fact' | 'hook' | 'strategy' | 'story';
  content: string;
  suggestedPillar: string;
  strength: number; // 1–10
}

export interface ImportedSource {
  id: string;
  sourceType: 'url' | 'pdf' | 'text' | 'image';
  sourceLabel: string;
  rawContent: string;
  atomicUnits: AtomicUnit[];
  importedAt: number;
}

/**
 * synthesizeNote
 * Core synthesis function. Takes a note (or raw text) and runs it through
 * all 4 Pillars simultaneously, generating platform-ready drafts for each.
 * 
 * This is the "Secret Sauce" — Layer 1–4 of the Recursive Prompting system.
 */
export const synthesizeNote = async (
  note: Note | { title: string; content: string; pillarType?: string },
  targetPillars: string[] = ['MODERN_MINISTRY', 'HUMAN_ANCHOR', 'LEAPFROG_INITIATIVE', 'SOTHIC_GATEKEEPER']
): Promise<SynthesisResult[]> => {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY not configured. Synthesis requires API access.');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `${VOICE_PROFILE}

You are running the SYNTHESIS ENGINE for Neural Vault. Your job is to take the source note below and generate platform-ready content drafts through the lens of each strategic Pillar.

SOURCE NOTE:
Title: ${note.title}
Content: ${note.content.substring(0, 1000)}
Current Pillar: ${note.pillarType ?? 'unassigned'}

TARGET PILLARS TO GENERATE FOR: ${targetPillars.join(', ')}

PILLAR DEFINITIONS:
- MODERN_MINISTRY: Big picture vision of AI adoption. Target: Investors, Partners, Industry Peers.
- HUMAN_ANCHOR: Trust, empathy, local Bronx community value. Target: Clients, Senior Centers, Local Businesses.
- LEAPFROG_INITIATIVE: Radical efficiency and tactical tech advantages. Target: Early adopters, Tech entrepreneurs.
- SOTHIC_GATEKEEPER: Security, privacy, elite boundary setting. Target: High-ticket clients, Legal/Compliance.

SYNTHESIS LAYERS:
Layer 1 - Deconstruction: Extract the core atomic message from the source note.
Layer 2 - Re-Framing: Reframe through each Pillar's strategic lens.
Layer 3 - Optimization: Format for each platform's constraints.
Layer 4 - Conversion: Each draft should naturally lead to the action appropriate for that Pillar.

PLATFORM REQUIREMENTS:
- twitter: Max 280 chars. Strong hook. Scroll-stopping first line. Thread-opener style.
- linkedin: Max 2000 chars. Authority post. Context + insight + call to reflection. Professional but human.
- tiktok: Max 400 chars. This is a VIDEO SCRIPT. Write the spoken words for a 30-second video. Punchy, visual, urgent.
- instagram: Max 1200 chars. Caption + hashtag stack (8-12 hashtags). Aspirational. Visual story.

Return ONLY a valid JSON array. No markdown, no explanation. Format:
[
  {
    "pillar": "PILLAR_KEY",
    "pillarLabel": "Human Readable Name",
    "angle": "One sentence: how this pillar reframed the content",
    "drafts": [
      {
        "platform": "twitter",
        "content": "Draft content here",
        "cta": "CTA button label",
        "ctaUrl": "https://example.com",
        "charCount": 0,
        "pillar": "PILLAR_KEY"
      }
    ]
  }
]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  const raw = response.text?.trim() ?? '[]';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed: SynthesisResult[] = JSON.parse(cleaned);

    // Inject real CTAs from our config and compute char counts
    return parsed.map(result => ({
      ...result,
      drafts: result.drafts.map(draft => {
        const ctaConfig = PILLAR_CTAs[result.pillar];
        return {
          ...draft,
          cta: ctaConfig?.label ?? draft.cta,
          ctaUrl: ctaConfig?.url ?? draft.ctaUrl,
          charCount: draft.content.length,
        };
      }),
    }));
  } catch (e) {
    console.error('Failed to parse synthesis response:', e, raw);
    throw new Error('Synthesis parsing failed. Check console for raw response.');
  }
};

/**
 * deconstructMasterStack
 * Takes a bulk "Master Stack" of raw text and breaks it into Atomic Units.
 * Each unit is a discrete, deployable insight tagged to a Pillar.
 */
export const deconstructMasterStack = async (rawStack: string): Promise<AtomicUnit[]> => {
  if (!API_KEY) throw new Error('GEMINI_API_KEY required for Master Stack deconstruction.');

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `${VOICE_PROFILE}

You are the DECONSTRUCTION ENGINE for Neural Vault. Break down the raw "Master Stack" below into discrete "Atomic Units" — individual insights, quotes, facts, or hooks that can each stand alone as a piece of content.

MASTER STACK:
${rawStack.substring(0, 3000)}

ATOMIC UNIT TYPES:
- quote: A powerful statement that can be pulled directly
- fact: A specific data point, statistic, or verifiable claim  
- hook: An attention-grabbing opening line
- strategy: A tactical recommendation or framework
- story: A narrative moment or personal experience

For each unit, suggest which of these 4 Pillars it belongs to:
MODERN_MINISTRY, HUMAN_ANCHOR, LEAPFROG_INITIATIVE, SOTHIC_GATEKEEPER

Rate each unit's deployability strength from 1–10 (10 = immediately postable, no work needed).

Return ONLY a valid JSON array:
[
  {
    "id": "unit_1",
    "type": "hook",
    "content": "The atomic content here",
    "suggestedPillar": "PILLAR_KEY",
    "strength": 8
  }
]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  const raw = response.text?.trim() ?? '[]';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned) as AtomicUnit[];
  } catch (e) {
    console.error('Master Stack deconstruction parse failed:', e);
    return [];
  }
};

/**
 * importFromUrl
 * Fetches a URL, extracts the key content, and parses it into the vault format.
 * Uses Gemini to extract signal from noise (ads, nav, etc.)
 */
export const importFromUrl = async (url: string): Promise<ImportedSource> => {
  if (!API_KEY) throw new Error('GEMINI_API_KEY required for URL import.');

  // Fetch the page content via a CORS proxy or server-side route
  // NOTE: In production, this should go through your backend to avoid CORS.
  // For now we use a public proxy for development.
  let pageContent = '';
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    // Strip HTML tags for clean text
    pageContent = data.contents.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
  } catch (e) {
    pageContent = `[Could not fetch URL: ${url}. Paste the content manually instead.]`;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `${VOICE_PROFILE}

Extract the key intelligence from this web content for the Neural Vault. 
URL: ${url}
Content: ${pageContent}

Return a JSON object:
{
  "summary": "2-3 sentence summary of the key insight",
  "atomicUnits": [
    {
      "id": "unit_1",
      "type": "fact|quote|hook|strategy|story",
      "content": "The deployable content",
      "suggestedPillar": "PILLAR_KEY",
      "strength": 1-10
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  const raw = response.text?.trim() ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      id: crypto.randomUUID(),
      sourceType: 'url',
      sourceLabel: url,
      rawContent: pageContent,
      atomicUnits: parsed.atomicUnits ?? [],
      importedAt: Date.now(),
    };
  } catch (e) {
    return {
      id: crypto.randomUUID(),
      sourceType: 'url',
      sourceLabel: url,
      rawContent: pageContent,
      atomicUnits: [],
      importedAt: Date.now(),
    };
  }
};

/**
 * importFromBase64
 * Handles PDF or Image file imports via base64.
 * Uses Gemini's multimodal capability to extract content.
 */
export const importFromBase64 = async (
  base64Data: string,
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png',
  label: string
): Promise<ImportedSource> => {
  if (!API_KEY) throw new Error('GEMINI_API_KEY required for file import.');

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const sourceType = mimeType === 'application/pdf' ? 'pdf' : 'image';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `${VOICE_PROFILE}

Extract all key intelligence from this ${sourceType} for the Neural Vault strategic knowledge base.

Return ONLY a JSON object:
{
  "summary": "2-3 sentence summary",
  "rawText": "Full extracted text (max 2000 chars)",
  "atomicUnits": [
    {
      "id": "unit_1",
      "type": "fact|quote|hook|strategy|story",
      "content": "The deployable content",
      "suggestedPillar": "MODERN_MINISTRY|HUMAN_ANCHOR|LEAPFROG_INITIATIVE|SOTHIC_GATEKEEPER",
      "strength": 1-10
    }
  ]
}`,
          },
        ],
      },
    ],
  });

  const raw = response.text?.trim() ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      id: crypto.randomUUID(),
      sourceType,
      sourceLabel: label,
      rawContent: parsed.rawText ?? '',
      atomicUnits: parsed.atomicUnits ?? [],
      importedAt: Date.now(),
    };
  } catch (e) {
    return {
      id: crypto.randomUUID(),
      sourceType,
      sourceLabel: label,
      rawContent: '',
      atomicUnits: [],
      importedAt: Date.now(),
    };
  }
};
