#!/usr/bin/env bash
# Shared helpers for OXC Cursor hooks.

oxc_repo_root() {
  local input_json="$1"
  local root
  root="$(printf '%s' "$input_json" | python3 -c '
import json, sys
data = json.load(sys.stdin)
roots = data.get("workspace_roots") or []
print(roots[0] if roots else "")
' 2>/dev/null || true)"

  if [[ -z "$root" ]]; then
    root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  fi

  printf '%s\n' "$root"
}

oxc_bun() {
  local root="$1"
  if [[ -x "$root/.devbox/nix/profile/default/bin/bun" ]]; then
    printf '%s\n' "$root/.devbox/nix/profile/default/bin/bun"
    return 0
  fi
  if command -v bun >/dev/null 2>&1; then
    command -v bun
    return 0
  fi
  return 1
}

oxc_ensure_deps() {
  local root="$1"
  local bun_bin="$2"
  (
    cd "$root" || exit 0
    if [[ ! -d node_modules/oxfmt || ! -d node_modules/oxlint ]]; then
      "$bun_bin" install >/dev/null 2>&1 || true
    fi
  )
}
