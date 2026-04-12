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
  frame: number;
  host: HTMLElement;
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
  const hidden = entry.snapshot.presentation.hidden || entry.snapshot.interaction.dragging;
  const passthrough =
    entry.snapshot.presentation.passthrough || entry.snapshot.interaction.dragging;

  surface.style.pointerEvents = passthrough ? "none" : "auto";
  surface.toggleHidden?.(hidden);
  surface.togglePassthrough?.(passthrough);
  surface.toggleTransparent?.(true);
  surface.syncDimensions?.(force);
}

function scheduleSync(entry: SurfaceEntry, force = false) {
  if (entry.frame) {
    window.cancelAnimationFrame(entry.frame);
  }

  entry.frame = window.requestAnimationFrame(() => {
    entry.frame = 0;
    applyPresentation(entry, force);
  });
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
        frame: 0,
        host: attachment.host,
        snapshot: {
          interaction: createDefaultInteraction(),
          presentation: createDefaultPresentation(),
          spec: attachment.spec,
        },
        spec: attachment.spec,
        surface: attachment.surface,
      };

      entries.set(attachment.spec.id, entry);
      attachment.surface.loadURL(attachment.spec.url);
      scheduleSync(entry, true);

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
      if (entry.frame) {
        window.cancelAnimationFrame(entry.frame);
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
      entry.surface.loadURL(url);
      scheduleSync(entry, true);
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
      scheduleSync(entry, false);
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
      scheduleSync(entry, false);
      return ok(undefined);
    },
    sync: (surfaceId, force = false) => {
      const entry = entries.get(surfaceId);
      if (!entry) {
        return fail("not-found", `Surface ${surfaceId} is not attached.`);
      }
      scheduleSync(entry, force);
      return ok(undefined);
    },
    syncAll: (force = false) => {
      for (const entry of entries.values()) {
        scheduleSync(entry, force);
      }
    },
  };
}
