#!/usr/bin/env bash
# Cek apakah backend CI4 merespons (jalan dari root project: ./scripts/cek-backend.sh)

set -e
cd "$(dirname "$0")/.."

echo "=== 1. Status container ==="
docker compose ps backend 2>/dev/null || true

echo ""
echo "=== 2. Tes dari DALAM container (curl ke 127.0.0.1:8080) ==="
if docker compose ps backend 2>/dev/null | grep -q Up; then
  docker compose exec backend sh -c 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/auth/ping' 2>/dev/null && echo " -> GET ping OK" || echo " -> GET ping GAGAL"
  docker compose exec backend curl -s http://127.0.0.1:8080/api/auth/ping 2>/dev/null || true
else
  echo "Container backend tidak jalan. Jalankan: docker compose up -d"
fi

echo ""
echo "=== 3. Tes dari HOST (curl ke localhost:8010) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8010/api/auth/ping 2>/dev/null || echo "Gagal (ECONNRESET / connection refused)"

echo ""
echo "=== 4. Log backend (5 baris terakhir) ==="
docker compose logs backend --tail 5 2>/dev/null || true
