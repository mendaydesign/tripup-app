# TripUp — Group Travel, Made Easy

A working prototype of a **full redesign** of **TripUp**, an all-in-one mobile
app for organising group travel — from weekend getaways to festivals abroad.
Friends collaboratively build itineraries, vote on decisions, track and settle
shared expenses, and keep everyone in the loop.

Built with Expo (React Native + TypeScript) and Claude Code.

---

## What's inside

The redesign spans TripUp's core group-travel experience:

- **Home** — an overview of your trips, with a collapsing greeting header and trip cards.
- **Trip workspace** — the heart of the app, where a group plans and lives a trip together across four tabs:
  - **Feed** — live group activity: expense requests, polls, photos and updates.
  - **Itinerary** — a day-by-day timeline of events with a sticky date strip.
  - **Chat** — group messaging with inline poll cards.
  - **Expenses** — track who paid what, split costs, and settle up.
- **Polls & voting** — create polls from Chat, vote as a group, and watch results resolve in real time. Winning options drop straight into the itinerary.
- **Expense splitting** — scan a receipt or enter manually, select participants, review per-item splits, and send a request to the group.
- **Notifications** — a slide-up sheet accessible from any screen.

All screens share a single, consistent design system with collapsing scroll headers throughout.

## Design system

Everything is driven by centralised design tokens — one source of truth, no hardcoded values in components.

- **Colours** — a bold, positive palette: White `#FFFFFD`, Dark `#00101A`, Brand Orange `#FF9944`, plus tertiary Blue / Pink / Green / Purple / Sand for accents and categories.
- **Type** — Open Sauce One throughout, on a 24 / 20 / 18 / 16 / 14 / 12px scale.
- **Spacing & radius** — 10px (small) and 20px (large) tokens for consistent, soft layouts.

The brand leans into the vibrancy of travel — deliberately the opposite of the sterile, corporate look of competitors like Booking.com.

## Tech stack

- Expo SDK 54 (managed workflow) + React Native + TypeScript
- React Navigation (bottom tab shell + custom segmented control)
- react-native-web compatible — runs in the browser and in Expo Go

## Run it locally

```bash
npm install
npx expo start
```

Then:
- press **`w`** to open the web build in your browser, or
- scan the QR code with **Expo Go** on your phone.

## Build for web

```bash
npx expo export --platform web
```

Deploy the generated `dist/` folder to Vercel (set the output directory to `dist`). Connecting the GitHub repo enables auto-deploy on every push.

---

*Prototype by Harry Menday.*
