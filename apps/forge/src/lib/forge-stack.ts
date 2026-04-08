export const forgeControlPlanes = [
    {
        id: 'web-shell',
        label: 'Volt + Bun shell',
        detail: 'Forge now runs as a Volt-hosted Bun shell and keeps ElectroBun as the future native wrapper.',
    },
    {
        id: 'workflow',
        label: 'Vercel Workflow control plane',
        detail: 'Agent runs, approvals, retries, and bounded long-running execution flow through workflows.',
    },
    {
        id: 'collaboration',
        label: 'Jazz data plane',
        detail: 'Jazz carries collaborative project state, grants, and RPC-shaped coordination surfaces.',
    },
    {
        id: 'artifacts',
        label: 'OCI artifact plane',
        detail: 'A local CNCF Distribution registry stores artifacts as Forge moves toward policy-aware WASM and container plugins.',
    },
];

export const forgeCapabilityPolicies = [
    'Every high-risk capability request starts pending and waits for explicit user approval.',
    'Workflow steps must validate both grant scope and billing policy before starting costly work.',
    'Container execution is allowed only from approved registry targets and approved capability types.',
    'Secrets stay attached to capability grants instead of leaking into general workflow state.',
];

export const forgeLocalServices = [
    {
        id: 'registry',
        label: 'Persistent OCI registry',
        detail: 'Local `registry:3` instance mounted to a durable data directory for day-to-day artifact work.',
    },
    {
        id: 'forge-app',
        label: 'Forge Volt app',
        detail: 'Local Forge shell with Dock, theme packs, and stack blueprints.',
    },
    {
        id: 'workflow-dev',
        label: 'Workflow/dev helpers',
        detail: 'Vercel local dev plus future workflow adapters and local policy stubs.',
    },
    {
        id: 'jazz-sync',
        label: 'Jazz sync target',
        detail: 'Use a local or development Jazz sync environment while the self-hosted story settles.',
    },
];
