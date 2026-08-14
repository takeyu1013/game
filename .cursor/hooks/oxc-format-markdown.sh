#!/usr/bin/env bash
# Format markdown files with oxfmt after the agent edits them.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=oxc-common.sh
source "$SCRIPT_DIR/oxc-common.sh"

input="$(cat)"
file_path="$(printf '%s' "$input" | python3 -c '
import json, sys
print(json.load(sys.stdin).get("file_path", ""))
' 2>/dev/null || true)"

case "$file_path" in
  *.md|*.markdown|*.mdx) ;;
  *) exit 0 ;;
esac

[[ -f "$file_path" ]] || exit 0

root="$(oxc_repo_root "$input")"
bun_bin="$(oxc_bun "$root")" || exit 0
oxc_ensure_deps "$root" "$bun_bin"

(
  cd "$root" || exit 0
  "$bun_bin" x oxfmt --write --no-error-on-unmatched-pattern "$file_path" >/dev/null 2>&1 || true
)

exit 0
