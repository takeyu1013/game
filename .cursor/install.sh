#!/usr/bin/env bash
set -euo pipefail

# This repository manages its toolchain with Devbox (see devbox.json /
# devbox.lock, which pin bun@1.3.13). The install phase provisions Devbox + Nix
# and then installs dependencies through the Devbox environment instead of
# downloading tools directly.
#
# This container has no systemd, so Nix is installed in single-user mode
# (--no-daemon): the store is owned by the current user and no nix-daemon is
# needed. That keeps the environment reproducible across reboots without any
# per-boot service, and it is captured whole by environment snapshots/builds.

# 1. Install Devbox if it is not already available.
if ! command -v devbox >/dev/null 2>&1; then
  curl -fsSL https://get.jetify.com/devbox | bash -s -- -f
fi
export PATH="/usr/local/bin:$PATH"

# 2. Install Nix in single-user mode *before* Devbox tries to bootstrap it in
#    multi-user (daemon) mode, which cannot work without systemd here.
if ! command -v nix >/dev/null 2>&1 \
  && [ ! -e "$HOME/.nix-profile/etc/profile.d/nix.sh" ] \
  && [ ! -e /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]; then
  curl -fsSL -o /tmp/nix-install.sh https://nixos.org/nix/install
  sh /tmp/nix-install.sh --no-daemon
  rm -f /tmp/nix-install.sh
fi

# Load Nix into this shell (single-user profile, or a pre-existing daemon setup).
if [ -e "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nix-profile/etc/profile.d/nix.sh"
elif [ -e /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]; then
  # shellcheck disable=SC1091
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi

# 3. Install the Devbox-managed packages (bun) and the JS dependencies through
#    the Devbox environment so the pinned toolchain is used.
devbox install
devbox run -- bun install --frozen-lockfile
