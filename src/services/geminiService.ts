import { GoogleGenAI } from "@google/genai";
import { Note, PillarType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePillarContent(note: Note, type: PillarType): Promise<string> {
  const model = "gemini-3.1-pro-preview"; // Using Pro for complex synthesis
  
  const pillarPrompts: Record<PillarType, string> = {
    MODERN_MINISTRY: "Visionary leadership, philosophical strategy, and the 'higher calling'. Tone: Authoritative, Inspiring, Stoic.",
    HUMAN_ANCHOR: "Community grounding, relatability, and shared human values. Tone: Conversational, Warm, Grounded.",
    LEAPFROG_INITIATIVE: "Tactical disruption, next-gen technology moves, and aggressive innovation. Tone: Fast-paced, Provocative, Analytical.",
    SOTHIC_GATEKEEPER: "Protective intelligence, elite-access boundaries, and foundational, 'hidden' truths. Tone: Technical, Serious, High-Barrier."
  };

  const prompt = `
    You are the Lead Architect for "Neural Vault".
    
    Current Note Title: ${note.title}
    Current Note Content: ${note.content}
    
    Task: Synthesize this note into the "${type}" pillar.
    Framework Context: ${pillarPrompts[type]}
    
    Provide a high-impact synthesis that follows the specified tone and strategy.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "Synthesis failed.";
}

export async function detectRelationships(currentNote: Note, allNotes: Note[]): Promise<string[]> {
  if (allNotes.length <= 1) return [];

  const model = "gemini-3-flash-preview";
  const otherNotes = allNotes.filter(n => n.id !== currentNote.id);
  
  const prompt = `
    Current Note:
    Title: ${currentNote.title}
    Content: ${currentNote.content}

    Other Notes in Vault:
    ${otherNotes.map(n => `ID: ${n.id} | Title: ${n.title}`).join("\n")}

    Task: Identify which of the "Other Notes" are semantically related to the "Current Note". 
    Return ONLY a comma-separated list of IDs. If none are related, return "NONE".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const text = response.text?.trim() || "NONE";
  if (text === "NONE") return [];
  
  return text.split(",").map(id => id.trim()).filter(id => otherNotes.some(n => n.id === id));
}
