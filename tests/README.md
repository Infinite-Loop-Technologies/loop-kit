# Tests

`tests/` is for repo-level smoke, orchestration, and integration coverage.

Package-specific tests should stay inside the package that owns the behavior. Move a test up to `tests/` only when it validates root tooling, shared repo conventions, or cross-workspace behavior.
