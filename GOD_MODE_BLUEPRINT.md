# Neural Vault v3.0 — GOD MODE Blueprint
## Monetary Synthesis & Autonomous Posting System

> **Philosophy**: You are not building a note-taking app. You are building a **Knowledge Clone** — a digital surrogate that speaks in your voice, thinks in your strategic framework, and converts raw thoughts into revenue-generating authority across every platform.

---

## I. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    NEURAL VAULT v3.0                        │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │  INGEST  │──▶│  SYNTHESIZE  │──▶│  DEPLOY (GATE)   │   │
│  │          │   │              │   │                  │   │
│  │ • Voice  │   │ • Gemini     │   │ • Preview UI     │   │
│  │ • Text   │   │ • 4 Pillars  │   │ • Firewall Gate  │   │
│  │ • URL    │   │ • Platform   │   │ • Social Posts   │   │
│  │ • PDF    │   │   Rotation   │   │ • Landing Pages  │   │
│  │ • Image  │   │ • CTA Logic  │   │ • Scheduling     │   │
│  └──────────┘   └──────────────┘   └──────────────────┘   │
│                        │                                    │
│              ┌──────────────────┐                          │
│              │   NEURAL VAULT   │                          │
│              │  (Knowledge Base)│                          │
│              │  • Semantic Map  │                          │
│              │  • Pillar Index  │                          │
│              │  • Voice Archive │                          │
│              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## II. WHAT'S CHANGING (v2 → v3)

### Model Upgrade
- `gemini-2.0-flash` → **`gemini-2.5-flash-lite`** (retires June 1, 2026)

### New Features Added

#### 1. Multi-Source Ingestion
| Source | Method | Use Case |
|--------|---------|----------|
| Voice | Web Speech API (existing) | Field capture, Bronx routes |
| URL Import | Fetch + Gemini parse | News, competitor intel |
| Plain Text Paste | Clipboard API | Quick drop |
| PDF | File reader → base64 → Gemini | Legal docs (Shaniqua filings) |
| Image/Screenshot | File reader → base64 → Gemini | Whiteboard photos |

#### 2. Synthesis Preview UI (THE FIREWALL GATE)
- Takes any note and runs it through the **4-Pillar Rotation Engine**
- Generates 4 platform-ready drafts simultaneously:
  - **X/Twitter**: Hook + thread opener (280 chars)
  - **LinkedIn**: Authority post (long-form)
  - **TikTok**: Video script hook (30-second)
  - **Instagram**: Caption + hashtag stack
- Each draft auto-attaches correct CTA based on Pillar type
- **Nothing posts until YOU press Generate** — Safety lock is always ON by default

#### 3. CTA Engine
| Pillar | Default CTA |
|--------|-------------|
| Modern Ministry | Book a Strategy Call |
| Human Anchor | Connect with Local Services |
| Leapfrog Initiative | Join the Waitlist / Course |
| Sothic Gatekeeper | Request Private Consultation |

#### 4. Master Stack Input
- New "Master Stack" panel: paste in bulk raw material
- Gemini deconstructs into Atomic Units (quotes, facts, hooks)
- Each unit gets auto-tagged to a Pillar
- All units feed the Synthesis Preview

#### 5. Valentine Voice Lock
- System prompt contains your voice profile (tone, cadence, phrases)
- Every Gemini output passes through this voice filter
- Ensures consistency across all 4 Pillars

---

## III. FILE CHANGES

### Modified Files
| File | Change |
|------|--------|
| `geminiService.ts` | Model → `gemini-2.5-flash-lite`, new synthesis functions |
| `App.tsx` | New state for Synthesis mode, Master Stack, source import |

### New Files
| File | Purpose |
|------|---------|
| `SynthesisPreview.tsx` | The Firewall Gate UI — 4-Pillar content preview |
| `MasterStackPanel.tsx` | Bulk input → Atomic Unit deconstruction |
| `SourceImport.tsx` | URL/PDF/Image ingestion component |
| `ContentDraft.tsx` | Platform-specific draft card component |
| `geminiSynthesis.ts` | All new Gemini synthesis functions |
| `valentineVoice.ts` | Valentine voice profile constants |

---

## IV. INSTALLATION INSTRUCTIONS

### Step 1: Replace the model string (CRITICAL — do first)
In `src/services/geminiService.ts`, change line 52:
```ts
// OLD (retiring June 1, 2026):
model: 'gemini-2.0-flash',

// NEW:
model: 'gemini-2.5-flash-lite',
```

### Step 2: Add new service file
Copy `src/services/geminiSynthesis.ts` from this package into your repo.

### Step 3: Add new components
Copy all files from `src/components/` in this package.

### Step 4: Update App.tsx
Replace your `App.tsx` with the new version from this package.

### Step 5: Update types
Merge new types from `src/types/synthesis.ts` into your `src/types.ts`.

### Step 6: Environment variables
Confirm `.env` has:
```
GEMINI_API_KEY=your_key_here
```

### Step 7: Install no new packages needed
All new features use existing deps: `@google/genai`, `lucide-react`, `motion/react`.

---

## V. SYSTEM STATUS CONTROLS

| Control | Location | Default |
|---------|----------|---------|
| Firewall Gate (no auto-post) | `SynthesisPreview.tsx` | 🔴 LOCKED |
| Voice Capture | `VoiceToText.tsx` | 🟡 STANDBY |
| Gemini Analysis | `geminiService.ts` | 🟢 ONLINE |
| Synthesis Preview | `SynthesisPreview.tsx` | 🟢 ACTIVE |
| Autonomous Posting | Future Sprint | ⬜ NOT BUILT |

---

## VI. NEXT SPRINT ROADMAP

1. **Browser Subagent Integration** — Playwright/Puppeteer browser automation for actual post execution
2. **Scheduling Queue** — Calendar-based post queue with optimal time slots per platform
3. **Analytics Hook** — Pull engagement data back into the vault to refine future synthesis
4. **Export to Notion/Obsidian** — Vault portability
5. **PWA / Service Worker** — True offline-first with sync on reconnect
