FROM python:3.10-slim

# Install minimal OS dependencies required by OpenCV & Paddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Prevent memory-heavy multithreading for Render's 512MB limit
ENV PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    FLAGS_allocator_strategy=naive_best_fit

WORKDIR /app

COPY requirements.txt .

# 1. Upgrade pip
# 2. Install requirements (forcing numpy < 2.0)
# 3. Ensure opencv-python-headless is cleanly re-installed
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --force-reinstall opencv-python-headless==4.10.0.84

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000", "--workers", "1"]