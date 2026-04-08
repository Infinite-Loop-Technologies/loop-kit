import { useMemo } from "react";
import { BrowserDemoPage } from "./browser/BrowserDemoPage";
import { createBrowserServices } from "./browser/services/createBrowserServices";

export function App() {
  const services = useMemo(() => createBrowserServices(), []);
  return <BrowserDemoPage services={services} />;
}
