/**
 * Dock policies installed on top of the interaction runtime.
 *
 * Policies map structured interaction signals to dock service commands.
 */

import { installed, type Installer } from "@loop-kit/common";
import type { InteractionRuntime, InteractionTarget } from "@loop-kit/interaction-core";
import type { DockRuntime } from "./DockRuntime.js";
import { findSplitById } from "./DockLayout.js";

const isTargetKind = <TKind extends string>(
  runtime: InteractionRuntime,
  targetId: InteractionTarget["id"],
  kind: TKind,
): InteractionTarget | undefined => {
  const target = runtime.getTarget(targetId);
  return target?.kind === kind ? target : undefined;
};

export const createDockPolicies = ({
  runtime,
}: {
  readonly runtime: DockRuntime;
}): Installer<DockRuntime["env"]> =>
  () => {
    const subscriptions = [
      runtime.interaction.signals.click.subscribe((event) => {
        const tabTarget = isTargetKind(runtime.interaction, event.targetId, "DockTab");
        if (tabTarget && tabTarget.data && "panelId" in (tabTarget.data as object)) {
          const { panelId } = tabTarget.data as { panelId: Parameters<
            DockRuntime["service"]["selectPanel"]
          >[0] };
          runtime.service.selectPanel(panelId);
          runtime.service.focusPanel(panelId);
          return;
        }

        const panelBodyTarget = isTargetKind(
          runtime.interaction,
          event.targetId,
          "DockPanelBody",
        );
        if (
          panelBodyTarget &&
          panelBodyTarget.data &&
          "panelId" in (panelBodyTarget.data as object)
        ) {
          runtime.service.focusPanel(
            (panelBodyTarget.data as { panelId: Parameters<
              DockRuntime["service"]["focusPanel"]
            >[0] }).panelId,
          );
          return;
        }

        const windowTarget = isTargetKind(
          runtime.interaction,
          event.targetId,
          "DockWindowTitlebar",
        );
        if (windowTarget && windowTarget.data && "windowId" in (windowTarget.data as object)) {
          runtime.service.execute({
            type: "FocusWindow",
            windowId: (windowTarget.data as {
              readonly windowId: Extract<
                Parameters<DockRuntime["service"]["execute"]>[0],
                { readonly type: "FocusWindow" }
              >["windowId"];
            }).windowId,
          });
        }
      }),
      runtime.interaction.signals.dragStart.subscribe((event) => {
        const tabTarget = isTargetKind(runtime.interaction, event.targetId, "DockTab");
        if (tabTarget && tabTarget.data && "panelId" in (tabTarget.data as object)) {
          runtime.state.update((current) => ({
            ...current,
            draggedPanelId: (tabTarget.data as { panelId: Parameters<
              DockRuntime["service"]["selectPanel"]
            >[0] }).panelId,
            preview: undefined,
          }));
          return;
        }

        const resizeTarget = isTargetKind(
          runtime.interaction,
          event.targetId,
          "DockResizeHandle",
        );
        if (
          resizeTarget &&
          resizeTarget.data &&
          "splitId" in (resizeTarget.data as object) &&
          "axis" in (resizeTarget.data as object)
        ) {
          const data = resizeTarget.data as {
            readonly splitId: Parameters<DockRuntime["service"]["resizeSplit"]>[0];
            readonly axis: "horizontal" | "vertical";
          };
          const split = findSplitById(runtime.service.state.get().layout.root, data.splitId);
          if (!split) return;
          runtime.state.update((current) => ({
            ...current,
            activeResize: {
              splitId: data.splitId,
              axis: data.axis,
              startRatio: split.ratio,
              origin: event.origin,
            },
          }));
        }
      }),
      runtime.interaction.signals.dragMove.subscribe((event) => {
        const dropzoneTarget = isTargetKind(
          runtime.interaction,
          event.targetId,
          "DockDropzone",
        );
        if (
          dropzoneTarget &&
          dropzoneTarget.data &&
          "groupId" in (dropzoneTarget.data as object) &&
          "side" in (dropzoneTarget.data as object)
        ) {
          runtime.state.update((current) => ({
            ...current,
            preview: {
              type: "DockDropPlacement",
              groupId: (dropzoneTarget.data as { groupId: never }).groupId,
              side: (dropzoneTarget.data as { side: never }).side,
            },
          }));
          return;
        }

        const resize = runtime.state.get().activeResize;
        if (!resize) return;
        const delta =
          resize.axis === "horizontal"
            ? (event.point.x - resize.origin.x) / 500
            : (event.point.y - resize.origin.y) / 500;
        runtime.service.resizeSplit(resize.splitId, resize.startRatio + delta);
      }),
      runtime.interaction.signals.dragEnd.subscribe(() => {
        const current = runtime.state.get();
        if (current.draggedPanelId && current.preview) {
          runtime.service.commitDrop(current.draggedPanelId, current.preview);
        }
        runtime.state.set({});
      }),
    ];

    return installed(undefined, () => {
      for (const unsubscribe of subscriptions) unsubscribe();
    });
  };
