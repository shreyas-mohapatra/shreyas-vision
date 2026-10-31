# AgriLens: AI-Powered Agriculture Crop Advisory Assistant

> **Theme:** Computer Vision & Visual Intelligence  
> **Mission:** Replacing slow, inconsistent visual crop inspection with server-side AI pathology detection, normalized lesion bounding boxes, sustainable advisory, and multi-week progression tracking.

---

## 1. Problem Statement & Solution Description

### Problem Statement
Smallholder farmers and field officers rely on manual visual inspection of crops. This is slow, depends on scarce expert availability, produces inconsistent diagnoses between inspectors, and misses early-stage anomalies, which causes avoidable yield loss and over- or mis-use of pesticides.

### Solution Description
AgriLens is an AI-powered Computer Vision advisory platform. Users upload crop images; a vision-capable Gemini model analyzes them server-side, identifies the crop, detects diseases, pests, nutrient deficiencies and stress patterns, localizes affected regions on the image, scores severity, and returns a structured, prioritized advisory. Repeated scans of the same field are compared to detect progression and anomalies. A 3D interactive interface makes the results intuitive and engaging.

---

## 2. Key Features

- **Computer Vision Pathology Diagnosis:** Server-side Google Gemini analysis detecting fungal, bacterial, viral diseases, insect pests, nutrient deficiencies, and water stress.
- **Normalized Bounding Box Localization:** Normalized coordinates (`x`, `y`, `w`, `h` in `[0, 1]`) overlaid directly on crop photos with hover/click synchronization.
- **Interactive 3D Foliage & Farmland:** Procedural 3D terraced farmland hero scene, interactive 3D leaf inspector with disease hotspot pins, and rotating scan loader.
- **Scan-over-Scan Progression Tracking:** Temporal comparison between scans of the same plot with an interactive before/after split slider, health score delta, and anomaly alerts.
- **Prioritized Sustainable Advisory:** 4-tier action plans (Immediate 0–48 h, Short-term 3–14 days, Season-long, Prevention) with organic/cultural steps first; chemical options include active ingredient class, PPE notes, and pre-harvest intervals.
- **Grounded Agronomy Follow-up Chat:** Contextual per-scan chat grounded strictly in the diagnosis JSON.
- **Weekly AI Field Insights:** SQL-aggregated multi-field analytics summarized into a weekly agronomic briefing.
- **Printable PDF Export:** Client-side formatted report generation for offline field sharing.
- **Strict Row-Level Security (RLS):** PostgreSQL tenant isolation enforced via `withUser` transactions and RLS policies.
- **Earthy Aesthetic (No Neon):** Warm soil, leaf, clay, wheat, and cream design tokens.

---

## 3. Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │             React 19 SPA                 │
                      │  Three.js (R3F) · Tailwind · Recharts    │
                      └────────────────────┬─────────────────────┘
                                           │ HTTPS / JWT
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │             Express.js API               │
                      │    Helmet · CORS · RateLimit · Multer    │
                      └─────────────┬──────────────┬─────────────┘
                                    │              │
                   ┌────────────────┴──┐        ┌──┴────────────────┐
                   │    Sharp Engine   │        │   Google Gemini   │
                   │  EXIF Strip & WebP│        │  Vision Pathology │
                   └───────────────────┘        └───────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────────────────────┐
                      │       PostgreSQL (withUser + RLS)        │
                      │  users · fields · scans · scan_images    │
                      │  findings · comparisons · ai_usage_log   │
                      └──────────────────────────────────────────┘
```

---

## 4. Tech Stack

- **Frontend:** React 19, Vite 8, React Router v7, Tailwind CSS v4 (earthy design tokens), `@react-three/fiber` & `@react-three/drei` (Three.js), Recharts, Lucide Icons, React Hook Form + Zod, React Hot Toast.
- **Backend:** Node.js 20+, Express.js 4, `@google/genai` (Google Gen AI SDK), Sharp (image optimization & EXIF stripping), JSON Web Token (`jsonwebtoken`), `bcryptjs` (cost 12), `pg` (node-postgres), `helmet`, `cors`, `express-rate-limit`, `morgan`, `compression`.
- **Database:** PostgreSQL (Replit Postgres / Supabase / Neon / Render Postgres) with Row Level Security (RLS) policies and embedded `pg-mem` zero-config developer fallback.
- **AI Models:** Google Gemini (`gemini-2.5-flash` or `gemini-3.8-flash`) with strict JSON schema enforcement and automatic single-repair retries.

---

## 5. Local Setup & Quickstart

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher
- (Optional) PostgreSQL database instance or connection URL

### Step-by-Step Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/your-username/agrilens.git
   cd agrilens
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If `DATABASE_URL` is omitted, AgriLens automatically boots with an in-memory PostgreSQL engine for instantaneous zero-config local evaluation).*

3. **Run the Full-Stack Server:**
   ```bash
   npm run dev
   ```
   The application will start on **http://localhost:3000** with both Express API routes and Vite frontend mounted simultaneously.

4. **Demo Account:**
   - Email: `demo@agrilens.app`
   - Password: `DemoPassword123!` (or use the one-click "Fill Demo Credentials" button on `/login`).

---

## 6. Backend API Route Specification

Base path: `/api/v1`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Creates farmer account & returns JWT |
| POST | `/auth/login` | No | Validates credentials (constant-time) |
| GET | `/auth/me` | Yes | Retrieves current user profile |
| PATCH | `/auth/me` | Yes | Updates name, region, language |
| POST | `/auth/change-password` | Yes | Updates user password |
| DELETE | `/auth/me` | Yes | Cascades full user data deletion |
| GET | `/fields` | Yes | Lists fields with latest health summaries |
| POST | `/fields` | Yes | Registers a new agricultural field |
| GET | `/fields/:id` | Yes | Field details & historical health trend series |
| PATCH | `/fields/:id` | Yes | Updates field characteristics |
| DELETE | `/fields/:id` | Yes | Deletes field & associated scans |
| POST | `/scans` | Yes | Multipart upload (1–4 images) + Gemini vision diagnosis |
| GET | `/scans` | Yes | Paginated scans list with field, severity, & date filters |
| GET | `/scans/:id` | Yes | Complete diagnosis, findings, & treatment protocol |
| GET | `/scans/:id/images/:pos` | Yes | Streams authenticated WebP crop image bytes |
| POST | `/scans/:id/reanalyze` | Yes | Re-runs Gemini vision model on existing photos |
| DELETE | `/scans/:id` | Yes | Deletes visual scan and image records |
| POST | `/fields/:fieldId/compare` | Yes | Multi-modal before/after progression comparison |
| GET | `/scans/:id/chat` | Yes | Retrieves contextual chat history |
| POST | `/scans/:id/chat` | Yes | Grounded agronomy Q&A using scan JSON |
| GET | `/dashboard/summary` | Yes | SQL aggregates, severity distribution, recurring pests |
| GET | `/dashboard/insight` | Yes | Weekly AI agronomy briefing (cached per week) |
| GET | `/health` | No | Public health check (`status: ok`) |
| GET | `/config/options` | No | Crop categories, enums, & localization options |

---

## 7. AI Integration & Safety Architecture

- **Server-Side Exclusivity:** The browser never directly contacts Google Gemini. The `GEMINI_API_KEY` lives exclusively in backend environment variables.
- **Strict Schema Conformance:** Every diagnosis, treatment plan, comparison, and weekly insight uses Gemini `responseJsonSchema` and is validated against comprehensive Zod schemas.
- **Single-Repair Resilience:** If an AI response fails schema parsing, an automated repair prompt requests corrected JSON without crashing the user session.
- **Prompt Injection Defense:** User symptom notes and chat messages are sanitized and enclosed within `<user_notes>` and `<user_message>` delimiters.
- **Responsible Chemical Rules:** Chemical inputs are described strictly by active ingredient classification (never brand names), flagged as a last resort, and accompanied by PPE and pre-harvest interval instructions.

---

## 8. Deployment Checklist

### Deploying to Render (Backend & Full-Stack)
1. Link your GitHub repository to Render.
2. Select **Web Service** and choose **Node**.
3. Render automatically picks up `render.yaml`:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Health Check Path: `/api/v1/health`
4. Set `GEMINI_API_KEY`, `DATABASE_URL`, and `JWT_SECRET` in Render Environment Variables.

### Deploying Frontend to Vercel
1. Link your repository to Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Vercel uses `vercel.json` for client-side SPA route rewrites.

---

## 9. Privacy, Security, & Limitations

- **Privacy:** Uploaded crop images are processed in-memory through Sharp to remove EXIF GPS coordinates and camera serial numbers before AI transmission. Images are used solely for plant visual pathology.
- **Advisory Disclaimer:** AgriLens is an AI-assisted diagnostic tool. Field micro-climates, soil chemistry, and root pathogens cannot always be detected via foliar imagery. Always confirm critical interventions with a certified agronomist or local extension officer.
