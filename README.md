# ML-Driven Cholera Outbreak Prediction System

An intelligent, multi-role epidemiological surveillance, clinical triage, and early warning outbreak forecasting platform designed to combat *Vibrio cholerae* epidemics.

The system combines patient symptom reporting with real-time environmental water surveillance telemetry, utilizing an advanced LLM inference engine (**`openai/gpt-oss-120b` via Groq**) and predictive scoring algorithms to identify emerging cholera hotspots, triage dehydration severity according to World Health Organization (WHO) protocols, and deliver life-saving clinical and community interventions.

---

## What the System Does

1. **AI-Driven Clinical Triage & Risk Scoring**:
   - Analyzes acute symptoms (profuse watery rice-water stool, projectile vomiting, muscle cramps, sunken eyes, skin pinch tenting >2s, weak radial pulse, oliguria).
   - Classifies dehydration level according to WHO Guidelines: **None**, **Some**, or **Severe**.
   - Generates immediate rehydration guidance (Oral Rehydration Salts / ORS schedules or emergency intravenous Ringer's Lactate requirements).

2. **Environmental Water Surveillance Telemetry**:
   - Tracks water sources (public taps, shallow wells, rivers/streams, boreholes, lake water).
   - Monitors contamination levels (*V. cholerae* / *E. coli* CFU/100ml), residual free chlorine (mg/L), rainfall (mm), ambient temperature (°C), and sanitation index scores.
   - Calculates real-time environmental hazard indices to forecast outbreak likelihood before case surges occur.

3. **Multi-District Predictive Outbreak Modeling**:
   - Computes 7-day predictive district outbreak probabilities.
   - Flags contaminated water points and triggers automated boil-water advisories and risk alerts.

4. **Automated Notification & Audit Ecosystem**:
   - Sends real-time alerts and email notifications (powered by Brevo) to doctors upon detection of high-risk community cases or environmental hazard spikes.
   - Maintains an immutable audit trail of every clinical diagnosis, validation action, environmental telemetry upload, and data export.

---

## Role-Based Capabilities

### 1. Administrator
* **Manage Users**: Review registered users, assign roles (`community`, `doctor`, `admin`), ban/unban accounts, and manage account access (`/admin/users`).
* **Manage Disease Records**: Centralized surveillance database to filter records by district, validation status, and cholera risk tier; edit or prune records (`/admin/records`).
* **Export Reports**: Generate and export timestamped CSV datasets for:
  - Disease Cases & Clinical Outcomes
  - Environmental Telemetry & Water Contamination
  - System Security & Operational Audit Logs (`/admin/reports`)
* **View Audit Logs**: Comprehensive surveillance event log monitoring logins, case submissions, medical validations, and outbreak alerts (`/admin/audit`).

### 2. Doctor / Epidemiologist
* **Submit Disease Cases**: Register confirmed or suspected cholera patients with clinical metrics, stool consistency, dehydration grade, and suspected contaminated water sources (`/doctor/cases/new`).
* **Upload Environmental Data**: Input water quality lab results, residual chlorine levels, precipitation, and sanitation scores across surveillance stations (`/doctor/environmental`).
* **Validate Records**: Clinical triage review queue to review community self-reports, confirm or reject suspected cases, and attach clinical guidance (`/doctor/validate`).
* **Analyze Trends & Generate Reports**: Interactive epidemiological curves, weekly attack rates, and district risk heatmaps; export clinical outbreak summaries (`/doctor/trends` & `/doctor/reports`).
* **View Predictions & Receive Risk Alerts**: Outbreak probability forecasting powered by `openai/gpt-oss-120b`, displaying priority containment zones and immediate risk alerts (`/doctor/predictions`).

### 3. Community User
* **View Dashboards**: District-specific epidemic warning levels, clean water directives, and emergency hotline access (`/community`).
* **Provide Symptoms**: Interactive symptom assessment form that triages dehydration signs, calculates risk, and guides users on immediate home ORS preparation while notifying local clinics (`/community/symptoms`).
* **Analyze Statistics**: Public health transparency graphs displaying local case counts, attack rate trends, and water safety benchmarks (`/community/statistics`).
* **View Predictions**: 7-day outbreak forecast for the user's district with preventive advisories (`/community/predictions`).
* **Monitor High-Risk Regions**: Live regional hotspot maps with active boil-water and chlorinated water collection alerts (`/community/hotspots`).

---

## Default Seeded Credentials

The database comes pre-seeded with test accounts for each role:

| Role | Email | Password | Default Landing Page |
|---|---|---|---|
| **Administrator** | `admin@cholerapredict.test` | `CholeraPredict123!` | `/admin` |
| **Doctor** | `doctor@cholerapredict.test` | `CholeraPredict123!` | `/doctor` |
| **Community User** | `community@cholerapredict.test` | `CholeraPredict123!` | `/community` |

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **AI & LLM**: Groq Cloud SDK with LangChain (`openai/gpt-oss-120b`)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with Role-Based Access Control (RBAC) & Middleware Protection
- **Styling & UI**: Tailwind CSS v4, Shadcn UI, Radix UI, Lucide Icons, Recharts
- **Email Delivery**: Brevo Transactional Email API

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- pnpm 10+
- PostgreSQL database instance running locally or in the cloud

### 2. Environment Configuration
Create or verify `.env.local`:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/ml_driven_cholera?schema=public"

BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="openai/gpt-oss-120b"

BREVO_API_KEY="your-brevo-api-key"
BREVO_EMAIL_USER="your-email@example.com"
BREVO_SENDER_EMAIL="your-email@example.com"
BREVO_SENDER_NAME="ML Driven Cholera Outbreak Prediction System"
```

### 3. Database Migration & Seeding
```bash
# Push schema to PostgreSQL
pnpm db:push

# Seed admin, doctor, community users, and initial surveillance telemetry
pnpm db:seed
```

### 4. Running the Application
```bash
# Development server
pnpm dev

# Production build
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
