/**
 * valentineVoice.ts
 * 
 * The "Knowledge Clone" voice profile for Valentine.
 * This is the master system prompt injected into every Gemini synthesis call.
 * It ensures all AI output speaks in YOUR voice — not generic AI voice.
 * 
 * Edit the VOICE_PROFILE to refine tone over time.
 */

export const VOICE_PROFILE = `
You are writing as Valentine — an AI Strategist, App Developer, and Bronx community leader.

VOICE CHARACTERISTICS:
- Confident but never arrogant. Authority comes from results, not posturing.
- Strategic clarity. Cut through noise. Every sentence earns its place.
- Bronx-rooted. Never ashamed of the local grind. The community is the foundation.
- Forward-thinking. Tech is a tool for liberation, not gatekeeping.
- Warmth underneath the strategy. People trust Valentine because Valentine trusts people.

TONE RULES:
- Never use buzzword salad ("synergize," "leverage," "pivot") without meaning
- Use specific details over vague gestures ("Senior Center on 149th" beats "community outreach")  
- Short punchy sentences alternate with deeper explanatory ones
- First person, active voice always
- No corporate coldness. No performative wokeness. Real talk.

PHRASES VALENTINE USES:
- "The blueprint is simple..."
- "This is the work."  
- "Build in the Bronx, scale globally."
- "Protect the vault."
- "The system is already running."
`;

export const PILLAR_CTAs: Record<string, { label: string; url: string; hook: string }> = {
  MODERN_MINISTRY: {
    label: 'Book a Strategy Call',
    url: 'https://calendly.com/valentine',
    hook: 'Ready to see the full vision? Let\'s map your path.',
  },
  HUMAN_ANCHOR: {
    label: 'Connect with Local Services',
    url: 'https://linktr.ee/valentine-bronx',
    hook: 'This is for the community. Share this with someone who needs it.',
  },
  LEAPFROG_INITIATIVE: {
    label: 'Join the Waitlist',
    url: 'https://neuralvault.app/waitlist',
    hook: 'Early access is closing soon. Get in before the door shuts.',
  },
  SOTHIC_GATEKEEPER: {
    label: 'Request Private Consultation',
    url: 'https://neuralvault.app/consult',
    hook: 'This conversation stays between us. Reach out directly.',
  },
};

export const PLATFORM_CONSTRAINTS = {
  twitter: { maxChars: 280, format: 'hook + thread opener', tone: 'punchy, scroll-stopping' },
  linkedin: { maxChars: 3000, format: 'authority post with context', tone: 'professional but human' },
  tiktok: { maxChars: 500, format: '30-second video script', tone: 'energetic, visual, direct' },
  instagram: { maxChars: 2200, format: 'caption + hashtag stack', tone: 'aspirational, visual storytelling' },
};

export const PILLAR_LABELS: Record<string, string> = {
  MODERN_MINISTRY: 'Modern Ministry',
  HUMAN_ANCHOR: 'Human Anchor',
  LEAPFROG_INITIATIVE: 'Leapfrog Initiative',
  SOTHIC_GATEKEEPER: 'Sothic Gatekeeper',
};

export const PILLAR_DESCRIPTIONS: Record<string, string> = {
  MODERN_MINISTRY: 'The "Big Picture" vision of AI adoption — for investors, partners, and industry peers.',
  HUMAN_ANCHOR: 'Trust, empathy, and local Bronx community value — for clients, senior centers, local businesses.',
  LEAPFROG_INITIATIVE: 'Radical efficiency and tactical tech advantages — for early adopters and tech-savvy entrepreneurs.',
  SOTHIC_GATEKEEPER: 'Security, privacy, and elite boundary setting — for high-ticket clients and compliance sectors.',
};
