import { BrowserWindow } from "electrobun/bun";

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
  url: "views://mainview/index.html",
});

mainWindow.webview.on("dom-ready", () => {
  console.log("volt-canvas-demo desktop ready");
  if (process.env.NODE_ENV !== "production") {
    mainWindow.webview.openDevTools();
  }
});
