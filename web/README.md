# CredX Web Application
## Environment variables (.env)

Add a `.env` file at the project root (or use `.example.env`). Below are the common keys used by this project and a short description.

| Key | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Full Postgres connection string used by Prisma (overrides DB_* keys) | `postgresql://user:pass@localhost:6543/credx` |
| `GEMINI_API_KEY` | API key for Gemini embeddings/summarization | `ya29...` |
| `GEMINI_EMBED_ENDPOINT` | Gemini embeddings endpoint | `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent` |
| `GEMINI_EMBED_MODEL` | Gemini embedding model name | `text-embedding-004` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase public URL, if used | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client SDK | `anon-key` |
| `SITE_URL` | Base URL of the site (used for sitemap generation) | `https://your.domain.com` |


## Scripts 

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server with live reload |
| `npm run build` | Create a production build |
| `npm start` | Start the production server (after build) |
| `npm run lint` | Run ESLint checks |

## Database migrations

This project uses SQL migrations driven by `node-pg-migrate`. Migration files live in the `migrations/` folder.

Run migrations:

```bash
# run all pending migrations (requires DATABASE_URL in env)
npm run migrate -- up
```

To setup Prisma after migration, run:

```bash
npx prisma db pull
npx prisma generate
```

## Build & production

Build the app and start the production server:

```bash
npm run build
npm start
```