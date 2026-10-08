FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY services/learning/requirements.txt /tmp/learning-requirements.txt
RUN python3 -m venv /opt/learning \
    && /opt/learning/bin/pip install --no-cache-dir -r /tmp/learning-requirements.txt

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
COPY server/scripts ./scripts
RUN npm ci --omit=dev
COPY . /app
RUN mkdir -p /app/server/data
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production \
    LEARNING_PYTHON=/opt/learning/bin/python DATA_DIR=/app/server/data \
    OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 PYTHONIOENCODING=utf-8
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
