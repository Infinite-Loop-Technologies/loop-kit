# @loop-kit/loom-core

Headless Loom contracts.

## Owns

- primitive blueprints
- semantic token contracts and token merge helpers
- theme layer composition
- recipe interfaces
- resolved style output shapes
- semantic icon names

## Does Not Own

- React rendering
- DOM bindings
- Graphite integration
- high-level product features
- curated visual defaults

## Override Levels

1. Token override: change token values only.
2. Recipe override: change how styles resolve from tokens, variants, and state.
3. Primitive implementation override: handled in React theme packages while staying inside the primitive contract.
4. Pack/addon layer: specialized UI lives in Loom packs, not primitive themes.

Tokens are inert values. Recipes are pure style resolvers. `ResolvedStyles` is the
intermediate renderer payload. Icons are semantic assets keyed by name, not
ordinary scalar tokens.
