import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter/opsz-italic.css";
import { AppRouter } from "./Router/router.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
        <AppRouter />
    </>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
});
