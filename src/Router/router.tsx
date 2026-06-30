import { HashRouter, Routes, Route } from "react-router-dom";
import { SetupHome } from "../App/components/SetupHome/SetupHome.tsx";
import { App } from "../App/App.tsx";

export function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<SetupHome />} />
                <Route path="/chat" element={<App />} />
            </Routes>
        </HashRouter>
    );
}
