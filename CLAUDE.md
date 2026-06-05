# CLAUDE.md — TripUp Prototype

> Project brain for Claude Code. Read this first, every session, before writing
> any code. The design system in §4 is the fixed foundation for everything.

---

## 1. What this is

**TripUp** is an all-in-one mobile app for organising group travel — weekend
getaways through to music festivals abroad. Friends collaboratively build
itineraries, vote on decisions, track and settle shared expenses, and keep
everyone in the loop — less frustration, more fun.

The beta has gained traction with early adopters, and the team wants a **full
redesign**. This repo is a **working, interactive prototype** of that redesign,
built across TripUp's core group-travel flows. It is a prototype, not
production: the goal is a polished, navigable experience that tells the redesign
story end-to-end, not a backend or shippable app.

## 2. What we're building

A multi-screen prototype that demonstrates the redesigned TripUp experience
across its core flows (see §5). It must:

- Be built **screen by screen** from provided reference designs, every screen
  styled exclusively from the shared design tokens in §4.
- **Export cleanly to web** (react-native-web) so it can be deployed to a Vercel
  link, **and** run in Expo Go on a phone.
- Hang together as one coherent app — shared components, consistent navigation,
  no dead-ends.

Reference designs are added to `/design/` as the build progresses (one image
per screen). For any screen with a reference image, **the image is the spec** —
build to match it. The brand spec in §4 governs styling; the reference governs
layout and content.

## 3. Tech stack & conventions

- **Expo** (managed workflow) + **TypeScript** — blank TS template.
- **React Navigation** — bottom tab navigator for the app shell; the in-trip
  Feed / Itinerary / Chat / Expenses row is a custom segmented control, not a
  separate navigator, so it matches the design.
- **react-native-web compatible.** Avoid native-only dependencies. Test the web
  build (`w` in Expo) alongside the phone throughout — do not leave web testing
  to the end.
- **Functional components + hooks only.** No class components.
- **Design tokens are centralised** in `/theme` (see §4). Never hardcode a hex,
  font size, spacing or radius in a component — always pull from the theme.
  Treat this like a Figma token library: one source of truth, reused everywhere.
- **Build reusable components**, not one-off screens. A redesign across many
  screens lives or dies on shared primitives — Avatar, AvatarStack, Card,
  Badge, SectionHeader, ListRow, TabBar, SegmentedControl, etc. Build the
  primitive once, reuse it across screens.
- Suggested structure:
  ```
  /theme         colors.ts, typography.ts, spacing.ts, radius.ts, index.ts
  /components     reusable primitives (Avatar, Card, Badge, ListRow, TabBar…)
  /screens        one folder/file per screen
  /navigation     tab navigator + segmented control
  /data           mock data
  /assets/fonts   Open Sauce One .ttf files
  /design         reference screenshots (not shipped)
  ```
- **Desktop web layout:** an Expo web app fills the whole browser window and
  looks like a stretched website. Constrain the app to a phone-width column
  (≈ 390px) **centred** on screen with a neutral backdrop, so a reviewer on a
  laptop still perceives a mobile app.
- Mock all data locally in `/data`. No backend — this is a prototype.

## 4. Design system  ← the fixed foundation

All tokens come straight from the brand spec. Build a `/theme` module that
exports these and reference them everywhere. This is the part that must be
exact; layouts can evolve, the system cannot.

The brand is **bold, colourful, positive** — block colour, vibrant, soft
edges. It deliberately steers away from the sterile, corporate look of
competitors like booking.com and leans into the vibrancy travel brings.

### Colours

| Token             | Hex       | Use                                              |
|-------------------|-----------|--------------------------------------------------|
| `white`           | `#FFFFFD` | App background / surfaces / card fills           |
| `dark`            | `#00101A` | Primary text, icons                              |
| `brandOrange`     | `#FF9944` | Brand / primary action / active state / logo     |
| `tertiaryBlue`    | `#44AAFF` | Accent — information, selection                  |
| `tertiaryPink`    | `#FA9DFD` | Accent — social, dining                          |
| `tertiaryGreen`   | `#14AE5C` | Accent — expenses, success, new                  |
| `tertiaryPurple`  | `#CF9DFD` | Accent — accommodation, polls                    |
| `tertiarySand`    | `#F6ECC9` | Accent — leisure, relaxed activities             |

(Accent uses above are sensible defaults; follow each screen's reference design
where it dictates a specific colour.)

### Typography — **Open Sauce One** (everything)

Both headings and body use Open Sauce One. It's a free font (SIL Open Font
License); download the `.ttf` files and load via `expo-font` (`useFonts` with
local `require`s). Load at least Regular, Medium, SemiBold, Bold. Block app
render behind `fontsLoaded`.

| Token        | Size  | Suggested weight |
|--------------|-------|------------------|
| `h1`         | 24px  | Bold             |
| `h2`         | 20px  | SemiBold / Bold  |
| `h3`         | 18px  | SemiBold         |
| `bodyLarge`  | 16px  | Regular          |
| `bodySmall`  | 14px  | Regular          |
| `label`      | 12px  | Medium           |

### Spacing tokens

| Token | Value |
|-------|-------|
| `sm`  | 10px  |
| `lg`  | 20px  |

Use these for padding, gaps and margins to keep layout structure consistent
across every screen.

### Radius tokens

| Token | Value | Use                              |
|-------|-------|----------------------------------|
| `sm`  | 10px  | Small elements, list rows, chips |
| `lg`  | 20px  | Cards, large surfaces            |

Soft, rounded — part of the friendly brand feel.

## 5. App scope & information architecture

The redesign spans TripUp's core group-travel experience. Use this as the IA
skeleton; build the specific screens from their reference designs as they're
added to `/design`.

**Bottom tab shell**
- **Home** — overview across the user's trips.
- **Trips** — the active trip workspace (the heart of the product).
- **Explore** — discover destinations and activities.
- **Profile** — the user's account.

**Trip workspace** (inside a trip — segmented control)
- **Feed** — live group activity: polls, expense requests, shared photos,
  updates.
- **Itinerary** — day-by-day timeline of activities.
- **Chat** — group messaging.
- **Expenses** — track, split and settle shared costs.

**Cross-cutting flows from the brief**
- Creating a trip and inviting travellers.
- Voting on decisions (polls).
- Splitting and settling expenses.
- Shared photo gallery.

The prototype should cover a coherent slice that demonstrates the redesign
end-to-end. The **Trip workspace** is TripUp's core value, so prioritise those
flows; any tab or sub-tab not yet built should land on a clean, branded
placeholder rather than a dead-end.

## 6. Build process — one screen at a time

For each screen:
1. I add its reference design to `/design/` (or describe it in chat).
2. Build it to match, drawing **all** styling from the `/theme` tokens.
3. Reuse existing components; extract any new repeated pattern into
   `/components` so later screens inherit it.
4. Wire its navigation into the shell.
5. Check it on **web and phone**, commit, then move to the next.

Suggested order: (1) `/theme` + fonts + navigation skeleton + placeholders,
then (2…n) each screen as its design lands, richest flows (Trip workspace)
first.

## 7. How to work with me

- I'm a designer, not a heavy coder — explain any non-obvious decision briefly,
  and Figma analogies land well (tokens, components, variants, frames).
- **Match the reference design faithfully** before adding flourishes.
- Work in scoped chunks and let me confirm a screen looks right before moving
  on.
- **Ask before adding a dependency**, and prefer ones that work under
  react-native-web.
- Commit after each working step.
