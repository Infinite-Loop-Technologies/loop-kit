// BrowserService owns the tiny browser-only escape hatch for opening links.
export interface BrowserService {
  open: (url: string) => void;
}

export const createBrowserService = (): BrowserService => ({
  open: (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  },
});
