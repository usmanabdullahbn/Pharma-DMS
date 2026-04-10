# MAK Pharma DMS — Developer Handoff Guide
## M.A. Kamil Farma (Pvt.) Ltd. · DRAP-Licensed GMP Manufacturing

---

## What This Is

A production-ready Next.js 14 pharmaceutical document management system.
- Real authentication (Supabase Auth)
- Role-based access control (5 roles, enforced server-side)
- 9 documentation modules: GRN → Dispensing → BMR → QC → Production → Finished Goods → Stability → Release → Audit
- Google Drive file storage (files go to Drive, metadata stays in Postgres)
- PDF export for BMR, Certificate of Analysis, and Release Certificate
- Live notification bell for pending approvals
- Immutable audit trail

---

## Prerequisites

- Node.js 18+
- A Supabase account (free at supabase.com)
- A Google Cloud account (free)
- A Vercel account (free at vercel.com)

---

## Step 1 — Install dependencies

```bash
cd mak-pharma-dms
npm install
```

---

## Step 2 — Set up Supabase

1. Go to **supabase.com** → Create new project → name it `mak-pharma-dms`
2. Wait for project to be ready (~2 min)
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor → New Query**
5. Paste the entire contents of `schema.sql` and click **Run**
6. All tables, indexes, RLS policies and triggers will be created

---

## Step 3 — Set up Google Drive

1. Go to **console.cloud.google.com**
2. Create new project: `MAK-Pharma-DMS`
3. Enable **Google Drive API**
4. Go to **IAM → Service Accounts → Create Service Account**
   - Name: `pharma-dms-drive`
   - Role: none needed at project level
5. Click the service account → **Keys → Add Key → JSON**
6. Download the JSON key file
7. Open the file and copy the **entire JSON content** as a single-line string
   → This goes into `GOOGLE_SERVICE_ACCOUNT_JSON`
8. Go to **drive.google.com**
9. Create a folder: `MAK-Farma-PharmaDocSystem`
10. Right-click folder → **Share** → paste the service account email (`pharma-dms-drive@...iam.gserviceaccount.com`) → Editor
11. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/THIS_IS_THE_ID`
    → This goes into `DRIVE_ROOT_FOLDER_ID`

---

## Step 4 — Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
DRIVE_ROOT_FOLDER_ID=1ABC_your_folder_id
NEXT_PUBLIC_APP_NAME=MAK Pharma DMS
NEXT_PUBLIC_COMPANY_NAME=M.A. Kamil Farma (Pvt.) Ltd.
NEXT_PUBLIC_DRAP_LICENSE=DRAP License No. VET-MFG-XXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5 — Test locally

```bash
npm run dev
```

Open http://localhost:3000

You'll be redirected to /login. You need to create the first user before you can log in.

---

## Step 6 — Create the first user

1. Go to your **Supabase project → Authentication → Users → Invite User**
2. Enter the QA officer's email (e.g. `qa@makamilfarma.com`)
3. They'll receive an invite email — they set their password
4. Now go to **SQL Editor** and insert their user profile:

```sql
-- Get the user's UUID from Authentication → Users
INSERT INTO users (id, email, full_name, role) VALUES
  ('paste-uuid-from-auth-users-here', 'qa@makamilfarma.com', 'QA Officer Name', 'qa_regulatory');
```

5. Repeat for all staff members with their correct roles:
   - `warehouse` — Store / Warehouse staff
   - `qc_lab` — QC Analysts
   - `production` — Production operators and supervisors
   - `qa_regulatory` — QA Officer (can approve all documents)
   - `management` — Directors (full access)

---

## Step 7 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

When prompted:
- Link to existing project? **No** → create new
- Project name: `mak-pharma-dms`
- Framework: **Next.js** (auto-detected)

After deploy, go to **Vercel Dashboard → Project → Settings → Environment Variables**
Add ALL variables from your `.env.local` file.

Then redeploy:
```bash
vercel --prod
```

---

## Step 8 — Set up custom domain (optional)

In **Vercel → Project → Settings → Domains**:
1. Add domain: `pharma.makamilfarma.com`
2. At your DNS provider, add:
   ```
   CNAME  pharma  →  cname.vercel-dns.com
   ```
3. Wait 5–10 min for DNS propagation

Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your real domain.

---

## Architecture at a Glance

```
Browser
  └─ Next.js App (Vercel)
       ├─ /login          → Supabase Auth
       ├─ /dashboard      → Server component fetches data
       ├─ /grn            → GRN module
       ├─ /dispensing     → Dispensing module
       ├─ /qc             → QC Testing module
       ├─ /bmr            → BMR module
       ├─ /production     → Production Records
       ├─ /finished-goods → FG entry
       ├─ /stability      → Stability Studies
       ├─ /release        → Batch Release
       └─ /audit          → Audit Trail
       
  API Routes (/api/*)
       ├─ All CRUD — Supabase Postgres
       ├─ Approvals — write to DB + audit log
       ├─ File uploads — Google Drive → save metadata to DB
       └─ PDF exports — generate HTML/PDF from DB data
       
  Database: Supabase (PostgreSQL + RLS)
  File Store: Google Drive (service account)
```

---

## Folder Structure

```
src/
├── app/
│   ├── (dashboard)/       ← Protected pages (each module)
│   ├── api/               ← All API routes
│   │   ├── grn/
│   │   ├── dispensing/
│   │   ├── qc/
│   │   ├── bmr/
│   │   ├── finished-goods/
│   │   ├── stability/
│   │   ├── release/
│   │   ├── audit/
│   │   ├── attachments/upload/
│   │   ├── notifications/
│   │   └── pdf/           ← BMR, CoA, Release PDF generators
│   └── login/
├── components/
│   ├── ui/                ← Shared: Badge, Btn, Modal, Field, etc.
│   └── modules/           ← One client component per module
├── lib/
│   ├── supabase/          ← Client + Server clients
│   ├── auth.ts            ← Role guards
│   ├── audit.ts           ← Audit logger
│   ├── drive.ts           ← Google Drive integration
│   └── pdf/               ← PDF generators
├── types/
│   └── index.ts           ← All TypeScript interfaces
├── middleware.ts           ← Auth route protection
schema.sql                  ← Run this in Supabase SQL editor
.env.example                ← Copy to .env.local and fill in
```

---

## Monthly Cost Estimate

| Service | Free Tier | When to upgrade |
|---|---|---|
| Supabase | $0 (500MB DB) | When DB hits 450MB (~1–2 years) |
| Vercel | $0 (hobby) | If you add team members needing preview deploys |
| Google Drive | $0 (15GB) | If uploads exceed 14GB |
| **Total** | **$0/month** | **~$48/month at scale** |

---

## Common Issues

**"relation does not exist"**
→ You forgot to run `schema.sql` in Supabase SQL Editor. Run it again.

**"User not found" after login**
→ The auth.users record exists but you forgot to INSERT into the `users` table. Do Step 6.

**Google Drive upload failing**
→ Check `GOOGLE_SERVICE_ACCOUNT_JSON` is the full JSON (not just a path). Check the service account was shared on the Drive folder with Editor permission.

**PDF shows blank**
→ The batch has no linked QC / BMR records yet. Create those first.

**Environment variables not working on Vercel**
→ After adding env vars in Vercel dashboard, you must trigger a new deployment.

---

## Contact

For questions about the business logic, pharma workflow or document structure:
Contact: Musti — Head of Business Development & New Ventures, M.A. Kamil Group
#   P h a r m a - D M S  
 