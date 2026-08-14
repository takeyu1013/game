#!/usr/bin/env bash
set -euo pipefail

# Ensure the repository's pinned bun toolchain (see devbox.lock) is available.
# The curl fallback only runs when bun is missing, so a snapshot that already
# contains bun skips the network download and stays reproducible.
if ! command -v bun >/dev/null 2>&1; then
  export BUN_INSTALL="$HOME/.bun"
  curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.13"
fi
export PATH="$HOME/.bun/bin:$PATH"

bun --version
bun install --frozen-lockfile
