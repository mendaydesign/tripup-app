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

Reference designs and wireframes live in `/Wireframes/`. For any screen with a
reference image, **the image is the spec** — build to match it. The brand spec
in §4 governs styling; the reference governs layout and content.

## 3. Tech stack & conventions

- **Expo SDK 54** (managed workflow) + **TypeScript** — blank TS template.
- **React Navigation** — bottom tab navigator for the app shell; the in-trip
  Feed / Itinerary / Chat / Expenses row is a custom segmented control, not a
  separate navigator, so it matches the design.
- **react-native-web compatible.** Avoid native-only dependencies. Test the web
  build (`w` in Expo) alongside the phone throughout — do not leave web testing
  to the end.
- **expo-image-picker** — installed for camera/photo library access (receipt
  scanning). Already configured in `app.json` with camera + photos permissions.
- **Functional components + hooks only.** No class components.
- **Design tokens are centralised** in `/theme` (see §4). Never hardcode a hex,
  font size, spacing or radius in a component — always pull from the theme.
  Treat this like a Figma token library: one source of truth, reused everywhere.
- **Build reusable components**, not one-off screens. A redesign across many
  screens lives or dies on shared primitives — Avatar, AvatarStack, Card,
  Badge, SectionHeader, ListRow, TabBar, SegmentedControl, etc. Build the
  primitive once, reuse it across screens.
- Actual structure (as built):
  ```
  /theme                  colors.ts, typography.ts, spacing.ts, radius.ts, index.ts
  /components             reusable primitives (see §8 for full list)
  /screens
    GroupHomeScreen.tsx   main trip workspace — hosts all sub-tab content + flows
    ItineraryView.tsx     full-screen itinerary tab takeover
    /CreateExpenseRequest
      Screen1.tsx         input method selection (Scan / Manual)
      ScanReceiptScreen.tsx  camera/library picker via expo-image-picker
      Screen3.tsx         participant selection ("Who's chipping in?")
      Screen4.tsx         expense detail — editable name, receipt, splits, items
  /navigation             tab navigator + segmented control
  /data                   mock data (trips.ts)
  /assets/fonts           Open Sauce One .ttf files
  /assets/Icons           SVG icons
  /Wireframes             reference screenshots (not shipped)
  /Target Designs         target design screenshots (not shipped)
  ```
- **Desktop web layout:** constrain the app to a phone-width column (≈ 390px)
  **centred** on screen with a neutral backdrop, so a reviewer on a laptop still
  perceives a mobile app.
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

### Card convention — FeedItem style

List/feed cards use a shared visual language:
- `backgroundColor: '#F7F7F7'`
- `borderRadius: radius.sm` (10px)
- `paddingHorizontal: spacing.sm` (10px)
- `paddingVertical: 14`
- `marginBottom: spacing.sm` between cards (applied to all but the last)

Use this pattern for any new card-style list items so everything stays
visually consistent.

## 5. App scope & information architecture

The redesign spans TripUp's core group-travel experience. Use this as the IA
skeleton; build the specific screens from their reference designs as they're
added to `/Wireframes`.

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
1. I add its reference design to `/Wireframes/` (or describe it in chat).
2. Build it to match, drawing **all** styling from the `/theme` tokens.
3. Reuse existing components; extract any new repeated pattern into
   `/components` so later screens inherit it.
4. Wire its navigation into the shell.
5. Check it on **web and phone**, commit, then move to the next.

## 7. How to work with me

- I'm a designer, not a heavy coder — explain any non-obvious decision briefly,
  and Figma analogies land well (tokens, components, variants, frames).
- **Match the reference design faithfully** before adding flourishes.
- Work in scoped chunks and let me confirm a screen looks right before moving
  on.
- **Ask before adding a dependency**, and prefer ones that work under
  react-native-web.
- Commit after each working step.

## 8. Current build status & established patterns

### What's been built

| Area | Status |
|------|--------|
| Theme + fonts + navigation skeleton | ✅ Done |
| GroupHomeScreen (Feed tab) | ✅ Done |
| Itinerary tab (ItineraryView) | ✅ Done |
| Expenses tab — empty state | ✅ Done |
| Expenses tab — submitted expense cards | ✅ Done |
| Create Poll flow (CreatePollSheet) | ✅ Done |
| Create Expense Request — Screen 1 (method selection) | ✅ Done |
| Create Expense Request — Scan Receipt (expo-image-picker) | ✅ Done |
| Create Expense Request — Screen 3 (participant selection) | ✅ Done |
| Create Expense Request — Screen 4 (expense detail) | ✅ Done |
| Item Breakdown Sheet (per-item participant management) | ✅ Done |
| Toast notification (post-send feedback) | ✅ Done |
| Home, Explore, Profile tabs | Placeholder |
| Chat tab | Placeholder |

### Mock data

All data lives in `data/trips.ts` — the exported `mockTrip` object.
- **Trip:** "Lisbon Group", 5 travellers, 6-day itinerary in June.
- **Travellers:** Harry Menday (id `'1'`, brandOrange — **this is "You"**),
  Lily Juggins (`'2'`, tertiaryBlue), Joe Boustead (`'3'`, tertiaryPink),
  Aidan Stephenson (`'4'`, tertiaryPurple), Courtney Smith (`'5'`, tertiaryGreen).
- The first traveller (id `'1'`) is always treated as the current user ("You")
  throughout the app.

### Component library (in `/components`)

| Component | Description |
|-----------|-------------|
| `AvatarStack` | Overlapping avatar circles; accepts `showAdd` for a + button |
| `SegmentedControl` | Feed / Itinerary / Chat / Expenses switcher |
| `FeedItem` | Feed card — poll, expense, photo variants |
| `QuickActionCard` | CalendarQuickAction + PollQuickAction |
| `ParticipantSheet` | Bottom sheet — invite travellers |
| `CreatePollSheet` | Bottom sheet — create a group poll |
| `ItemBreakdownSheet` | Bottom sheet — manage per-item expense participants |
| `Toast` | Slide-up notification (tertiaryBlue border, auto-dismisses 3.5s) |
| `DateStrip` | Horizontal scrollable date strip for itinerary |
| `ItineraryEventCard` | Single itinerary event card |

### Key patterns

**Full-screen flow takeover** — when a multi-step flow (like Create Expense
Request) needs to own the full screen, use early-return routing at the top of
`GroupHomeScreen` before the main `return`:
```tsx
if (expenseFlowStep === 1) return <Screen1 ... />;
if (expenseFlowStep === 2) return <ScanReceiptScreen ... />;
// etc.
```
State (`expenseFlowStep`, `scannedImageUri`, etc.) lives in `GroupHomeScreen`
and is threaded down as props. This keeps navigation simple and avoids a
separate navigator for flows that are internal to one tab.

**Bottom sheet pattern** — all sheets use the same structure:
- `Modal` with `transparent` + `animationType="none"`
- `Animated.Value` for slide position + `PanResponder` for drag-to-dismiss
- Springy open easing: `Easing.bezier(0.7, -0.4, 0.4, 1.4)` (slight overshoot)
- `BOUNCE_BUFFER = 120` extra height below screen so the bottom never gaps
  during overshoot
- Backdrop `opacity` interpolated from the slide position so it tracks swipes
- See `ParticipantSheet.tsx` as the canonical reference implementation.

**Expense split calculation** — per-item participant management drives the
Travellers Split totals. `computePersonTotals()` in Screen4 sums each person's
item shares then scales by `MOCK_TOTAL / MOCK_SUBTOTAL` to include tax. Adding
new items or changing the tax rate only requires updating the mock constants.

**Progress bar** — multi-step flows use a thin 4px track:
```tsx
<View style={progressTrack}>
  <View style={[progressFill, { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }]} />
</View>
```
Colour: `brandOrange`. Each screen declares its own `CURRENT_STEP` / `TOTAL_STEPS`.
