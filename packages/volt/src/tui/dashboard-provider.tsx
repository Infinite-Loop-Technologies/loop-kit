import * as React from "react";
import { createStoreContext } from "@loop-kit/state";
import type { DashboardStoreState } from "./dashboard-model";
import type { DashboardService } from "./dashboard-service";

const DashboardStoreContext = createStoreContext<DashboardStoreState>("VoltDashboardStore");
const DashboardServiceContext = React.createContext<DashboardService | null>(null);
DashboardServiceContext.displayName = "VoltDashboardServiceContext";

export const DashboardProvider = ({
  children,
  service,
}: {
  children: React.ReactNode;
  service: DashboardService;
}) => (
  <DashboardServiceContext.Provider value={service}>
    <DashboardStoreContext.Provider store={service.store}>
      {children}
    </DashboardStoreContext.Provider>
  </DashboardServiceContext.Provider>
);

export const useDashboardService = () => {
  const service = React.useContext(DashboardServiceContext);
  if (!service) {
    throw new Error("DashboardProvider is required before using the dashboard service.");
  }
  return service;
};

export const useDashboardSelector = DashboardStoreContext.useSelector;
export const useDashboardState = DashboardStoreContext.useState;
