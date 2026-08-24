FROM python:3.10-slim

# Install minimal OS dependencies required by OpenCV & Paddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    FLAGS_allocator_strategy=naive_best_fit

WORKDIR /app

COPY requirements.txt .

# 1. Install NumPy 1.26.4 explicitly first
RUN pip install --no-cache-dir "numpy==1.26.4"

# 2. Install requirements using --constraint to forbid NumPy >= 2.0.0 anywhere in the dependency tree
RUN echo "numpy<2.0.0" > /tmp/constraints.txt && \
    pip install --no-cache-dir -c /tmp/constraints.txt -r requirements.txt

# 3. Fix OpenCV headless bindings
RUN pip install --no-cache-dir --force-reinstall opencv-python-headless==4.10.0.84

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000", "--workers", "1"]