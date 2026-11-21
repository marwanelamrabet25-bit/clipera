# Image du worker vidéo Clipera
FROM python:3.12-slim-bookworm

# FFmpeg (avec libass/libx264) + police Inter pour les sous-titres
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg fonts-inter fontconfig \
 && rm -rf /var/lib/apt/lists/* \
 && fc-cache -f

RUN pip install --no-cache-dir uv==0.11.32

# Python de l'image (pas de téléchargement), copie des paquets (compatible avec les couches Docker)
ENV UV_PYTHON_DOWNLOADS=never UV_LINK_MODE=copy

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY src ./src
COPY assets ./assets
RUN uv sync --frozen --no-dev

# Utilisateur sans privilèges
RUN useradd --create-home --uid 10001 clipera && mkdir -p /tmp/clipera-work && chown clipera /tmp/clipera-work
USER clipera

ENV PYTHONUNBUFFERED=1 CLIPERA_WORK_DIR=/tmp/clipera-work
CMD ["/app/.venv/bin/python", "-m", "clipera_worker"]
