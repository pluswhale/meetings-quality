#!/bin/sh
# Wait for backend OpenAPI spec to be generated

OPENAPI_FILE="../backend/generated/openapi.json"
MAX_WAIT=60
WAITED=0

echo "⏳ Waiting for backend OpenAPI spec..."

while [ ! -f "$OPENAPI_FILE" ] && [ $WAITED -lt $MAX_WAIT ]; do
  sleep 2
  WAITED=$((WAITED + 2))
  echo "⏳ Still waiting... ($WAITED/${MAX_WAIT}s)"
done

if [ -f "$OPENAPI_FILE" ]; then
  echo "✅ OpenAPI spec found! Generating API client..."
  npm run generate:api
  echo "✅ API client generated!"
else
  echo "❌ Timeout waiting for OpenAPI spec. Backend might not be ready."
  echo "⚠️ Starting frontend anyway..."
fi

echo "🚀 Starting Vite dev server..."
npm run dev -- --host 0.0.0.0
