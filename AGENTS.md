# AGENTS.md

This file gives coding agents project-specific context. Keep it short and update it when workflows change.

## Project Overview

- Primary app or package: game
- Main entry points: `src/index.{js,jsx,mjs}`, `src/main.{js,jsx,mjs}`
- Important directories:

## Architecture Notes

- Module boundaries:
- Generated or vendored code:
- Sensitive areas:

## Commands

- Install: `bun install`
- Build:
- Test:
- Typecheck or lint: `bun run lint` / `bun run fmt:check`
- Fallow audit: `bun run audit`

## Fallow

- Use `fallow audit --format json --quiet` before committing AI-generated changes.
- Use `fallow dead-code --format json --quiet`, `fallow dupes --format json --quiet`, and `fallow health --format json --quiet` for targeted checks.
- Use `fallow list --entry-points --format json --quiet` and `fallow list --boundaries --format json --quiet` to inspect project shape.
- The version-matched skill lives at `node_modules/fallow/skills/fallow`.

<!-- generated:task-matrix:start -->

| When the agent is about to...                                     | Run                                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| delete an "unused" export or file                                 | `fallow dead-code --trace <file>:<export>`                                           |
| prove a TypeScript symbol's exact consumers before refactoring    | `fallow dead-code --type-aware --symbol-impact <file>:<export-or-class.method>`      |
| delete an "unused" dependency                                     | `fallow dead-code --trace-dependency <name>`                                         |
| commit or open a PR                                               | `fallow audit --base <ref>`                                                          |
| prioritize refactoring                                            | `fallow health --hotspots --targets`                                                 |
| ask who owns code                                                 | `fallow health --ownership`                                                          |
| check untested-but-reachable code                                 | `fallow health --coverage-gaps`                                                      |
| consolidate duplication                                           | `fallow dupes --trace dup:<fingerprint>`                                             |
| find feature flags                                                | `fallow flags`                                                                       |
| check which architecture rules apply to a file before changing it | `fallow guard <files>`                                                               |
| surface security candidates                                       | `fallow security`                                                                    |
| understand a finding                                              | `fallow explain <issue-type>`                                                        |
| scope a monorepo                                                  | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command) |

<!-- generated:task-matrix:end -->

## Agent Rules

- Do not edit:
- Always ask before:
- Preferred style:
