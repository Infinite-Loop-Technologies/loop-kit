"use client";

import { useDockService, useDockState } from "@loop-kit/dock-react";
import { Button } from "@/components/ui/button";

const loginModalId = "workspace-login-modal" as never;

export function DockDemoExperiment() {
  const service = useDockService();
  const state = useDockState();

  return (
    <section className="flex min-h-[calc(100vh-14rem)] flex-col gap-6">
      <header className="grid gap-5 rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur lg:grid-cols-[minmax(0,1.2fr)_22rem]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Runtime showcase
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">Dock demo</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              The app shell itself is now the main dock demo. Drag the tabs in the workspace,
              hover the edge dropzones to preview a split, use the floating settings window, and
              trigger the modal shell from here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => service.openModal(loginModalId)}>Open modal shell</Button>
            <Button variant="secondary" onClick={() => service.undo()}>
              Undo
            </Button>
            <Button variant="secondary" onClick={() => service.redo()}>
              Redo
            </Button>
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
          <Metric label="Panels" value={String(state.panels.length)} />
          <Metric label="Floating windows" value={String(state.layout.floatingWindows.length)} />
          <Metric label="Modals" value={String(state.layout.modals.length)} />
          <Metric label="Committed commands" value={String(state.history.commands.length)} />
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_24rem]">
        <div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">What is live now</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Dock owns committed layout state for tab groups, splits, floating windows, and modal
              shells.
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Interaction owns targets, structured press and drag signals, and session state.
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Policies translate drag and click signals into dock commands, while preview state
              stays runtime-only until commit.
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">Try this</h2>
          <ol className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Grab a tab in the dock shell and move it over a dropzone edge.
            </li>
            <li className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Watch the preview badge update before the committed state changes.
            </li>
            <li className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
              Open the modal shell and verify it renders through the same dock service.
            </li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
