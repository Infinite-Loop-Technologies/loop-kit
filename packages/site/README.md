# loop-kit site

This package is a Next.js app that hosts:

- A shadcn registry manifest (`registry.json`)
- A docs site under `/docs`
- A lightweight docs CMS admin under `/docs/admin`

## Registry usage

Add the registry namespace in `components.json`:

```json
{
    "registries": {
        "@loop-kit": "https://your-domain/r/{name}"
    }
}
```

```bash
pnpm dlx shadcn@latest add @loop-kit/block-editor
```

## Docs CMS

Docs pages are stored in `content/docs/pages.json`.

Configure admin credentials with environment variables:

```bash
DOCS_ADMIN_USERNAME=admin
DOCS_ADMIN_PASSWORD=change-me
DOCS_ADMIN_SECRET=replace-me-with-a-long-random-value
```

Then sign in at `/docs/admin` to create and edit docs pages.
