FROM python:3.11-slim

# System dependencies for LightGBM, psycopg2, and SHAP
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip && \
    pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application code
COPY . .

# Non-root user for security
RUN useradd -m -u 1001 akos && chown -R akos:akos /app
USER akos

EXPOSE 8502

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8502/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8502", "--log-level", "info"]
