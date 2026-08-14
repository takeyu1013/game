#!/usr/bin/env bash
# Run oxfmt + oxlint --fix after the agent creates a GitHub PR.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=oxc-common.sh
source "$SCRIPT_DIR/oxc-common.sh"

input="$(cat)"
command="$(printf '%s' "$input" | python3 -c '
import json, sys
print(json.load(sys.stdin).get("command", ""))
' 2>/dev/null || true)"

if [[ ! "$command" =~ gh[[:space:]]+pr[[:space:]]+create ]]; then
  exit 0
fi

root="$(oxc_repo_root "$input")"
bun_bin="$(oxc_bun "$root")" || exit 0
oxc_ensure_deps "$root" "$bun_bin"

(
  cd "$root" || exit 0
  "$bun_bin" x oxfmt --write --no-error-on-unmatched-pattern \
    "**/*.{md,markdown,mdx,js,jsx,ts,tsx,mjs,cjs,json,jsonc}" \
    >/dev/null 2>&1 || true
  "$bun_bin" x oxlint --fix . >/dev/null 2>&1 || true
)

exit 0
