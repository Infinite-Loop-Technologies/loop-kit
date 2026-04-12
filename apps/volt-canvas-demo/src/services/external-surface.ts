/**
 * External surfaces are host-managed interactive regions such as Electrobun
 * webviews or browser iframes. They may render outside the normal DOM stacking
 * model, so UI code must not assume CSS z-index or pointer-events are enough to
 * control them.
 */
export type ExternalSurfaceCapabilities = {
  domContained: boolean;
  nativeOverlay: boolean;
  passthrough: boolean;
  syncDimensions: boolean;
  transparent: boolean;
};

export type ExternalSurfaceErrorCode =
  | "already-attached"
  | "not-found"
  | "unsupported"
  | "invalid-host";

export type ExternalSurfaceError = {
  code: ExternalSurfaceErrorCode;
  message: string;
};

export type ExternalSurfaceResult<TValue> =
  | { ok: true; value: TValue }
  | { error: ExternalSurfaceError; ok: false };

export type ExternalSurfaceHandle = {
  id: string;
  kind: "browser";
  capabilities: ExternalSurfaceCapabilities;
};

export type ExternalSurfaceSpec = {
  id: string;
  kind: "browser";
  panelId: string;
  url: string;
};

export type ExternalSurfacePresentation = {
  active: boolean;
  hidden: boolean;
  passthrough: boolean;
};

export type ExternalSurfaceInteractionState = {
  dragging: boolean;
};

export type ExternalSurfaceAttachment = {
  host: HTMLElement;
  spec: ExternalSurfaceSpec;
  surface: HTMLElement;
};

export type ExternalSurfaceSnapshot = {
  interaction: ExternalSurfaceInteractionState;
  presentation: ExternalSurfacePresentation;
  spec: ExternalSurfaceSpec;
};

export type ExternalSurfaceService = {
  attach: (attachment: ExternalSurfaceAttachment) => ExternalSurfaceResult<ExternalSurfaceHandle>;
  detach: (surfaceId: string) => void;
  getSnapshot: (surfaceId: string) => ExternalSurfaceSnapshot | null;
  listSurfaceIds: () => string[];
  navigate: (surfaceId: string, url: string) => ExternalSurfaceResult<void>;
  setInteractionState: (
    surfaceId: string,
    interaction: Partial<ExternalSurfaceInteractionState>,
  ) => ExternalSurfaceResult<void>;
  setPresentation: (
    surfaceId: string,
    presentation: Partial<ExternalSurfacePresentation>,
  ) => ExternalSurfaceResult<void>;
  sync: (surfaceId: string, force?: boolean) => ExternalSurfaceResult<void>;
  syncAll: (force?: boolean) => void;
};

export function ok<TValue>(value: TValue): ExternalSurfaceResult<TValue> {
  return {
    ok: true,
    value,
  };
}

export function fail<TValue = never>(
  code: ExternalSurfaceErrorCode,
  message: string,
): ExternalSurfaceResult<TValue> {
  return {
    error: {
      code,
      message,
    },
    ok: false,
  };
}
