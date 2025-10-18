#!/usr/bin/env bash
set -euo pipefail

SERVICE="${APP_SERVICE:-web}"
PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"

if [[ -f /.dockerenv ]]; then
  export NODE_ENV="${NODE_ENV:-production}"
fi

case "$SERVICE" in
  web)
    echo "Starting Monynha SPA on ${HOST}:${PORT}" >&2
    exec npm run preview -- --host "${HOST}" --port "${PORT}"
    ;;
  cms)
    CMS_PORT="${PORT:-3000}"
    echo "Starting Payload CMS via npm --prefix cms run start on port ${CMS_PORT}" >&2
    export PORT="${CMS_PORT}"
    export PAYLOAD_CONFIG_PATH="${PAYLOAD_CONFIG_PATH:-cms/dist/payload.config.js}"
    exec npm --prefix cms run start
    ;;
  *)
    echo "Unknown APP_SERVICE '${SERVICE}'. Use 'web' or 'cms'." >&2
    exit 64
    ;;
esac
