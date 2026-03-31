# @loop-kit/loom-core

Headless Loom contracts.

## Owns

- primitive blueprints
- semantic token contracts
- theme layer composition
- recipe interfaces
- resolved style output shapes

## Does Not Own

- React rendering
- DOM bindings
- Graphite integration
- high-level product features

## Override Levels

1. Token override: change token values only.
2. Recipe override: change how styles resolve from tokens, variants, and state.
3. Primitive implementation override: handled in React theme packages while staying inside the primitive contract.
4. Pack/addon layer: specialized UI lives in Loom packs, not primitive themes.
