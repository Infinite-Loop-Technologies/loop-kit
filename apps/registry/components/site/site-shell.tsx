// apps/registry/components/site/site-shell.tsx

"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import type { RegistryCategorySummary } from "@/lib/registry";
import {
  createDockLayout,
  createDockModal,
  createDockModalId,
  createDockPanelId,
  createDockSplit,
  createDockState,
  createDockTabGroup,
  createDockWindow,
} from "@loop-kit/dock";
import {
  DockProvider,
  DockRender,
  type DockRenderRegistry,
  useDockService,
} from "@loop-kit/dock-react";
import {
  BookOpen,
  Boxes,
  Home,
  LogIn,
  PanelLeft,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo } from "react";

type SiteShellProps = {
  categories: RegistryCategorySummary[];
  children: ReactNode;
};

const navPanelId = createDockPanelId("site-nav");
const contentPanelId = createDockPanelId("route-content");
const utilityPanelId = createDockPanelId("route-utility");
const settingsPanelId = createDockPanelId("workspace-settings");
const loginPanelId = createDockPanelId("workspace-login");
const siteModalId = createDockModalId("workspace-login-modal");

export function SiteShell({ categories, children }: SiteShellProps) {
  const pathname = usePathname();

  const initialState = useMemo(
    () =>
      createDockState({
        panels: [
          {
            id: navPanelId,
            title: "Navigation",
            kind: "site-nav",
            description: "Primary workspace navigation",
          },
          {
            id: contentPanelId,
            title: "Workspace",
            kind: "route-content",
            description: "Current route content",
          },
          {
            id: utilityPanelId,
            title: "Utilities",
            kind: "route-utility",
            description: "Contextual route utilities",
          },
          {
            id: settingsPanelId,
            title: "Settings",
            kind: "settings-window",
            description: "Floating workspace settings",
          },
          {
            id: loginPanelId,
            title: "Login",
            kind: "login-panel",
            description: "Modal login shell",
          },
        ],
        layout: createDockLayout({
          root: createDockSplit(
            "horizontal",
            createDockTabGroup([navPanelId], navPanelId),
            createDockSplit(
              "vertical",
              createDockTabGroup([contentPanelId], contentPanelId),
              createDockTabGroup([utilityPanelId], utilityPanelId),
              0.72,
            ),
            0.22,
          ),
          floatingWindows: [
            createDockWindow(
              "Workspace settings",
              createDockTabGroup([settingsPanelId], settingsPanelId),
              {
                frame: { x: 1040, y: 72, width: 340, height: 280 },
                active: true,
              },
            ),
          ],
          modals: [
            createDockModal(
              "Login flow",
              createDockTabGroup([loginPanelId], loginPanelId),
              {
                id: siteModalId,
                open: false,
              },
            ),
          ],
        }),
        focusedPanelId: contentPanelId,
        selectedPanelId: contentPanelId,
      }),
    [],
  );

  const registry = useMemo<DockRenderRegistry>(
    () => ({
      "site-nav": () => (
        <SiteNavPanel categories={categories} pathname={pathname} />
      ),
      "route-content": () => (
        <RouteContentPanel pathname={pathname}>{children}</RouteContentPanel>
      ),
      "route-utility": () => (
        <RouteUtilityPanel categories={categories} pathname={pathname} />
      ),
      "settings-window": () => <SettingsPanel />,
      "login-panel": () => <LoginPanel />,
    }),
    [categories, children, pathname],
  );

  return (
    <DockProvider initialState={initialState} registry={registry}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_32%),linear-gradient(180deg,color-mix(in_srgb,var(--background)_96%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] p-4 sm:p-5">
        <DockRender />
      </div>
    </DockProvider>
  );
}

function SiteNavPanel({
  categories,
  pathname,
}: {
  categories: RegistryCategorySummary[];
  pathname: string;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dockyard
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Installed Runtime Architecture
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The registry app is now rendered on top of the dock substrate instead
          of a bespoke shell.
        </p>
      </div>
      <div className="grid gap-2">
        <SiteLink
          href="/"
          active={pathname === "/"}
          icon={<Home className="size-4" />}
          label="Home"
        />
        <SiteLink
          href="/docs"
          active={pathname.startsWith("/docs")}
          icon={<BookOpen className="size-4" />}
          label="Docs"
        />
        <SiteLink
          href="/registry"
          active={pathname.startsWith("/registry")}
          icon={<Boxes className="size-4" />}
          label="Registry"
        />
        <SiteLink
          href="/dock-demo"
          active={pathname.startsWith("/dock-demo")}
          icon={<PanelLeft className="size-4" />}
          label="Dock demo"
        />
      </div>
      <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Categories
        </p>
        <div className="mt-3 grid gap-2">
          {categories.map((category) => (
            <SiteLink
              key={category.slug}
              href={`/registry/${category.slug}`}
              active={pathname === `/registry/${category.slug}`}
              label={`${category.name} (${category.count})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteContentPanel({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  const service = useDockService();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-card/80 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active route
          </p>
          <h2 className="text-lg font-semibold tracking-tight">{pathname}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => service.openModal(siteModalId)}
          >
            <LogIn className="mr-2 size-4" />
            Open login shell
          </Button>
          <Button variant="ghost" onClick={() => service.undo()}>
            Undo
          </Button>
          <Button variant="ghost" onClick={() => service.redo()}>
            Redo
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function RouteUtilityPanel({
  categories,
  pathname,
}: {
  categories: RegistryCategorySummary[];
  pathname: string;
}) {
  const service = useDockService();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace state
        </p>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
          <div>Route: {pathname}</div>
          <div>Categories: {categories.length}</div>
          <div>
            Dock service drives the shell, modal, and floating settings window.
          </div>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Next passes
        </p>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <li>Keyboard command boundaries</li>
          <li>Persistent workspace layouts</li>
          <li>User-extensible policies</li>
        </ul>
      </div>
      <Button
        className="mt-auto"
        onClick={() => service.openModal(siteModalId)}
      >
        Launch modal shell
      </Button>
    </div>
  );
}

function SettingsPanel() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Settings2 className="size-5" />
          Workspace settings
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Current theme: {theme ?? "system"}
        </p>
      </div>
      <div className="grid gap-2">
        <Button variant="secondary" onClick={() => setTheme("light")}>
          Light
        </Button>
        <Button variant="secondary" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button variant="secondary" onClick={() => setTheme("system")}>
          System
        </Button>
      </div>
    </div>
  );
}

function LoginPanel() {
  const service = useDockService();

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Modal shell
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Login and settings flows belong in dock too.
        </h3>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        This modal is rendered through the same dock service and runtime stack
        as the rest of the workspace.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button>Continue</Button>
        <Button variant="ghost" onClick={() => service.closeModal(siteModalId)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function SiteLink({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[1.25rem] px-3 py-2 text-sm transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
