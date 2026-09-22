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

The system features two primary operational roles with dedicated workspaces:

### 1. Administrator (`admin`)
* **Manage Users**: Review registered users, assign roles (`admin` or `staff`), ban/unban accounts, and configure permissions (`/admin/users`).
* **Manage Disease Records**: Centralized surveillance database to filter clinical cases by district, validation status, and cholera risk tier; edit or prune records (`/admin/records`).
* **Export Reports**: Generate and export timestamped CSV datasets for:
  - Disease Cases & Clinical Outcomes
  - Environmental Telemetry & Water Contamination
  - System Security & Operational Audit Logs (`/admin/reports`)
* **View Audit Logs**: Comprehensive surveillance event log monitoring logins, case submissions, medical validations, and outbreak alerts (`/admin/audit`).

### 2. Public Health Staff (`staff`)
* **Submit Disease Cases**: Register confirmed or suspected cholera patients with clinical signs (rice-water stool, dehydration grade, vomiting), symptoms, and suspected contaminated water sources (`/staff/cases/new`).
* **Upload Environmental Data & Datasets**: 
  - Direct form submission for water quality metrics across surveillance stations (`/staff/environmental`).
  - **Bulk CSV Ingestion**: Upload complete historical or batch telemetry datasets via CSV.
* **Validate Records**: Clinical triage review queue to review triage submissions, confirm or reject suspected cases, and attach clinical interventions (`/staff/validate`).
* **Analyze Trends**: Interactive epidemiological curves, weekly attack rates, and district risk heatmaps (`/staff/trends`).
* **Generate Reports**: Filter by district or time range and export comprehensive clinical outbreak summaries in CSV format (`/staff/reports`).
* **View Predictions & Receive Risk Alerts**: 7-day predictive district outbreak forecasting powered by `openai/gpt-oss-120b`, displaying priority containment zones and immediate risk alerts (`/staff/predictions`).

> **Note on Legacy Routes**: Existing endpoints (`/doctor/*`, `/community/*`, and `/patient/*`) are backwards-compatible and automatically redirect to their respective `/staff/*` destinations.

---

## Default Seeded Credentials

The database comes pre-seeded with test accounts for each role:

| Role | Email | Password | Default Workspace |
|---|---|---|---|
| **Administrator** | `admin@cholerapredict.test` | `CholeraPredict123!` | `/admin` |
| **Public Health Staff** | `staff@cholerapredict.test` | `CholeraPredict123!` | `/staff` |

*(Legacy logins `doctor@cholerapredict.test` and `community@cholerapredict.test` are also preserved and mapped to the Staff workspace).*

---

## Environmental Bulk CSV Format

When uploading batch environmental telemetry via `/staff/environmental`, use the following CSV headers:

```csv
district,location,waterSource,waterContaminationLevel,chlorineResidual,sanitationScore,rainfallMm,temperature,turbidityNtu,phLevel,floodRisk,notes
Gasabo,Nyabugogo Basin,River,CRITICAL,0.05,35,48.5,27.2,18.4,6.8,true,High runoff contamination
Kicukiro,Gahanga Community Well,Well,HIGH,0.12,48,32.0,26.5,9.8,7.1,false,Deficient chlorine residual
Nyarugenge,Nyamirambo Central Point,Tap,SAFE,0.55,82,12.0,25.8,1.2,7.4,false,Adequate chlorination
```

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
