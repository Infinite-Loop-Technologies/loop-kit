import { BrowserWindow } from "electrobun/bun";

const isProduction =
  process.env.VOLT_MODE === "production" || process.env.NODE_ENV === "production";
const devServerUrl = process.env.VOLT_CANVAS_WEB_UI_URL?.trim();
const mainViewUrl =
  !isProduction && devServerUrl ? devServerUrl : "views://mainview/index.html";

const mainWindow = new BrowserWindow({
  frame: {
    height: 980,
    width: 1560,
    x: 120,
    y: 80,
  },
  renderer: "native",
  title: "Volt Canvas Demo",
  titleBarStyle: "default",
  url: mainViewUrl,
});

mainWindow.webview.on("dom-ready", () => {
  console.log("volt-canvas-demo desktop ready");
  if (!isProduction) {
    mainWindow.webview.openDevTools();
  }
});
