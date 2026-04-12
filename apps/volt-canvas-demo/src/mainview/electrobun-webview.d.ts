import type * as React from "react";

type ElectrobunWebviewEventMap = {
  "did-navigate": CustomEvent<{ url?: string }>;
  "dom-ready": CustomEvent;
};

declare global {
  interface Window {
    __electrobunWebviewId?: number;
    __electrobunWindowId?: number;
  }

  interface ElectrobunWebviewElement extends HTMLElement {
    canGoBack: () => Promise<boolean>;
    canGoForward: () => Promise<boolean>;
    goBack: () => void;
    goForward: () => void;
    loadURL: (url: string) => void;
    off: <TEventName extends keyof ElectrobunWebviewEventMap>(
      eventName: TEventName,
      listener: (event: ElectrobunWebviewEventMap[TEventName]) => void,
    ) => void;
    on: <TEventName extends keyof ElectrobunWebviewEventMap>(
      eventName: TEventName,
      listener: (event: ElectrobunWebviewEventMap[TEventName]) => void,
    ) => void;
    reload: () => void;
    setNavigationRules: (rules: string[]) => void;
    syncDimensions?: (force?: boolean) => void;
    toggleHidden?: (enabled?: boolean) => void;
    togglePassthrough?: (enabled?: boolean) => void;
    toggleTransparent?: (enabled: boolean) => void;
  }

  interface HTMLElementTagNameMap {
    "electrobun-webview": ElectrobunWebviewElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      "electrobun-webview": React.DetailedHTMLProps<
        React.HTMLAttributes<ElectrobunWebviewElement>,
        ElectrobunWebviewElement
      >;
    }
  }
}

export {};
