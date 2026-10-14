# Amrita Dharma Calendar & Slokha Library (ADM)

> **Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.**

A complete, production-ready, responsive full-stack platform built for the **Department of Amrita Darshanam (ADM)**, Amrita Vishwa Vidyapeetham. This platform empowers students, faculty, devotees, and families to discover Hindu festivals, Amrita spiritual occasions, pooja requirements, interactive checklists, multilingual slokhas with verse-by-verse meanings, and downloadable native Unicode PDFs.

---

## 🏛️ Project Identity & Aesthetics

- **Name:** Amrita Dharma Calendar
- **Subtitle:** *Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.*
- **Visual Design:** Warm ivory/cream background (`#FDFBF7`), deep sacred maroon (`#6E1B24`), vibrant saffron accents (`#E06A26`), and muted temple gold (`#C89B3C`).
- **Typography:** Classical serif display headings (Cinzel, Playfair Display) paired with clean geometric body type (Inter) and native Unicode font support for **Sanskrit Devanagari**, **Tamil**, **Telugu**, and **English IAST transliterations**.
- **Amrita Heritage:** Dedicated support for Amma's Birthday, Amrita Darshanam annual events, and the complete 30-item Parayanam sequence from the official *Sri Mahaganapathi Homam* liturgy.

---

## 🌟 Key Features

### 1. Interactive Hindu & Amrita Calendar (`/calendar`)
- **Three Views:** Month Grid, Week View, and Agenda / Chronological List View.
- **Year & Month Navigation:** Dynamic selector with instant "Today" reset and month-to-month browsing.
- **Lunar Calendar Awareness:** Stores festival dates explicitly by year rather than naive Gregorian recurrence.
- **Spiritual Distinction:** Clearly differentiates Pan-Indian Hindu Festivals from Amrita Darshanam Institutional Occasions with badges and filters.
- **Interactive Detail Drawer:** Clicking any calendar date reveals occasion significance, deities, recommended parayanam materials, language availability, and direct links to slokhas and PDF downloads.

### 2. Dedicated Sri Mahaganapathi Homam Liturgy (`/occasions/sri-mahaganapathi-homam-2026`)
- Faithfully imports and preserves the exact **30-item Parayanam sequence** from `SRI MAHAGANAPATHI HOMAM JULY.docx` conducted at Amrita School of Engineering, Chennai.
- Preserves the authentic order: *Amma Dhyanam*, *Sri Lalitasahasranama Stotram*, *Sri Ganesha Dhyanam*, *Sri Ganesha Pancharatnam*, *Sankata Nashana Ganapathi Stotram*, *Sri Guru Stotram*, through the Vedic Suktams (*Medha*, *Aikyamathya*, *Purusha*, *Sri Suktham*) to *Vishnu Sahasranama Stotram* and *Sri Mahalakshmi Ashtakam*.

### 3. Dedicated Festival Occasion Pages (`/festivals/[slug]`)
- Comprehensive guides for major festivals: **Diwali / Deepavali**, **Krishna Janmashtami**, **Vinayaka Chaturthi**, **Navaratri**, **Vijayadashami**, **Maha Shivaratri**, **Pongal**, **Ugadi**, **Onam**, **Guru Purnima**, **Akshaya Tritiya**, and more.
- **Step-by-Step Pooja Checklist:** Interactive checklist component with progress tracking and persistent `localStorage` support.
- Cultural significance, associated deities, scriptural background, and recommended prayer parayanam.

### 4. Multilingual Slokha Library (`/slokhas`, `/slokhas/[slug]`)
- **Multilingual Viewer:** Instant switching between **Sanskrit (Devanagari)**, **Tamil**, **Telugu**, and **English (IAST)**.
- **Verse-by-Verse Presentation:** Clear verse numbering, phonetic line spacing, and contextual English meanings.
- **Devotional Reading Controls:** Adjustable text sizing (Small / Normal / Large / Extra Large), one-click verse copying, and print-friendly styling (`@media print`).
- **Traditional Context:** Respectful descriptions of deity, spiritual benefits as traditional beliefs, and scriptural origins.

### 5. Native Unicode PDF Generation Engine (`/api/pdf/[slug]/[language]`)
- Server-side binary PDF generation built on `pdf-lib` and `fontkit` with embedded `@fontsource/noto-sans-devanagari`, `@fontsource/noto-sans-tamil`, and `@fontsource/noto-sans-telugu`.
- **Sacred Amrita Border Layout:** Gold framing, Amrita Darshanam header, page numbering, metadata block, and verse formatting.
- **Instant Downloads:** Accessible on every slokha page and the dedicated central Download Center (`/downloads`).

### 6. Global Search & Command Palette (`Cmd+K` / `Ctrl+K`)
- Live search modal across festivals, occasions, slokhas, deities, and languages with debounced API queries.

### 7. Administrative Management & Audit Queue (`/admin`, `/admin/login`)
- **Protected Dashboard:** JWT-based session authentication with bcrypt password encryption.
- **CRUD Operations:** Create, update, and manage festivals, occasions, and slokhas.
- **Integrity Audit Queue:** Highlights items requiring scholar verification (e.g., missing English verses in source documents, variant recensions like *Vikalpa Sankarpanam* in *Bilvashtakam*).
- **Feedback Inbox:** Devotee suggestions and student queries review workflow.

---

## 📂 Source Documents & Ingestion Integrity

The library was seeded from the 6 source documents provided by Amrita Darshanam:
1. `SRI MAHAGANAPATHI HOMAM JULY.docx`: Reference liturgy with 30-item sequence (`data/homam_parayanam.json`).
2. `SANSKRIT.docx`: Devanagari recensions for 20 stotras.
3. `TAMIL.docx`: Tamil script recensions for 24 stotras.
4. `TELUGU.docx`: Telugu script recensions for 22 stotras.
5. `TELUGU (1).docx`: Verified byte-identical duplicate of `TELUGU.docx`.
6. `ENGLISH.docx`: English IAST transliterations and translations for 25 stotras.

### Cultural Integrity & Audit Disclosures
- **Lalita & Vishnu Sahasranamam (English):** In `ENGLISH.docx`, lines 7 and 224 contain section headers without verse body text. In accordance with scholarly standards, placeholder text was **not** hallucinated; these entries are logged in the Admin Audit Queue (`pending_review`) for future input.
- **Bilvashtakam (Vikalpa Sankarpanam):** Preserved the 8-verse alternative variant recension present in the Sanskrit, Tamil, and English source files.
- **Stotra Asymmetries:** *Sri Sudarshana Ashtakam*, *Dwadasa Nama Panjaram*, and *Ashtalakshmi Stotram* are available in English, Tamil, and Telugu; marked as "Not available yet" for Sanskrit with audit review entries.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with custom Indian sacred palette |
| **Database** | SQLite with Prisma ORM |
| **PDF Generation** | `pdf-lib` + `fontkit` + `@fontsource` (Devanagari, Tamil, Telugu, Latin-Ext) |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **Data Ingestion** | Python 3 (`python-docx`, SQLite, Regex parsing) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- Python 3.9+ with `python-docx` (for re-running data extraction)

### 1. Installation
```bash
cd /Users/niteshram/.gemini/antigravity/scratch/amrita-dharma-calendar
npm install
```

### 2. Environment Configuration
Create or verify `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="amrita_dharma_calendar_secret_key_2026_Darshanam"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup & Seeding
The database is already pre-seeded at `prisma/dev.db`. To re-seed from scratch:
```bash
npx prisma db push
python3 scripts/parse_and_seed.py
```

### 4. Running the Application

#### Production Mode (Recommended)
```bash
npm run build
npm run start
```
The application will be live at `http://localhost:3000`.

#### Development Mode
```bash
npm run dev
```

---

## 🔑 Administrative Access

- **Login URL:** `http://localhost:3000/admin/login`
- **Default Email:** `admin@amrita.edu`
- **Default Password:** `AmritaDarshanam@2026`

Once authenticated, administrators can:
1. Add new festivals and lunar dates for upcoming years.
2. Edit occasion rituals, deities, and pooja checklists.
3. Review and resolve flagged items in the **Audit Queue**.
4. Moderate devotee feedback and prayer inquiries.

---

## 📡 API Reference

- `GET /api/search?q={query}`: Global search across festivals, occasions, and slokhas.
- `GET /api/pdf/[slug]/[language]`: Streams a dynamically generated, high-resolution native script PDF (`sanskrit`, `tamil`, `telugu`, `english`).
- `POST /api/feedback`: Devotee feedback submission.
- `POST /api/admin/login`: Admin authentication returning a signed JWT.
- `GET/POST /api/admin/festivals`: Protected festival management.
- `GET/POST /api/admin/occasions`: Protected occasion management.
- `GET/POST /api/admin/slokhas`: Protected slokha management.
- `GET/PATCH /api/admin/review`: Audit review queue for scholar verification.

---

## 🪷 Department of Amrita Darshanam

Amrita Vishwa Vidyapeetham  
*Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.*
