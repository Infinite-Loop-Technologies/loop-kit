import { Boxes, Command, Dock, Home, Keyboard, Layers, PanelsTopLeft, Rows3 } from "lucide-react"

export const labs = [
  {
    id: "overview",
    label: "Overview",
    description: "Repo demo map and validation status.",
    Icon: Home,
  },
  {
    id: "dock",
    label: "Dock Lab",
    description: "Dock service, runtime, policy, tabs, resizing, and modals.",
    Icon: Dock,
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "Panel selection and tab movement expectations.",
    Icon: PanelsTopLeft,
  },
  {
    id: "modals",
    label: "Modals",
    description: "Modal queue behavior, Escape, and backdrop policy.",
    Icon: Layers,
  },
  {
    id: "windows",
    label: "Windows",
    description: "Floating-window model pressure tests.",
    Icon: Boxes,
  },
  {
    id: "drag",
    label: "Drag/Drop",
    description: "Interaction targets, runtime policy, and service-owned order.",
    Icon: Rows3,
  },
  {
    id: "keyboard",
    label: "Keyboard",
    description: "Interaction target focus and key signal inspection.",
    Icon: Keyboard,
  },
  {
    id: "signals",
    label: "Signals",
    description: "Pointer and command signal visibility.",
    Icon: Command,
  },
] as const

export type LabId = (typeof labs)[number]["id"]
