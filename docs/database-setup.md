# Database Setup — Supabase CLI Workflow

Zaujain uses the **Supabase CLI** for all database management.
Migrations live in `supabase/migrations/` and are version-controlled alongside the application code.

---

## Migration Files

| File | Description |
|---|---|
| `20240101000001_extensions.sql` | uuid-ossp, pgcrypto |
| `20240101000002_enums.sql` | All custom enum types |
| `20240101000003_functions_shared.sql` | `handle_updated_at()` trigger function |
| `20240101000004_tables_core.sql` | `users`, `themes` |
| `20240101000005_tables_experiences.sql` | `activation_keys`, `experiences`, `experience_members` |
| `20240101000006_tables_content.sql` | `memories`, `quizzes`, `questions`, `answers`, `games`, `drawings`, `time_capsules`, `notifications` |
| `20240101000007_tables_social.sql` | `achievements`, `user_achievements`, `streaks`, `wallpapers`, `admin_logs` |
| `20240101000008_indexes.sql` | All performance indexes |
| `20240101000009_functions_business.sql` | `handle_new_user`, `redeem_activation_key`, `get_experience_by_slug` |
| `20240101000010_seed.sql` | Seed data: themes, achievements |

---

## Prerequisites

Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# npm (cross-platform)
npm install -g supabase

# Verify installation
supabase --version
```

---

## First-Time Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**, choose a name (e.g. `zaujain-production`)
3. Set a strong database password and save it securely
4. Choose the region closest to your users
5. Wait ~2 minutes for provisioning

### 2. Get your Project Reference ID

In your Supabase project: **Settings → General → Reference ID**

It looks like: `abcdefghijklmnopqrst`

### 3. Link the CLI to your project

From the root of this repository:

```bash
supabase login
supabase link --project-ref your-project-ref
```

You will be prompted for your database password. This writes the link to
`supabase/.temp/` (which is gitignored — each developer links independently).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with values from **Supabase → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Deploying Migrations

### Push all migrations to your linked project

```bash
supabase db push
```

This applies every migration in `supabase/migrations/` that hasn't been applied yet,
in filename order. Safe to run multiple times — already-applied migrations are skipped.

### Check migration status

```bash
supabase migration list
```

Shows which migrations have been applied to the remote database.

---

## Local Development

Run a full local Supabase stack (Postgres + Auth + Studio + Storage):

```bash
# Start local Supabase (requires Docker)
supabase start

# Apply all migrations to local database
supabase db reset

# Open local Supabase Studio
open http://localhost:54323
```

`supabase db reset` drops and recreates the local database, then applies
all migrations from scratch. Use this after pulling new migrations from teammates.

### Local environment variables

When running locally, point your app at the local Supabase instance:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<printed by `supabase start`>
SUPABASE_SERVICE_ROLE_KEY=<printed by `supabase start`>
```

### Stop local Supabase

```bash
supabase stop
```

---

## Adding New Migrations

Never edit existing migration files after they have been applied to any environment.
Always create a new migration for schema changes.

```bash
# Generate a new timestamped migration file
supabase migration new your_description
# Creates: supabase/migrations/20240215103045_your_description.sql

# Edit the file, then apply locally
supabase db reset

# Push to remote when ready
supabase db push
```

---

## Verify the Schema

After pushing, confirm all 18 tables exist:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected tables:
`achievements`, `activation_keys`, `admin_logs`, `answers`, `drawings`,
`experience_members`, `experiences`, `games`, `memories`, `notifications`,
`questions`, `quizzes`, `streaks`, `themes`, `time_capsules`,
`user_achievements`, `users`, `wallpapers`

---

## Row Level Security

All user-owned tables have RLS enabled. Key rules:

- **Users** → read/update own profile only
- **Experience owners** → full control of their experience and all content within it
- **Experience members** (recipients) → read-only access to shared content
- **`admin_logs`** → no public policies; service role key only
- **`themes`, `achievements`** → readable by everyone (public reference data)

Never disable RLS on user-owned tables.

---

## Generating TypeScript Types

After any schema change, regenerate the TypeScript types:

```bash
supabase gen types typescript \
  --project-id your-project-ref \
  --schema public \
  > src/types/supabase-generated.ts
```

The hand-written types in `src/types/database.ts` follow the same shape and
are used throughout the codebase. Compare the generated output with `database.ts`
after major schema changes to keep them in sync.

---

## Useful CLI Reference

```bash
supabase login                          # Authenticate with Supabase
supabase link --project-ref <ref>       # Link CLI to a project
supabase db push                        # Apply pending migrations to remote
supabase db reset                       # Reset local DB and replay all migrations
supabase migration list                 # Show applied/pending migrations
supabase migration new <name>           # Create a new migration file
supabase gen types typescript ...       # Generate TypeScript types from schema
supabase start                          # Start local Supabase stack (Docker)
supabase stop                           # Stop local Supabase stack
supabase status                         # Show local service URLs and keys
```
