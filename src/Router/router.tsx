import { HashRouter, Routes, Route } from "react-router-dom";
import { SetupHome } from "../App/components/SetupHome/SetupHome.tsx";
import { SetupWorkspace } from "../SetupWorkspace/SetupWorkspace.tsx";
import { App } from "../App/App.tsx";
// import { GamePage } from "../GamePage/GamePage.tsx";

export function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<SetupWorkspace />} />
                <Route path="/setup-home" element={<SetupHome />} />
                <Route path="/chat" element={<App />} />
            </Routes>
        </HashRouter>
    );
}

//
