#!/bin/sh
# Wait for backend to be ready and fetch OpenAPI spec

BACKEND_URL="http://backend:4000"
MAX_WAIT=120
WAITED=0

echo "⏳ Waiting for backend to be ready..."

# Wait for backend to respond
while [ $WAITED -lt $MAX_WAIT ]; do
  if wget --spider --timeout=2 "$BACKEND_URL/api-json" 2>/dev/null; then
    echo "✅ Backend is ready!"
    break
  fi
  sleep 3
  WAITED=$((WAITED + 3))
  echo "⏳ Still waiting for backend... ($WAITED/${MAX_WAIT}s)"
done

# Try to generate API client if backend is ready
if [ $WAITED -lt $MAX_WAIT ]; then
  echo "📥 Fetching OpenAPI spec from backend..."
  mkdir -p ../backend/generated
  if wget -O ../backend/generated/openapi.json "$BACKEND_URL/api-json" 2>/dev/null; then
    echo "✅ OpenAPI spec downloaded!"
    echo "🔄 Generating API client..."
    npm run generate:api || echo "⚠️ API generation failed, continuing anyway..."
  else
    echo "⚠️ Could not download OpenAPI spec, continuing anyway..."
  fi
else
  echo "⚠️ Backend not ready after ${MAX_WAIT}s, starting frontend anyway..."
fi

echo "🚀 Starting Vite dev server..."
npm run dev -- --host 0.0.0.0
