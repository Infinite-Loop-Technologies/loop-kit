# @loop-kit/loom-interactions

Runtime-only interaction coordination for Loom.

## Owns

- focus scopes
- keyboard scope routing
- measured view registry
- drag coordination helpers

## Does Not Own

- Graphite facts
- app domain state
- long-lived semantic models
- scheduler/runtime orchestration

Measured DOM rects, pointer movement, and transient drag state stay here rather than in Graphite.
