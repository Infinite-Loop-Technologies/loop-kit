# WIT Syntax Rules

## Critical Syntax Rules

### Type Placement
**NEVER place types at package level** - they must be inside a world or interface.

```wit
// WRONG - type at package level
package loop:example@0.1.0;

type my-type = string  // ❌ INVALID

world example {
  // ...
}

// CORRECT - type inside world
package loop:example@0.1.0;

world example {
  type my-type = string  // ✓ VALID
}

// ALSO CORRECT - type inside interface
package loop:example@0.1.0;

interface types {
  type my-type = string  // ✓ VALID
}

world example {
  import types;
}
```

### Package Declaration
- First line must be `package namespace:name@version;`
- Version uses semver: `0.1.0`, `1.2.3`
- Namespace examples: `loop`, `wasi`, `loop-kit`

```wit
package loop:core@0.1.0;
```

### Imports and Use Statements
- Import types/interfaces from other packages with `use`
- Syntax: `use package:name@version/{type-name, other-type};`
- Import whole interface: `use wasi:io/streams@0.2.0;`

```wit
package loop:fx@0.1.0;

use loop:core@0.1.0/{cancel-token, log-level};
use wasi:clocks/monotonic@0.2.0;

world fx {
  // can now use cancel-token and log-level
}
```

### World Definition
- Worlds define the component's imports and exports
- Use `import` for dependencies (what the component needs)
- Use `export` for provided functionality (what the component offers)

```wit
world my-component {
  // Import external dependencies
  import wasi:filesystem/types@0.2.0;

  // Export interfaces
  export my-api: interface {
    do-thing: func() -> string;
  }
}
```

### Interface Definition
- Interfaces group related functions
- Can be inline in world or separate
- Can be exported or imported

```wit
world example {
  // Inline interface export
  export api: interface {
    get-value: func(key: string) -> option<string>;
    set-value: func(key: string, value: string);
  }

  // Inline interface import
  import logging: interface {
    log: func(level: log-level, message: string);
  }
}
```

### Type Definitions

#### Enums
```wit
type log-level = enum {
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
}
```

#### Records (structs)
```wit
type window-config = record {
  title: string,
  width: u32,
  height: u32,
}
```

#### Type Aliases
```wit
type node-id = u64;
type component-id = string;
```

#### Lists
```wit
type props = list<prop>;
type buffer = list<u8>;
```

#### Options
```wit
type maybe-value = option<string>;
```

#### Results (for error handling)
```wit
type file-result = result<file-descriptor, error-code>;
```

### Function Signatures
- Parameters: `name: type`
- Return: `-> type` or `-> result<ok-type, err-type>`
- Multiple return values: `-> tuple<type1, type2>`

```wit
// No return
log: func(message: string);

// Single return
get-time: func() -> u64;

// Result return
open-file: func(path: string) -> result<file-id, error>;

// Multiple parameters
resize: func(id: window-id, width: u32, height: u32);

// Optional parameters use option<T>
create: func(config: option<window-config>) -> window-id;
```

### Naming Conventions
- Types: `kebab-case` (e.g., `window-config`, `node-id`)
- Functions: `kebab-case` (e.g., `get-value`, `set-state`)
- Enum variants: `lowercase` (e.g., `trace`, `info`, `error`)
- Packages: `namespace:name` (e.g., `loop:core`, `wasi:filesystem`)

### Comments
```wit
/// Documentation comment for the next item
/// Supports multiple lines

// Regular comment (not documentation)

interface example {
  /// Get the current configuration
  /// Returns None if not initialized
  get-config: func() -> option<config>;
}
```

## Validation Workflow

### Always Validate
Run validation after any WIT changes:

```bash
wasm-tools component wit validate wit/path/to/file.wit
```

### Common Validation Errors

1. **Types at package level**: Move inside world/interface
2. **Missing semicolons**: Package declaration needs `;`
3. **Invalid version**: Use semver (e.g., `0.1.0`)
4. **Unresolved imports**: Ensure imported packages exist
5. **Duplicate names**: Each type/function name must be unique in scope

## Composition

### Using wit-deps
- For larger dependency graphs, use `wit-deps` tool
- Config file specifies external WIT packages to fetch
- Vendoring strategy for reproducible builds

### Manual Composition
```bash
wasm-tools component wit compose --help
```

## Best Practices

1. **Keep shared types in worlds** - reference from inline interfaces
2. **Prefer WASI reuse** - don't reinvent clocks, filesystem, http
3. **Validate early and often** - catch syntax errors immediately
4. **Explicit imports/exports** - avoid implicit host glue
5. **Document with ///** - explain non-obvious types and functions
6. **Use semantic versioning** - breaking changes bump major version

## Reference

Official WIT design documentation:
https://component-model.bytecodealliance.org/design/wit.html

## Quick Syntax Reference

```wit
package namespace:name@x.y.z;

use other:pkg@a.b.c/{imported-type};

world my-world {
  // Types must be here or in interface
  type my-id = u64;

  type my-record = record {
    field1: string,
    field2: u32,
  }

  type my-enum = enum {
    variant-a,
    variant-b,
  }

  type my-list = list<string>;
  type my-option = option<u32>;
  type my-result = result<string, error-code>;

  // Import interface
  import wasi:filesystem/types@0.2.0;

  // Export inline interface
  export api: interface {
    my-func: func(arg: string) -> u32;
  }
}
```
