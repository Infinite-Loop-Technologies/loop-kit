import { createContext } from "react";

export const DockContext = createContext(null);

export const DockProvider = ({ children }: { children: React.ReactNode }) => {
  return <DockContext.Provider value={null}>{children}</DockContext.Provider>;
};
