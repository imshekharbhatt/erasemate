FROM python:3.11-slim

# System deps for Pillow / rembg
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    libjpeg-dev libpng-dev libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Pre-download REMBG models at build time so startup is instant
RUN python -c "from rembg import new_session; new_session('u2net'); new_session('u2net_human_seg')" || true

EXPOSE 8080

CMD ["sh", "-c", "gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8080} --workers 1 --timeout 120"]