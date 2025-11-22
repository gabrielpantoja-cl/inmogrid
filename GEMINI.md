# GEMINI.md

This file provides context, philosophy, and technical guidance to Gemini/AI when working on the **degux.cl** repository.

## 1. Project Identity & Vision: "The Digital Garden"

**degux.cl** has evolved. It is no longer just a real estate platform; it is a **Digital Ecosystem for Personal Branding and Community Connection** in Chile.

**The Core Concept:**
Imagine a blend of **Substack** (publishing), **Behance** (portfolio), and **Linktree** (aggregation), but rooted in local community and specific passions: **Plants, Programming, Gamer Life, and Professional Valuation (Tasaciones).**

**The Mission:**
To provide a "Digital Canvas" where users own their creativity. We are moving from *transactional* (selling houses) to *relational* (connecting people).

**Key Personas:**
1.  **The Creator/Dev:** Needs to share code snippets, setups, and projects.
2.  **The Plant Parent:** Wants to track plant growth and trade cuttings locally.
3.  **The Professional/Tasador:** Needs a serious space to validate skills and offer services (the legacy of our real estate roots).

---

## 2. Tech Stack & Infrastructure (The "Greenhouse")

We use modern, "bleeding-edge" tech to build a fast, open web.

* **Framework:** Next.js 15 (App Router) - *Strict Server Components usage.*
* **Language:** TypeScript (Strict mode).
* **Styling:** Tailwind CSS (Mobile-first, Dark Mode optimized for "Gamer" aesthetics).
* **Database:** PostgreSQL + PostGIS (Hosted on VPS).
* **ORM:** Prisma.
* **Auth:** NextAuth.js v5 (Google Provider only - Low friction).
* **Infrastructure:** Docker Compose on Digital Ocean VPS (IP: `VPS_IP_REDACTED`).
* **Assets:** Images stored externally (S3/R2 compatible) or local volume (phase dependent).

---

## 3. Domain Models & "The Mix"

The database schema reflects the eclectic mix of interests. We use a modular approach to User Profiles.

### Core: The User Profile (`/degux/tu-nombre`)
* **Bio & Links:** The Linktree replacement.
* **The "Stack":** What hardware/software do you use? (Gamer/Dev focus).
* **Location:** PostGIS point (fuzzy location for privacy) to find local peers.

### Module A: "The Green Corner" (Plants)
* **My Jungle:** Users add plants (Monsteras, Philodendrons, etc.).
* **Growth Tracker:** Simple logs of plant progress.
* **Local Exchange:** "Who has a propagation of Pothos near Valdivia?"

### Module B: "The Workshop" (Code & Projects)
* **Portfolio:** Gallery of projects (GitHub repo links + Live demos).
* **Snippets:** Small blocks of code or knowledge sharing.

### Module C: "The Office" (Legacy Real Estate/Tasaciones)
* **Valuation:** The legacy capability. Users can still draft appraisals or list specific properties, but it's now a *feature* of their personal brand, not the whole site.
* **CBR Data:** We still access the real estate data, but we frame it as "Market Intelligence" for the professional.

---

## 4. Development Phase: "Renacimiento" (Rebirth)

We are currently pivoting. The priority is **User Experience & Profile Customization**.

### Current Priority: The Universal Profile
1.  **Authentication:** Frictionless Google Login.
2.  **Onboarding:** "Choose your path" (Dev, Plant Lover, Tasador, or Mix).
3.  **Editor:** A rich-text/block editor for the user's page (Think Notion-lite).

### Future Phases
* **Phase 2 (Community):** Feed based on *interests*, not algorithms.
* **Phase 3 (Geolocal):** "Find creators near me" (using PostGIS).
* **Phase 4 (Commerce):** Selling digital goods or plant cuttings.

---

## 5. Coding Standards & Guidelines

### General Rules
* **Tone:** Code comments and UI copy should be authentic, slightly informal but professional.
* **Performance:** We are creating a "Personal Website" builder. Speed is everything. Optimize images (`next/image`) and minimize Client Components.
* **Type Safety:** No `any`. Define Zod schemas for all inputs.

### Database & Prisma
* **Multi-tenancy:** Data is owned by the `User`. Always query with `where: { userId: ... }`.
* **Naming:** Use camelCase for fields, PascalCase for Models.
* **Relations:** Keep `user` lowercase in relations for NextAuth compatibility.

### The "Setup" Component Standard
When building UI for the "Gamer/Dev Setup" section:
* Use dark aesthetics by default.
* High contrast borders.
* Interactive elements (hover effects) are encouraged.

### Real Estate Data (Legacy Standards)
* If touching the `Property` or `Tasacion` modules, **strict validation applies**:
    * **ROL:** Format `XXXXX-XXXX`.
    * **Geospatial:** Must fall within Chile bounds.
    * **Unit:** UF or CLP (Always handle conversion).

---

## 6. Essential Commands

```bash
# Start the "Garden" (Dev Server)
npm run dev

# Prune and Shape (Lint)
npm run lint

# Database Operations
npm run prisma:generate  # Sync client
npm run prisma:push      # Sync DB structure (Dev)

# Testing (Jest)
npm run test
```

---

## 7. Infrastructure Context (VPS)

Production Env: Docker Compose on Digital Ocean.

**DB Access:**
*   **Local:** `localhost:5432` (via `docker-compose.local.yml`)
*   **Prod:** `VPS_IP_REDACTED:5433` (via SSH Tunnel strongly recommended).

**Deployment:** Manual via `scripts/deploy-to-vps.sh` (currently).

---

## 8. Specific Instructions for AI Assistant (You)

*   **Be Creative:** When asked for UI components, suggest "Gamer" or "Organic" aesthetics (rounded corners, glassmorphism, neon accents for gamers; earth tones for plants).
*   **Think "Profile First":** Every feature should answer: "How does this improve the user's personal brand?"
*   **Respect the Legacy:** Do not break the existing Real Estate data structures, but wrap them in the new "Professional Module" context.
*   **Chilean Context:** Use "Comuna", "Región", and localized currency/terms by default.