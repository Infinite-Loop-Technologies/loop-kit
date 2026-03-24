# Rewrite Cutover And Compatibility Posture

## Decision Needed

Confirm how aggressively the repo should cut over from the legacy Loop core to the new model.

## Why It Matters

This decides whether we preserve temporary compatibility shims, stage deletions behind replacement milestones, or freeze the old packages immediately and move without bridges.

## Proposed Starting Position

Freeze the old core conceptually now, stop adding new architecture to it, and delete pieces once their replacement workstream has a concrete successor and a migration note if needed.

## Human Input Wanted

- Do you want any temporary compatibility layers at all?
- Are there legacy surfaces you want removed as soon as replacements exist, even if migration is abrupt?

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
