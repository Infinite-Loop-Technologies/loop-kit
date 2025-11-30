# ILT Design System

This is based on shadcn, using the registry system.

To use in a shadcn project, add it as a registry namespace. E.g. components.json:

```json
{
    "registries": {
        "@infinite": "https://infinite-design-system.netlify.app/r/{name}"
    }
}
```

```bash
pnpm dlx shadcn@latest add @infinite/sidebar
```

# Docs

Shadcn stuff: [components.json - shadcn/ui](https://ui.shadcn.com/docs/components-json)
