import { createRendererSideBirpc } from "../utils/createRendererSideBirpc.ts";
import type { ElectronWorkspaceFunctions } from "../../electron/rpc/workspaceRpc.ts";

const renderedFunctions = {} as const;
export type RenderedFunctions = typeof renderedFunctions;

export const electronWorkspaceRpc =
    createRendererSideBirpc<ElectronWorkspaceFunctions, RenderedFunctions>(
        "workspaceRpc",
        "workspaceRpc",
        renderedFunctions,
    );
