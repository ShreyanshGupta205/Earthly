# 🌍 Earthly — Carbon Footprint Awareness Platform

> Built for **Hack2skills 2025** · Powered end-to-end by **Google**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%201.5%20Flash-blue)](https://aistudio.google.com)
[![GA4](https://img.shields.io/badge/Google-Analytics%204-yellow)](https://analytics.google.com)

---

## 🟢 Google Products Used

| Product | Purpose | Cost |
|---|---|---|
| **Google Gemini 1.5 Flash** | AI-powered weekly carbon insights | ✅ Free (AI Studio) |
| **Firebase Auth** | Google Sign-In + email/password | ✅ Free (Spark plan) |
| **Firebase Firestore** | Real-time NoSQL database | ✅ Free (Spark plan) |
| **Firebase Storage** | Avatar image storage | ✅ Free (Spark plan) |
| **Google Analytics 4** | User event tracking | ✅ Always free |
| **Google Fonts** | Inter + Space Grotesk typography | ✅ Always free |
| **Google Cloud Run** | Production deployment | ✅ Free tier (2M req/month) |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd earthly-app
npm install
```

### 2. Set Up Firebase (Free)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a new project** (or use existing)
3. Enable **Authentication**:
   - Authentication → Sign-in method → Enable **Email/Password**
   - Authentication → Sign-in method → Enable **Google**
4. Enable **Firestore Database**:
   - Firestore Database → Create database → Start in **production mode**
   - Copy the security rules from `firestore.rules` → paste into Firestore Rules tab → Publish
5. Enable **Storage** (for avatars):
   - Storage → Get started → Start in production mode
6. Get your **Web App credentials**:
   - Project Settings → General → Your Apps → Add App → Web
   - Copy all `firebaseConfig` values

### 3. Get Gemini API Key (Free)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select your Firebase project or create a new one
4. Copy the key

### 4. Set Up Google Analytics 4 (Free, Optional)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a **GA4 property**
3. Get the **Measurement ID** (starts with `G-`)

### 5. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

GEMINI_API_KEY=AIza...your-gemini-key...
```

### 6. Run Locally
```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
earthly-app/
├── app/
│   ├── (auth)/login/          # Login page (Google + email)
│   ├── (auth)/signup/         # 2-step signup
│   ├── (dashboard)/           # All dashboard pages
│   │   ├── layout.tsx         # Sidebar + mobile nav
│   │   ├── page.tsx           # Main dashboard
│   │   ├── log/               # Activity logging
│   │   ├── insights/          # AI insights (Gemini)
│   │   ├── history/           # Activity history + CSV export
│   │   └── settings/          # Profile settings
│   ├── (landing)/page.tsx     # Landing page
│   └── api/
│       ├── insights/          # Gemini AI route
│       └── log/               # CO₂ calculation route
├── components/
│   ├── dashboard/             # CO2Ring, WeeklyBarChart, etc.
│   ├── landing/               # Hero, EarthOrbit, etc.
│   ├── providers/             # Auth + Query providers
│   └── ui/                    # Reusable UI primitives
├── lib/
│   ├── firebase/              # Auth, Firestore, Storage
│   ├── co2/                   # Calculator + 28 emission factors
│   ├── ai/                    # Gemini integration
│   └── analytics.ts           # GA4 event tracking
├── types/                     # TypeScript interfaces
├── firestore.rules            # Security rules
└── Dockerfile                 # For Cloud Run
```

---

## 🗃️ Firestore Data Model

```
users/{userId}
  ├── (profile fields)         # username, greenScore, streakDays, etc.
  ├── activityLogs/{logId}     # All emission logs
  ├── dailySummaries/{date}    # Per-day CO₂ totals by category
  ├── actions/{actionId}       # Daily recommended actions
  └── insights/{weekStart}     # Cached Gemini AI insights
```

---

## ☁️ Deploy to Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/earthly

# Deploy to Cloud Run
gcloud run deploy earthly \
  --image gcr.io/YOUR_PROJECT_ID/earthly \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=...,GEMINI_API_KEY=..."
```

---

## 🔐 Security

- **Firestore Rules**: Users can only read/write their own subcollections
- **Gemini API key**: Server-side only (`GEMINI_API_KEY` — no `NEXT_PUBLIC_` prefix)
- **Firebase client keys**: Safe to expose (scoped by Firestore rules)
- **Auth cookie**: Lightweight session for middleware route protection

---

## 📊 Emission Factors

28 factors sourced from:
- **IPCC 2023** — transport, food, energy, travel, shopping, waste, home
- **CEA India 2023** — grid electricity emission factor (0.82 kg CO₂/kWh)
- **UK DEFRA** — supplementary factors

---

*Built with ❤️ for Hack2skills 2025 · 100% Google-powered · 100% free*
