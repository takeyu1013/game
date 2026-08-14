#!/usr/bin/env bash
set -euo pipefail

# This repository manages its toolchain with Devbox (see devbox.json /
# devbox.lock, which pin bun@1.3.13). The install phase therefore provisions
# Devbox + Nix and then installs dependencies through the Devbox environment
# instead of downloading tools directly.

NIX_PROFILE_SCRIPT=/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh

load_nix() {
  # shellcheck disable=SC1090
  [ -e "$NIX_PROFILE_SCRIPT" ] && . "$NIX_PROFILE_SCRIPT" || true
}

# 1. Install Devbox if it is not already available (brings Nix if absent).
if ! command -v devbox >/dev/null 2>&1; then
  curl -fsSL https://get.jetify.com/devbox | bash -s -- -f
fi
export PATH="/usr/local/bin:$PATH"

# 2. Bootstrap Nix when necessary. Devbox installs Nix on first use, but without
#    systemd the daemon must be started by hand, so that first run cannot finish
#    on its own. Kick off the Nix install, start the daemon, then continue.
load_nix
bash .cursor/start-nix-daemon.sh
if [ ! -e "$NIX_PROFILE_SCRIPT" ]; then
  devbox install || true
  load_nix
  bash .cursor/start-nix-daemon.sh
fi

# 3. Install the Devbox-managed packages (bun) and the JS dependencies through
#    the Devbox environment so the pinned toolchain is used.
load_nix
devbox install
devbox run -- bun install --frozen-lockfile
