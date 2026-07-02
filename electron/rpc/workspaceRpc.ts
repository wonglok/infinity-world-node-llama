import path from "node:path";
import { BrowserWindow, dialog } from "electron";
import { createElectronSideBirpc } from "../utils/createElectronSideBirpc.ts";
import {
    getWorkspaceFolder,
    setWorkspaceFolder,
} from "../state/workspaceState.ts";
import type { RenderedFunctions } from "../../src/rpc/workspaceRpc.ts";

export class ElectronWorkspaceRpc {
    public readonly rendererWorkspaceRpc: ReturnType<
        typeof createElectronSideBirpc<RenderedFunctions, typeof this.functions>
    >;

    public readonly functions = {
        async getWorkspaceFolder() {
            return getWorkspaceFolder();
        },
        async selectWorkspaceFolder() {
            const currentFolder = getWorkspaceFolder();
            const res = await dialog.showOpenDialog({
                message: "Select a workspace folder for your project files",
                title: "Select Workspace Folder",
                buttonLabel: "Select",
                defaultPath: currentFolder ?? undefined,
                properties: ["openDirectory", "createDirectory"],
            });

            if (!res.canceled && res.filePaths.length > 0) {
                const folder = path.resolve(res.filePaths[0]!);
                setWorkspaceFolder(folder);
                return folder;
            }
            return currentFolder;
        },
    } as const;

    public constructor(window: BrowserWindow) {
        this.rendererWorkspaceRpc = createElectronSideBirpc<
            RenderedFunctions,
            typeof this.functions
        >("workspaceRpc", "workspaceRpc", window, this.functions);
    }
}

export type ElectronWorkspaceFunctions =
    typeof ElectronWorkspaceRpc.prototype.functions;

export function registerWorkspaceRpc(window: BrowserWindow) {
    new ElectronWorkspaceRpc(window);
}
