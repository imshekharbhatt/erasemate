"""
EraseMate Backend — FastAPI + REMBG + Pillow + Supabase Storage
Deploy on Railway — No Cloudflare R2 or credit card required.
"""

import os
import io
import uuid
import time
import logging
from datetime import datetime
from functools import lru_cache
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.gzip import GZipMiddleware
from PIL import Image, ImageFilter
from rembg import remove, new_session
import httpx

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("erasemate")

# ─── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EraseMate API",
    description="Professional AI background removal — Supabase Storage edition",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Middleware ──────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Processing-Time-Ms",
        "X-Model-Used",
        "X-Original-Size",
        "X-Output-Bytes",
        "X-Result-URL",
    ],
)

# ─── Config ──────────────────────────────────────────────────────────────────
SUPABASE_URL         = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY    = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Supabase Storage bucket — create this in Supabase dashboard → Storage
STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "erasemate-results")

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
FREE_LIMIT       = int(os.getenv("FREE_LIMIT", "5"))
ALLOWED_TYPES    = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/gif"}


# ─── Supabase Storage helpers ────────────────────────────────────────────────

async def upload_to_supabase_storage(
    data: bytes,
    path: str,
    content_type: str = "image/png",
) -> Optional[str]:
    """
    Upload bytes to Supabase Storage and return the public URL.
    Uses the service-role key so it bypasses RLS.
    Returns None if not configured or on error.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("Supabase Storage not configured — skipping upload")
        return None

    upload_url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{path}"
    headers = {
        "Authorization":  f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey":         SUPABASE_SERVICE_KEY,
        "Content-Type":   content_type,
        "Cache-Control":  "public, max-age=31536000",
        "x-upsert":       "true",   # overwrite if exists (idempotent)
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(upload_url, content=data, headers=headers)

        if resp.status_code in (200, 201):
            public_url = (
                f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{path}"
            )
            logger.info(f"Uploaded → {public_url}")
            return public_url
        else:
            logger.error(f"Storage upload failed {resp.status_code}: {resp.text}")
            return None
    except Exception as exc:
        logger.error(f"Storage upload error: {exc}")
        return None


# ─── Supabase Auth helpers ───────────────────────────────────────────────────

async def verify_token(
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    """Verify Supabase JWT. Returns user dict or None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    if not SUPABASE_URL:
        return {"id": "anonymous", "email": None}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY},
            )
        if resp.status_code == 200:
            return resp.json()
    except Exception as exc:
        logger.warning(f"Token verification error: {exc}")
    return None


async def get_usage_count(user_id: str) -> int:
    """Return how many images the user has processed today."""
    if not SUPABASE_URL:
        return 0
    today = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/usage",
                params={"user_id": f"eq.{user_id}", "date": f"eq.{today}", "select": "count"},
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
        if resp.status_code == 200:
            data = resp.json()
            return data[0]["count"] if data else 0
    except Exception as exc:
        logger.warning(f"get_usage_count error: {exc}")
    return 0


async def increment_usage(user_id: str) -> None:
    """Upsert (increment) today's usage row for the user."""
    if not SUPABASE_URL:
        return
    today = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/usage",
                json={"user_id": user_id, "date": today, "count": 1},
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Prefer": "resolution=merge-duplicates",
                    "Content-Type": "application/json",
                },
            )
    except Exception as exc:
        logger.warning(f"increment_usage error: {exc}")


# ─── REMBG Session Cache ─────────────────────────────────────────────────────

@lru_cache(maxsize=4)
def get_session(model: str = "u2net"):
    logger.info(f"Loading REMBG model: {model}")
    return new_session(model)


@app.on_event("startup")
async def startup_event():
    logger.info("Pre-warming REMBG models…")
    try:
        get_session("u2net")
        get_session("u2net_human_seg")
        logger.info("Models loaded ✓")
    except Exception as exc:
        logger.warning(f"Model pre-warm failed (will load on demand): {exc}")


# ─── Image Processing ────────────────────────────────────────────────────────

def auto_select_model(image: Image.Image) -> str:
    try:
        w, h = image.size
        cx, cy = w // 2, h // 2
        region = image.crop((cx - w//8, cy - h//4, cx + w//8, cy + h//4)).convert("RGB")
        pixels = list(region.getdata())
        skin = sum(
            1 for r, g, b in pixels
            if r > 95 and g > 40 and b > 20 and r > g and r > b and abs(r - g) > 15
        )
        if skin / max(len(pixels), 1) > 0.25 and h > w:
            return "u2net_human_seg"
    except Exception:
        pass
    return "u2net"


def refine_mask(img_rgba: Image.Image) -> Image.Image:
    import numpy as np
    r, g, b, a = img_rgba.split()
    a          = a.filter(ImageFilter.MedianFilter(size=3))
    a_smooth   = a.filter(ImageFilter.GaussianBlur(radius=0.8))
    a_arr        = np.array(a,        dtype=np.float32)
    a_smooth_arr = np.array(a_smooth, dtype=np.float32)
    weight       = (a_arr / 255.0) ** 2
    blended      = (a_arr * weight + a_smooth_arr * (1 - weight)).clip(0, 255).astype(np.uint8)
    return Image.merge("RGBA", (r, g, b, Image.fromarray(blended, mode="L")))


def process_image(
    raw: bytes,
    model: str = "auto",
    enhance_edges: bool = True,
    bg_color: Optional[str] = None,
) -> tuple[bytes, dict]:
    t0 = time.perf_counter()

    try:
        img = Image.open(io.BytesIO(raw)).convert("RGBA")
    except Exception as exc:
        raise HTTPException(422, f"Cannot open image: {exc}")

    orig_w, orig_h = img.size
    metadata: dict = {"original_width": orig_w, "original_height": orig_h}

    # Downscale very large images for speed, upscale after
    MAX_SIDE = 4096
    scale = 1.0
    if max(orig_w, orig_h) > MAX_SIDE:
        scale = MAX_SIDE / max(orig_w, orig_h)
        img = img.resize((int(orig_w * scale), int(orig_h * scale)), Image.LANCZOS)
        logger.info(f"Downscaled {orig_w}x{orig_h} → {img.size}")

    if model == "auto":
        model = auto_select_model(img.convert("RGB"))
    metadata["model"] = model

    session = get_session(model)
    result: Image.Image = remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    if enhance_edges:
        result = refine_mask(result)

    if scale < 1.0:
        result = result.resize((orig_w, orig_h), Image.LANCZOS)

    if bg_color and bg_color.lower() != "transparent":
        canvas = Image.new("RGBA", result.size, bg_color)
        canvas.paste(result, mask=result.split()[3])
        final, fmt, ext = canvas.convert("RGB"), "JPEG", "jpg"
    else:
        final, fmt, ext = result, "PNG", "png"

    buf = io.BytesIO()
    if fmt == "JPEG":
        final.save(buf, format="JPEG", quality=95, optimize=True)
    else:
        final.save(buf, format="PNG", optimize=True, compress_level=6)

    output_bytes = buf.getvalue()
    elapsed      = time.perf_counter() - t0

    metadata.update({
        "output_format":     ext,
        "output_size_bytes": len(output_bytes),
        "processing_time_ms": round(elapsed * 1000),
    })
    logger.info(f"Processed {orig_w}x{orig_h} in {elapsed:.2f}s  model={model}")
    return output_bytes, metadata


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"service": "EraseMate API", "status": "ok", "version": "1.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(), "storage": "supabase"}


@app.post("/api/remove-background")
async def remove_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str = "auto",
    enhance_edges: bool = True,
    bg_color: Optional[str] = None,
    store: bool = True,
    user: Optional[dict] = Depends(verify_token),
):
    """
    Remove the background from a single image.

    - **file**          — JPG / PNG / WebP / BMP / TIFF / GIF  (max 25 MB)
    - **model**         — auto | u2net | u2net_human_seg | isnet-general-use
    - **enhance_edges** — post-processing alpha refinement (default true)
    - **bg_color**      — hex colour to composite onto, e.g. `#ffffff` (optional)
    - **store**         — save result to Supabase Storage (authenticated users only)
    """

    # Content-type check
    if file.content_type not in ALLOWED_TYPES:
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        if ext not in {"jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif", "gif"}:
            raise HTTPException(415, f"Unsupported file type: {file.content_type}")

    # Size check
    raw     = await file.read()
    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(413, f"File too large ({size_mb:.1f} MB). Max {MAX_FILE_SIZE_MB} MB.")

    # Auth + rate limit
    user_id          = user["id"] if user else "anonymous"
    is_authenticated = user is not None and user_id != "anonymous"

    if is_authenticated:
        usage     = await get_usage_count(user_id)
        user_plan = (user.get("user_metadata") or {}).get("plan", "free")
        if user_plan == "free" and usage >= FREE_LIMIT:
            raise HTTPException(
                429,
                f"Free tier limit reached ({usage}/{FREE_LIMIT} today). "
                "Upgrade for unlimited processing."
            )

    # Process
    try:
        output_bytes, metadata = process_image(
            raw,
            model=model,
            enhance_edges=enhance_edges,
            bg_color=bg_color or None,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected processing error")
        raise HTTPException(500, f"Processing failed: {exc}")

    # Track usage (background)
    if is_authenticated:
        background_tasks.add_task(increment_usage, user_id)

    # Upload to Supabase Storage (background — response is not blocked)
    result_url: Optional[str] = None
    if store and is_authenticated:
        job_id       = str(uuid.uuid4())
        ext          = metadata["output_format"]
        storage_path = f"results/{user_id}/{job_id}.{ext}"
        content_type = "image/png" if ext == "png" else "image/jpeg"
        background_tasks.add_task(
            upload_to_supabase_storage, output_bytes, storage_path, content_type
        )
        # Build URL optimistically — valid once background task finishes
        result_url = (
            f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{storage_path}"
        )

    # Stream image back
    ext          = metadata["output_format"]
    content_type = "image/png" if ext == "png" else "image/jpeg"
    resp_headers = {
        "X-Processing-Time-Ms": str(metadata["processing_time_ms"]),
        "X-Model-Used":         metadata["model"],
        "X-Original-Size":      f"{metadata['original_width']}x{metadata['original_height']}",
        "X-Output-Bytes":       str(metadata["output_size_bytes"]),
        "Access-Control-Expose-Headers": (
            "X-Processing-Time-Ms,X-Model-Used,X-Original-Size,X-Output-Bytes,X-Result-URL"
        ),
    }
    if result_url:
        resp_headers["X-Result-URL"] = result_url

    return StreamingResponse(io.BytesIO(output_bytes), media_type=content_type, headers=resp_headers)


@app.post("/api/remove-background/batch")
async def remove_background_batch(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    model: str = "auto",
    enhance_edges: bool = True,
    user: Optional[dict] = Depends(verify_token),
):
    """Batch removal — up to 10 images. Requires auth. Results saved to Supabase Storage."""
    if not user or user.get("id") == "anonymous":
        raise HTTPException(401, "Authentication required for batch processing.")
    if len(files) > 10:
        raise HTTPException(400, "Maximum 10 files per batch request.")

    results = []
    for f in files:
        try:
            raw = await f.read()
            if len(raw) > MAX_FILE_SIZE_MB * 1024 * 1024:
                results.append({"filename": f.filename, "status": "error", "error": "File too large"})
                continue
            output_bytes, metadata = process_image(raw, model=model, enhance_edges=enhance_edges)
            job_id       = str(uuid.uuid4())
            storage_path = f"results/{user['id']}/{job_id}.png"
            public_url   = await upload_to_supabase_storage(output_bytes, storage_path, "image/png")
            results.append({
                "filename": f.filename,
                "job_id":   job_id,
                "url":      public_url,
                "status":   "success",
                "metadata": {
                    "processing_time_ms": metadata["processing_time_ms"],
                    "model":              metadata["model"],
                    "original_size":      f"{metadata['original_width']}x{metadata['original_height']}",
                },
            })
        except Exception as exc:
            results.append({"filename": f.filename, "status": "error", "error": str(exc)})

    successful = sum(1 for r in results if r.get("status") == "success")
    if successful:
        background_tasks.add_task(increment_usage, user["id"])

    return JSONResponse({"results": results, "total": len(results), "successful": successful})


@app.get("/api/models")
async def list_models():
    return {
        "models": [
            {"id": "auto",              "name": "Auto-detect",        "description": "Automatically picks the best model",                "recommended": True},
            {"id": "u2net",             "name": "General Purpose",    "description": "Best for products, animals, objects",              "speed": "medium"},
            {"id": "u2net_human_seg",   "name": "Portrait & People",  "description": "Optimised for portraits and human silhouettes",    "speed": "medium"},
            {"id": "isnet-general-use", "name": "ISNet (Sharp Edges)","description": "Newer architecture with crisper edge detection",   "speed": "slow"},
        ]
    }


@app.get("/api/user/usage")
async def get_user_usage(user: Optional[dict] = Depends(verify_token)):
    if not user or user.get("id") == "anonymous":
        raise HTTPException(401, "Authentication required.")
    today     = await get_usage_count(user["id"])
    plan      = (user.get("user_metadata") or {}).get("plan", "free")
    limit     = FREE_LIMIT if plan == "free" else -1
    remaining = max(0, limit - today) if limit != -1 else -1
    return {
        "user_id":     user["id"],
        "email":       user.get("email"),
        "plan":        plan,
        "today_count": today,
        "limit":       limit,
        "remaining":   remaining,
        "storage":     "supabase",
    }


@app.get("/api/storage/check")
async def storage_check():
    """Verify Supabase Storage is reachable and the bucket exists."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return {"configured": False, "reason": "SUPABASE_URL or SUPABASE_SERVICE_KEY not set"}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/storage/v1/bucket/{STORAGE_BUCKET}",
                headers={"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}", "apikey": SUPABASE_SERVICE_KEY},
            )
        if resp.status_code == 200:
            return {"configured": True, "bucket": STORAGE_BUCKET, "status": "reachable"}
        return {"configured": False, "bucket": STORAGE_BUCKET, "http_status": resp.status_code, "detail": resp.text}
    except Exception as exc:
        return {"configured": False, "error": str(exc)}
