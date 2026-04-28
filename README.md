# EraseMate

AI-powered background removal as a web application and REST API. Built on U2Net and ISNet with alpha matting for production-grade edge quality.

**Live:** https://erasemate-k7zq.vercel.app

---

## Stack

| | |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS — deployed on Vercel |
| Backend | Python, FastAPI, REMBG, Pillow — deployed on Hugging Face Spaces |
| Infrastructure | Supabase (Auth, PostgreSQL, Storage) |

---

## Quick Start

**Backend**

```bash
cd backend
cp .env.example .env        # fill in Supabase credentials
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local  # fill in Supabase + API URL
npm install && npm run dev
```

Database: run `backend/supabase_migration.sql` once in the Supabase SQL Editor.

---

## API

### Remove background

```
POST /api/remove-background
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `file` | File | required | JPEG, PNG, WebP, BMP, TIFF, GIF — max 25 MB |
| `model` | string | `auto` | `auto`, `u2net`, `u2net_human_seg`, `isnet-general-use` |
| `enhance_edges` | boolean | `true` | Median filter + Gaussian blend post-processing |
| `bg_color` | string | — | Hex colour for background. Returns JPEG; omit for transparent PNG |
| `store` | boolean | `true` | Save result to Supabase Storage (authenticated users only) |

Returns a streaming image response. Response headers include `X-Processing-Time-Ms`, `X-Model-Used`, `X-Original-Size`, `X-Output-Bytes`, and `X-Result-URL`.

```bash
curl -X POST https://your-api/api/remove-background \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg" \
  --output result.png
```

### Other endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service status and configuration |
| GET | `/api/models` | Available models |
| POST | `/api/remove-background/batch` | Up to 10 images — authenticated only |
| GET | `/api/user/usage` | Usage count and remaining quota |

---

## Models

| ID | Best For |
|---|---|
| `auto` | Detects portrait vs. object automatically — recommended |
| `u2net` | Products, objects, animals |
| `u2net_human_seg` | Portraits and people |
| `isnet-general-use` | Maximum edge sharpness |

---

## Environment Variables

**Backend** — `backend/.env`

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_STORAGE_BUCKET=erasemate-results
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=25
FREE_LIMIT=5
MAX_IMAGE_SIDE=2048
```

**Frontend** — `frontend/.env.local`

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Deployment

**Frontend — Vercel:** Connect the `frontend/` directory, add environment variables, deploy. SPA routing is pre-configured in `vercel.json`.

**Backend — Hugging Face Spaces:** Create a Docker Space, push `hf-erasemate/`, add environment variables as repository secrets. The U2Net model pre-warms at startup.

---

## License

MIT
