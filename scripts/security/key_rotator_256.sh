#!/bin/bash
# 256-bit Key Rotation
echo "[SECURITY] Rotating neural access keys..."
openssl rand -base64 32 > ./lib/keys/current_nexus.key
echo "[SECURITY] Handshake re-established via AES-256."
