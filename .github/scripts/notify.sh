#!/usr/bin/env bash
# Usage: notify.sh <status> <summary> [pr_url]
# Reports progress to the admin dev chat. Needs APP_URL, DEV_CALLBACK_SECRET, REQUEST_ID, RUN_URL.
set -euo pipefail
status="$1"; summary="$2"; pr_url="${3:-}"
sig=$(printf '%s' "${REQUEST_ID}:${status}" | openssl dgst -sha256 -hmac "$DEV_CALLBACK_SECRET" | awk '{print $NF}')
body=$(jq -n --arg id "$REQUEST_ID" --arg s "$status" --arg sum "$summary" --arg run "$RUN_URL" --arg pr "$pr_url" --arg sig "$sig" \
  '{requestId:$id,status:$s,summary:$sum,runUrl:$run,prUrl:$pr,signature:$sig}')
curl -fsS -X POST "$APP_URL/api/admin/dev-requests/callback" -H 'Content-Type: application/json' -d "$body" || echo "notify failed" >&2
