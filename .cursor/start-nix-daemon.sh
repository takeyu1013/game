#!/usr/bin/env bash
set -euo pipefail

# Devbox relies on the Nix package manager. Nix is installed in multi-user mode,
# but this container has no systemd, so the nix-daemon must be started manually
# on every boot before any `devbox`/`nix` command can talk to the store.
SOCKET=/nix/var/nix/daemon-socket/socket
DAEMON=/nix/var/nix/profiles/default/bin/nix-daemon

# Nix is not installed yet (e.g. very first install run) — nothing to start.
[ -x "$DAEMON" ] || exit 0

# Already running: idempotent no-op.
if [ -S "$SOCKET" ] && pgrep -x nix-daemon >/dev/null 2>&1; then
  exit 0
fi

sudo bash -c "nohup '$DAEMON' >/tmp/nix-daemon.log 2>&1 &"

# Wait (up to ~20s) for the daemon socket to appear before returning.
for _ in $(seq 1 40); do
  [ -S "$SOCKET" ] && exit 0
  sleep 0.5
done

echo "nix-daemon socket did not appear at $SOCKET" >&2
cat /tmp/nix-daemon.log >&2 2>/dev/null || true
exit 1
