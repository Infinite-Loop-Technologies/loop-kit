# Tana Structured Search

This repo treats Tana `search_nodes` as a documented interface, not a guess-and-check tool.

Primary source:
- Local OpenAPI: `http://localhost:8262/openapi.json`
- Local Swagger UI: `http://localhost:8262/docs#GET/nodes/search`

What the MCP tool expects:
- The Codex/Tana MCP `search_nodes` tool takes a normal JSON object for `query`.
- The underlying HTTP API is `GET /nodes/search` with `query` encoded as `deepObject`.
- Do not design queries from the raw URL form when calling the MCP tool. Use the JSON shapes below.

Operational rules from testing:
- Always set `workspaceIds` explicitly for control-plane searches.
- Treat trashed nodes as excluded by default.
- There is no documented `includeTrash` or equivalent search flag in the local OpenAPI.

## Query Rules

- The root `query` is a single object.
- A condition object should contain one operator unless you are intentionally using `and`, `or`, or `not`.
- `and` and `or` take arrays of condition objects.
- `not` takes a single condition object.
- `workspaceIds` is separate from `query`.
- `limit` is separate from `query`.

## Documented Operators

Simple text / flags:
- `textContains: string`
- `textMatches: string`
- `is: "done" | "todo" | "template" | "field" | "published" | "entity" | "calendarNode" | "onDayNode" | "chat" | "search" | "command" | "inLibrary"`
- `has: "tag" | "field" | "media" | "audio" | "video" | "image"`
- `inWorkspace: string`
- `overdue: true`
- `inLibrary: true`

Type / field matching:
- `hasType: "tagId"`
- `hasType: { "typeId": "tagId", "includeExtensions": true }`
- `field: { "fieldId": "fieldId", "nodeId": "nodeId" }`
- `field: { "fieldId": "fieldId", "stringValue": "value" }`
- `field: { "fieldId": "fieldId", "numberValue": 3 }`
- `field: { "fieldId": "fieldId", "state": "defined" | "undefined" | "set" | "notSet" }`
- `compare: { "fieldId": "fieldId", "operator": "gt" | "lt" | "eq", "value": "...", "type": "number" | "date" | "string" }`

Hierarchy / graph:
- `childOf: { "nodeIds": ["nodeId"], "recursive": true, "includeRefs": true }`
- `ownedBy: { "nodeId": "nodeId", "recursive": true, "includeSelf": false }`
- `linksTo: ["nodeId"]`

Time:
- `created: { "last": 7 }`
- `edited: { "last": 7 }`
- `edited: { "since": 1710000000000 }`
- `edited: { "by": "user@example.com", "last": 7 }`
- `done: { "last": 7 }`
- `onDate: "2026-03-26"`
- `onDate: { "date": "2026-03-26", "fieldId": "fieldId", "overlaps": true }`

Boolean composition:
- `and: [ ...conditions ]`
- `or: [ ...conditions ]`
- `not: { ...condition }`

## Safe MCP Examples

Find by text in one workspace:

```json
{
  "workspaceIds": ["X3vpwkCZGvUE"],
  "limit": 10,
  "query": {
    "textContains": "Node A"
  }
}
```

Find recent inbox items:

```json
{
  "workspaceIds": ["workspaceId"],
  "limit": 20,
  "query": {
    "and": [
      { "hasType": "inboxTagId" },
      { "created": { "last": 14 } }
    ]
  }
}
```

Find nodes by referenced project:

```json
{
  "workspaceIds": ["workspaceId"],
  "limit": 20,
  "query": {
    "field": {
      "fieldId": "projectFieldId",
      "nodeId": "projectNodeId"
    }
  }
}
```

Find descendants under a control-plane root:

```json
{
  "workspaceIds": ["workspaceId"],
  "limit": 50,
  "query": {
    "childOf": {
      "nodeIds": ["rootNodeId"],
      "recursive": true,
      "includeRefs": true
    }
  }
}
```

## Observed Behavior In This Repo

The OpenAPI shape is clear, but observed MCP behavior in the `loop-kit` workspace was mixed:

- `textContains` worked reliably.
- Newly written nodes and references were verified reliably with `read_node`.
- `hasType`, `childOf`, `ownedBy`, and `field` queries returned empty results in cases where `read_node` showed matching nodes.
- One mixed `and` query returned the workspace home node instead of the expected project node.

Treat that as an implementation caveat, not proof that the documented DSL is wrong.

## Recommended Workflow

1. Start with `textContains` to anchor on a known node name.
2. Read the candidate node with `read_node`.
3. Only then move to `hasType`, `field`, `childOf`, or `ownedBy`.
4. When a structured query matters, validate against `read_node` or `get_children`.
5. If a query unexpectedly returns `[]`, test the same search with fewer predicates before assuming the data is missing.
6. Prefer exact node IDs and field IDs over names.

## What Is Already Useful

Based on direct testing in the `loop-kit` workspace, these patterns are already useful enough to build around:

- `textContains` for discovery by node name
- `is: "field"` to find field-definition nodes and recover field IDs from the Schema area
- `has: "tag"` to find tagged entity nodes across the workspace
- `read_node` to inspect a candidate subtree with tags, field values, and references
- `get_children` with `limit` and `offset` for pagination when a node has many children

This means a practical workflow today is:

1. find a project, slice, inbox item, or reference by `textContains`
2. inspect it with `read_node`
3. paginate large containers with `get_children`
4. use exact IDs recovered from reads for subsequent automation

## Search Lab Notes

The repo now includes a tested `Search Lab` subtree inside the `loop-kit` workspace. It was used to exercise:

- tagged `Project`, `Slice`, `Inbox`, `Handoff`, and `Reference` nodes
- instance-field references between projects, slices, inbox items, and handoffs
- boolean text queries
- paginated reads over a sample container

Observed results:

- `textContains` remained the most reliable search path
- `is: "field"` and `has: "tag"` returned useful results
- `get_children` pagination worked exactly as expected
- `textMatches` did not produce expected results in the tested case
- `hasType`, `field`, `childOf`, and some `and`/`or` combinations still returned false negatives or surprising matches

Treat the lab as a standing regression fixture for future Tana MCP checks.

## Trash And Workspace Scope

Direct testing in the `loop-kit` workspace showed:

- a uniquely named live node was found when `workspaceIds` included `X3vpwkCZGvUE`
- the same unique node was not returned by the unscoped query
- after trashing that node, the scoped query returned `[]`
- the unscoped query also returned `[]`

Working rule:

- do not rely on unscoped search for workspace-specific automation
- always scope to the target workspace
- assume search excludes trashed nodes unless future docs or behavior prove otherwise

## Known Boundary

The localhost HTTP API requires auth for direct calls, even though the MCP server can access the same data. That means the OpenAPI spec is readable locally, but live REST probes need credentials.
