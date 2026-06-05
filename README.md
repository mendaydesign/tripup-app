# TripUp — Group Travel, Made Easy

A working prototype of a **full redesign** of **TripUp**, an all-in-one mobile
app for organising group travel — from weekend getaways to festivals abroad.
Friends collaboratively build itineraries, vote on decisions, track and settle
shared expenses, and keep everyone in the loop.

Built with Expo (React Native + TypeScript) and Claude Code.

---

## 🔗 Live demo

**[▶ Open the live prototype](#)** ← _replace with your Vercel URL after deploy_

Prefer the real thing on your phone? Install **Expo Go** and scan:

> _add Expo Go QR / link here_

## ✨ What's inside

The redesign spans TripUp's core group-travel experience:

- **Trip workspace** — the heart of the app, where a group plans and lives a
  trip together: a live **Feed**, a day-by-day **Itinerary**, group **Chat**,
  and shared **Expenses**.
- **Polls & voting** — shape decisions together.
- **Expense splitting & settle-up** — track who paid what, settle painlessly.
- **Explore & Profile** — discover where to go, manage your account.

All built on a single, consistent design system.

## 📱 Screens

> _add screenshots of the redesigned screens here as you build them_

| | | |
|---|---|---|
| ![Screen 1](design/screen-1.png) | ![Screen 2](design/screen-2.png) | ![Screen 3](design/screen-3.png) |

## 🎨 Design system

Everything is driven by centralised design tokens — one source of truth, no
hardcoded values in components.

- **Colours** — a bold, positive palette: White `#FFFFFD`, Dark `#00101A`,
  Brand Orange `#FF9944`, plus tertiary Blue / Pink / Green / Purple / Sand for
  accents and categories.
- **Type** — Open Sauce One throughout, on a 24 / 20 / 18 / 16 / 14 / 12px scale.
- **Spacing & radius** — 10px (small) and 20px (large) tokens for consistent,
  soft layouts.

The brand leans into the vibrancy of travel — deliberately the opposite of the
sterile, corporate look of competitors like booking.com.

## 🛠 Tech stack

- Expo (managed) + React Native + TypeScript
- React Navigation
- react-native-web (for the deployed web build)

## ▶ Run it locally

```bash
npm install
npx expo start
```

Then:
- press **`w`** to open the web build in your browser, or
- scan the QR code with **Expo Go** on your phone.

## 🌐 Build for web (deploy)

```bash
npx expo export --platform web
```

Deploy the generated `dist/` folder to Vercel (set the output/root directory to
`dist`). Connecting the GitHub repo enables auto-deploy on every push.

---

_Prototype by Harry Menday._
