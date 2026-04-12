import {
  fail,
  ok,
  type ExternalSurfaceAttachment,
  type ExternalSurfaceHandle,
  type ExternalSurfaceInteractionState,
  type ExternalSurfacePresentation,
  type ExternalSurfaceService,
  type ExternalSurfaceSnapshot,
} from "./external-surface";

type ElectrobunSurfaceElement = ElectrobunWebviewElement & HTMLElement;

type SurfaceEntry = {
  spec: ExternalSurfaceAttachment["spec"];
  surface: ElectrobunSurfaceElement;
  snapshot: ExternalSurfaceSnapshot;
};

function isElectrobunSurfaceElement(
  value: HTMLElement,
): value is ElectrobunSurfaceElement {
  return value.tagName.toLowerCase() === "electrobun-webview";
}

function createDefaultPresentation(): ExternalSurfacePresentation {
  return {
    active: true,
    hidden: false,
    passthrough: false,
  };
}

function createDefaultInteraction(): ExternalSurfaceInteractionState {
  return {
    dragging: false,
  };
}

function applyPresentation(entry: SurfaceEntry, force = false) {
  const { surface } = entry;
  const hidden = entry.snapshot.presentation.hidden;
  const passthrough =
    entry.snapshot.presentation.passthrough || entry.snapshot.interaction.dragging;

  surface.toggleHidden?.(hidden);
  surface.togglePassthrough?.(passthrough);
  surface.toggleTransparent?.(true);
  if (force) {
    surface.syncDimensions?.(true);
  }
}

/**
 * Desktop implementation for the current demo. We keep it behind the generic
 * surface contract so future browser/extension hosts can swap in iframe or
 * outlet-based implementations without leaf UI owning native overlay policy.
 */
export function createElectrobunWebviewSurfaceService(): ExternalSurfaceService {
  const entries = new Map<string, SurfaceEntry>();

  const capabilities: ExternalSurfaceHandle["capabilities"] = {
    domContained: false,
    nativeOverlay: true,
    passthrough: true,
    syncDimensions: true,
    transparent: true,
  };

  return {
    attach: (attachment) => {
      if (entries.has(attachment.spec.id)) {
        return fail("already-attached", `Surface ${attachment.spec.id} is already attached.`);
      }

      if (!isElectrobunSurfaceElement(attachment.surface)) {
        return fail(
          "invalid-host",
          "Electrobun surface service requires an electrobun-webview element.",
        );
      }

      attachment.surface.setNavigationRules(["^file://*", "^http://*", "*://*/*"]);

      const entry: SurfaceEntry = {
        snapshot: {
          interaction: createDefaultInteraction(),
          presentation: createDefaultPresentation(),
          spec: attachment.spec,
        },
        spec: attachment.spec,
        surface: attachment.surface,
      };

      entries.set(attachment.spec.id, entry);
      applyPresentation(entry, true);

      return ok({
        capabilities,
        id: attachment.spec.id,
        kind: attachment.spec.kind,
      });
    },
    detach: (surfaceId) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return;
      }
      entry.surface.toggleHidden?.(true);
      entries.delete(surfaceId);
    },
    getSnapshot: (surfaceId) => entries.get(surfaceId)?.snapshot ?? null,
    listSurfaceIds: () => [...entries.keys()],
    navigate: (surfaceId, url) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return fail("not-found", `Surface ${surfaceId} is not attached.`);
      }
      entry.snapshot = {
        ...entry.snapshot,
        spec: {
          ...entry.snapshot.spec,
          url,
        },
      };
      entry.spec = entry.snapshot.spec;
      entry.surface.src = url;
      applyPresentation(entry, true);
      return ok(undefined);
    },
    setInteractionState: (surfaceId, interaction) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return fail("not-found", `Surface ${surfaceId} is not attached.`);
      }
      entry.snapshot = {
        ...entry.snapshot,
        interaction: {
          ...entry.snapshot.interaction,
          ...interaction,
        },
      };
      applyPresentation(entry, false);
      return ok(undefined);
    },
    setPresentation: (surfaceId, presentation) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return fail("not-found", `Surface ${surfaceId} is not attached.`);
      }
      entry.snapshot = {
        ...entry.snapshot,
        presentation: {
          ...entry.snapshot.presentation,
          ...presentation,
        },
      };
      applyPresentation(entry, false);
      return ok(undefined);
    },
    sync: (surfaceId, force = false) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return fail("not-found", `Surface ${surfaceId} is not attached.`);
      }
      entry.surface.syncDimensions?.(force);
      return ok(undefined);
    },
    syncAll: (force = false) => {
      for (const entry of entries.values()) {
        entry.surface.syncDimensions?.(force);
      }
    },
  };
}
