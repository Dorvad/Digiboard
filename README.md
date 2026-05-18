# לוח השעם הדיגיטלי

An interactive Hebrew RTL workshop tool. Participants scan a QR code, submit two anonymous notes from their phones, and the notes appear live on a digital corkboard split into **הגלוי** (the visible) and **הנסתר** (the hidden). The admin clicks notes to flip them open with a 3D pushpin animation.

---

## Routes

| Route | Description |
|-------|-------------|
| `/board/:sessionId` | Admin / projected corkboard screen |
| `/join/:sessionId` | Mobile participant submission screen |
| `/` | Redirects to `/board/demo` |

---

## Setup

### 1. Install dependencies

```bash
npm install
npm run dev
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to initialize.
3. Go to **Settings → API**.
4. Copy your **Project URL** and **anon public key**.

### 3. Create `.env.local`

Create a file named `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the database schema

1. Go to your Supabase project → **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql`.
3. Paste it into the SQL Editor and click **Run**.

This creates:
- `sessions` table (slug, title, is_locked)
- `notes` table (type, content, status, position, rotation, color, pin)
- Indexes and an `updated_at` trigger
- `REPLICA IDENTITY FULL` on both tables (required for realtime DELETE events)
- Open RLS policies (suitable for workshop use — see security note below)
- Realtime publication for both tables

> **Security note:** The RLS policies allow any anonymous user to read, insert, and update records. This is intentional for a lightweight workshop app where the board URL acts as the soft admin link. For production with authentication, restrict these policies.

### 5. Enable Realtime

The SQL schema adds both tables to `supabase_realtime`. Verify this manually:

1. Go to **Database → Replication** in your Supabase dashboard.
2. Confirm that `notes` and `sessions` are listed under **supabase_realtime** publication.
3. If not, toggle them on from this panel.

### 6. Test locally

1. Open `/board/demo` on your desktop — the admin/projector screen loads and auto-creates the session.
2. Click **קישור הצטרפות** in the toolbar to see the QR code and participant URL.
3. Open `/join/demo` in another tab or on a phone.
4. Fill in at least one field and click **שלח/י**.
5. Confirm the note appears closed on the board (landing animation).
6. Click the closed note on the board — pin lifts, note flips, content reveals, pin returns, note stays open.
7. Submit another note — confirm it appears live.
8. Click **איפוס לוח** → confirm → all notes are deleted.
9. Click **נעל שליחה** → go to the mobile form → confirm the locked message appears.
10. Click **פתח שליחה** → confirm the form is usable again.

### 7. Deploy to Vercel

1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.
5. Open `https://your-app.vercel.app/board/demo`.

The `vercel.json` file handles SPA routing — all paths are rewritten to `index.html`.

---

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** (layout utilities; visual design lives in `src/styles/corkboard.css`)
- **Supabase** — PostgreSQL database + realtime subscriptions
- **Framer Motion** — mobile success animation
- **qrcode.react** — QR code generation
- **React Router** — client-side routing

---

## Fonts

Loaded from Google Fonts:
- **Caveat** — handwritten note font (replaces Gveret Levin Alef Alef Alef)
- **Frank Ruhl Libre** — Hebrew serif display font
- **Heebo** — Hebrew sans-serif UI font

To use **Gveret Levin Alef Alef Alef** (the original font), download it and add a `@font-face` rule in `src/styles/globals.css`, then update `--font-hand`.

---

## Project structure

```
src/
  main.tsx               # Entry point with BrowserRouter
  App.tsx                # Routes
  lib/
    supabase.ts          # Supabase client singleton
    session.ts           # DB helpers (upsertSession, insertNote, etc.)
    noteLayout.ts        # Seeded note positioning algorithm
  types/
    database.ts          # TypeScript types for Supabase tables
  styles/
    globals.css          # Design tokens + Tailwind base
    corkboard.css        # Cork texture, note flip animation, all board CSS
  components/
    Board/
      CorkBoard.tsx      # Main board + realtime + admin actions
      BoardSide.tsx      # Left/right cork panel
      NoteCard.tsx       # Note with 3D flip animation state machine
      Pushpin.tsx        # SVG pushpin (5 color tones)
      AdminToolbar.tsx   # Bottom glassmorphic toolbar
      QRModal.tsx        # QR code overlay
    Mobile/
      ParticipantForm.tsx  # Mobile entry form
      TextNoteField.tsx    # Field with progress underline
      SuccessState.tsx     # Post-submit celebration
    shared/
      LoadingState.tsx
      ErrorState.tsx
      ConfirmDialog.tsx
supabase/
  schema.sql             # Full DB schema — run in Supabase SQL Editor
```
