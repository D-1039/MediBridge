FROM python:3.10-slim

# Install minimal OS dependencies required by OpenCV & Paddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Prevent memory-heavy multithreading in 512MB RAM container
ENV PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    FLAGS_allocator_strategy=naive_best_fit

WORKDIR /app

COPY requirements.txt .

# Install dependencies and purge any GUI OpenCV variants pip brings in
RUN pip install --no-cache-dir -r requirements.txt && \
    pip uninstall -y opencv-python opencv-contrib-python

COPY . .

# Expose port and launch Uvicorn with a single worker to stay under 512MB
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000", "--workers", "1"]