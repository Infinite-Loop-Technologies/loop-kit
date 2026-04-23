# @loop-kit/common

`common` is for broadly reusable primitives.

What belongs here:

- reusable result and error helpers
- small ownership and lifecycle utilities
- small type-safe helpers that are not domain-specific

What does not belong here:

- React-specific code
- DOM-specific code
- app or provider glue
- random convenience helpers with only one caller

This package is intentionally small. It should not become a dumping ground.
