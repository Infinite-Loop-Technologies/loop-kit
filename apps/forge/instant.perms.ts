const perms = {
    $users: {
        allow: {
            create: 'true',
            view: 'auth.id == data.id',
        },
    },
    nodes: {
        allow: {
            create: 'auth.id != null',
            delete: "auth.id in data.ref('workspace.owner.id')",
            update: "auth.id in data.ref('workspace.owner.id')",
            view: "auth.id in data.ref('workspace.owner.id')",
        },
    },
    workspaces: {
        allow: {
            create: 'auth.id != null',
            delete: "auth.id in data.ref('owner.id')",
            update: "auth.id in data.ref('owner.id')",
            view: "auth.id in data.ref('owner.id')",
        },
    },
} as const;

export default perms;
