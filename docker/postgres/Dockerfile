# The official postgis/postgis image is amd64-only; building on postgres:17 runs natively on Apple Silicon.
FROM postgres:17-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-17-postgis-3 \
  && rm -rf /var/lib/apt/lists/*
