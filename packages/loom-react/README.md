# @loop-kit/loom-react

React bindings for Loom.

## Owns

- `LoomProvider`
- theme layer resolution for React
- hooks for tokens and primitive resolution
- primitive wrappers
- implementation override contracts
- semantic icon resolution for React themes

## Does Not Own

- semantic token definitions
- long-lived interaction state
- high-level product features
- Graphite logic

Recipes resolve styles. React implementations render DOM and consume
`ResolvedStyles`. This package is React-specific on purpose.
