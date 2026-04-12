# Black Hat Proposal Stress Test Dashboard

A Next.js application with Firebase authentication, converted from a static HTML red team dashboard. Features a cyberpunk-inspired UI for analyzing proposal vulnerabilities and compliance gaps.

## Features

- **Firebase Authentication** — Secure login with email/password via Firebase Auth
- **Red Team Dashboard** — Interactive vulnerability register with evaluator commentary
- **Kill Shots Panel** — Top-level risks that could eliminate award chances
- **Compliance Matrix** — OT cybersecurity standards tracking
- **Scoring Ceiling** — Real-time scoring visualization by factor
- **Responsive Design** — Cyberpunk aesthetic with grid backgrounds and scanlines

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Firebase (Auth + Firestore)
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (optional — app runs in demo mode without Firebase)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

If Firebase env vars are not provided, the app runs in **demo mode** with auto-authentication.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Login page
│   ├── globals.css        # Global styles + animations
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # Dashboard (protected)
├── components/            # React components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── KillShots.tsx
│   ├── VulnerabilityTable.tsx
│   ├── ComplianceMatrix.tsx
│   ├── ScoringCeiling.tsx
│   ├── VerdictBar.tsx
│   └── Footer.tsx
├── context/
│   └── AuthContext.tsx    # Firebase auth provider
├── lib/
│   ├── firebase.ts        # Firebase config
│   └── utils.ts           # Tailwind utilities
├── data/
│   └── dashboard-data.ts  # Static dashboard data
└── types/
    └── index.ts           # TypeScript interfaces
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → **Email/Password** provider
4. Create a user in the Authentication panel
5. Copy project settings to `.env.local`

## License

Internal use only — LogiCore Systems
