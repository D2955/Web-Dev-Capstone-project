# QuizBlitz implementation plan

## Product direction
QuizBlitz is a live classroom quiz platform for teachers and students. This first release is a polished, data-driven front-end prototype with local demo state for the teacher dashboard, live room, quiz CRUD surface, student join flow, and topic-grouped report. The UI is structured so the mock collections and interactions can later be wired to the requested Express/MongoDB/JWT/Socket.IO backend without changing the main information architecture.

## Design direction

### Three style options
- Electric classroom control room — 0.06
- Editorial school journal — 0.04
- Soft academic SaaS — 0.08

**Chosen direction: Electric classroom control room.**

### Design movement
A refined take on arcade scoreboard UI: dense information, high-contrast surfaces, punchy color blocks, and confident motion without becoming childish.

### Core principles
1. Make the next classroom action obvious: launch, join, advance, or review.
2. Pair energetic accent colors with a calm ink canvas so data stays legible.
3. Show live state as a first-class object through countdowns, room PINs, progress rails, and participant presence.
4. Keep teacher workflows compact; every screen should answer “what do I do next?”

### Color philosophy
Deep ink (#12151F) gives the product an authoritative classroom-control feel. Neon lime (#D9F36D) owns the brand and signals readiness. Coral (#FF715B) calls out live, urgent, or corrective states. Warm paper (#F7F7F3) keeps tables and answer cards friendly and readable. Blue-violet (#8277FF) is reserved for analytics and topic groupings.

### Layout paradigm
A left rail anchors role navigation while the main canvas uses offset panels and wide “stage” cards rather than a symmetric dashboard grid. High-priority actions live at the top edge, with the live room presented as a dedicated stage.

### Signature elements
- The QuizBlitz “bolt” mark: a slashed Q badge built from CSS shapes and a lightning glyph.
- Lime live-state pills and coral event markers.
- Answer cards with colored left rails and subtle lift on hover.

### Interaction philosophy
Every interaction should feel immediate and consequential. Buttons use pressed states and compact transitions; live room controls visually move the session forward. Forms use a single strong CTA and light inline guidance. Demo state changes show a toast so the prototype feels real.

### Animation
Use 150–220ms ease-out transitions for hover, drawer, and card elevation. Use a gentle 2.4s pulse on live indicators, a 1.5s shimmer on the current question timer, and no motion on dense tables unless the user initiates a change.

### Typography system
Use Space Grotesk for headings, counts, and the wordmark; use Inter for body copy, labels, tables, and controls. H1 is 34px/1.05, section titles 18px/1.2, body 14px/1.5, metadata 11px/1.2 uppercase with 0.09em tracking.

### Brand essence
The fastest path from “class is starting” to “everyone is learning.” Personality: energetic, focused, encouraging.

### Brand voice
Headlines are active and classroom-specific. CTAs are concise and directional. Examples: “Make the next question count.” and “Open the room when you’re ready.”

### Wordmark & logo
A compact bolt-through-Q mark sits beside a lowercase QuizBlitz wordmark. The mark is rendered in CSS so it stays crisp without a separate asset.

### Signature brand color
Neon lime (#D9F36D).

## Implementation approach
- React + TypeScript + Vite front-end, with lucid iconography and CSS variables for the visual system.
- A single app shell with view state for Overview, Quizzes, Live room, Reports, Students, and Settings.
- Local demo data mirrors User, Quiz, Session, and Result concepts and drives every screen.
- Modal flows cover New quiz and Join with PIN; launch and answer actions update visible state and show confirmation toasts.
- `/manus-routes.json` declares all page routes represented by the SPA.

## Project structure
- `src/main.tsx` — Vite entry point.
- `src/App.tsx` — application state, view routing, data, and page composition.
- `src/styles.css` — full visual system, responsive layout, component styling, and motion.
- `public/manus-routes.json` — managed route manifest.
- `app.config.ts` — project logo metadata.


## Authentication surface
The app starts with a branded authentication entry page. Sign-in mode includes email, password, remember-me, forgot-password, and a demo access card. Create-account mode adds full name and a teacher/student/admin role picker. The preview uses local state to open the role-specific workspace after submit, while the form structure is ready to map to the requested JWT access/refresh flow.
