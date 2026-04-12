import { i } from '@instantdb/react';

const _schema = i.schema({
    entities: {
        $users: i.entity({
            email: i.string().indexed().unique().optional(),
        }),
        nodes: i.entity({
            icon: i.string().optional(),
            kind: i.string().indexed(),
            lane: i.string().indexed().optional(),
            pinned: i.boolean(),
            subtitle: i.string().optional(),
            title: i.string(),
            updatedAt: i.number().indexed(),
            view: i.string().indexed(),
        }),
        workspaces: i.entity({
            colorMode: i.string(),
            commandPaletteDefaultOpen: i.boolean(),
            createdAt: i.number().indexed(),
            description: i.string().optional(),
            inspectorDock: i.string(),
            name: i.string().indexed(),
            sidePeekDefaultOpen: i.boolean(),
            slug: i.string().indexed().unique(),
        }),
    },
    links: {
        workspaceNodes: {
            forward: { label: 'workspace', on: 'nodes', has: 'one', onDelete: 'cascade' },
            reverse: { label: 'nodes', on: 'workspaces', has: 'many' },
        },
        workspaceOwner: {
            forward: { label: 'owner', on: 'workspaces', has: 'one', onDelete: 'cascade' },
            reverse: { label: 'workspaces', on: '$users', has: 'many' },
        },
    },
});

type _AppSchema = typeof _schema;
export interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export default schema;
