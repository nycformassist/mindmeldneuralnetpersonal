# Neural Vault v3.0 — GOD MODE Install Instructions

## STEP 1: Model Update (URGENT — do this immediately)

In your existing `src/services/geminiService.ts`, find line ~52 and change:

```ts
// OLD — retires June 1, 2026:
model: 'gemini-2.0-flash',

// NEW — replace with:
model: 'gemini-2.5-flash-lite',
```

Or just replace the entire file with the new `geminiService.ts` from this package.

---

## STEP 2: Add New Service Files

Copy these files into `src/services/`:
- `valentineVoice.ts` ← Voice profile + CTA config. Edit this to tune your tone.
- `geminiSynthesis.ts` ← All synthesis/import functions.

---

## STEP 3: Add New Components

Copy these files into `src/components/`:
- `SynthesisPreview.tsx` ← The Firewall Gate. 4-Pillar content previewer.
- `MasterStackPanel.tsx` ← Bulk input → Atomic Unit deconstructor.
- `SourceImport.tsx` ← URL / PDF / Image ingestion.
- `PillarPanel.tsx` ← Replaces existing. Now has 4 tabs.

---

## STEP 4: Replace App.tsx

Replace your existing `src/App.tsx` with the new version from this package.
Key changes:
- `handleNewNote()` now accepts optional `title`, `content`, `pillarType` params
- `handleCreateNote()` new function wired to MasterStack and SourceImport
- `PillarPanel` now receives `isOnline` and `onCreateNote` props

---

## STEP 5: Customize Your Voice

Open `src/services/valentineVoice.ts` and update:

```ts
export const PILLAR_CTAs = {
  MODERN_MINISTRY: {
    url: 'https://YOUR-ACTUAL-CALENDLY-OR-LANDING-PAGE.com',
    // ...
  },
  // ... update all 4 CTA URLs
};
```

Also update the `VOICE_PROFILE` constant with any specific phrases,
references, or tone adjustments that are distinctly yours.

---

## STEP 6: Verify .env

Confirm your `.env` or `.env.local` has:
```
GEMINI_API_KEY=your_actual_key_here
```

---

## STEP 7: No New Packages Needed

All GOD MODE features use packages already in your `package.json`:
- `@google/genai` — for all synthesis calls
- `motion/react` — for animations  
- `lucide-react` — for icons

---

## WHAT YOU GET AFTER INSTALL

### Right Panel — Now Has 4 Tabs:

| Tab | What It Does |
|-----|-------------|
| **Pillars** | Original Pillar assignment (unchanged) |
| **Synthesize** | Click one button → get 4 platform drafts from current note |
| **Stack** | Paste raw bulk material → Gemini extracts Atomic Units |
| **Import** | Drop in a URL or upload PDF/image → extracted into vault |

### Safety Guarantee
- Firewall Gate is ALWAYS ON
- Nothing posts anywhere automatically
- You review every draft before copying and deploying manually
- Autonomous posting is a future sprint, not active

---

## TROUBLESHOOTING

**"Synthesis parsing failed"**
- Gemini occasionally returns malformed JSON. Hit Re-Synthesize — it's usually a one-off.

**URL import returns empty units**
- The CORS proxy (`allorigins.win`) works for most public URLs
- For paywalled sites, copy-paste the text into Master Stack instead
- For production, route URL fetches through your own backend

**File import not working**
- Ensure file is under ~10MB
- Supported: PDF, JPEG, PNG
- Gemini multimodal requires the file to be sent as base64 — this is handled automatically

**Voice still stuttering**
- Confirm you're using the v2 `VoiceToText.tsx` from the previous session
- If on Android and mic cuts after ~60s, the auto-restart fix should handle it
- If still stuttering, consider setting `interimResults: false` in VoiceToText

---

## NEXT SPRINT CANDIDATES

1. **Scheduling Queue** — queue approved drafts to post at optimal times
2. **Browser Subagent** — Playwright automation for actual post execution  
3. **Analytics Webhook** — pull engagement data back into vault
4. **Export / Backup** — JSON dump of entire vault
5. **PWA / Service Worker** — full offline-first caching
