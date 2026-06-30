import path from "node:path";
import fs from "node:fs/promises";
import { BrowserWindow, dialog } from "electron";
import { createElectronSideBirpc } from "../utils/createElectronSideBirpc.ts";
import { llmFunctions, llmState } from "../state/llmState.ts";
import type {RenderedFunctions} from "../../src/rpc/llmRpc.ts";

export class ElectronLlmRpc {
    public readonly rendererLlmRpc: ReturnType<
        typeof createElectronSideBirpc<RenderedFunctions, typeof this.functions>
    >;

    public readonly functions = {
        async pullModel(modelUri: string) {
            await llmFunctions.pullModel(modelUri);
        },
        async selectModelsDirectory() {
            const currentDir = llmState.state.modelsDirectory ?? "";
            const res = await dialog.showOpenDialog({
                message: "Select a directory to store downloaded models",
                title: "Select Models Directory",
                buttonLabel: "Select",
                defaultPath: (await pathExists(currentDir))
                    ? currentDir
                    : undefined,
                properties: ["openDirectory", "createDirectory"],
            });

            if (!res.canceled && res.filePaths.length > 0) {
                llmState.state = {
                    ...llmState.state,
                    modelsDirectory: path.resolve(res.filePaths[0]!),
                };
            }
        },
        async selectModelFileAndLoad() {
            const res = await dialog.showOpenDialog({
                message: "Select a model file",
                title: "Select a model file",
                filters: [{name: "Model file", extensions: ["gguf"]}],
                buttonLabel: "Open",
                defaultPath: (await pathExists(llmState.state.modelsDirectory ?? ""))
                    ? llmState.state.modelsDirectory
                    : undefined,
                properties: ["openFile"],
            });

            if (!res.canceled && res.filePaths.length > 0) {
                llmState.state = {
                    ...llmState.state,
                    selectedModelFilePath: path.resolve(res.filePaths[0]!),
                    chatSession: {
                        loaded: false,
                        generatingResult: false,
                        simplifiedChat: [],
                        draftPrompt: {
                            prompt: llmState.state.chatSession.draftPrompt
                                .prompt,
                            completion: "",
                        },
                    },
                };

                if (!llmState.state.llama.loaded)
                    await llmFunctions.loadLlama();

                await llmFunctions.loadModel(
                    llmState.state.selectedModelFilePath!,
                );
                await llmFunctions.createContext();
                await llmFunctions.createContextSequence();
                await llmFunctions.chatSession.createChatSession();
            }
        },
        getState() {
            return llmState.state;
        },
        setDraftPrompt: llmFunctions.chatSession.setDraftPrompt,
        prompt: llmFunctions.chatSession.prompt,
        stopActivePrompt: llmFunctions.chatSession.stopActivePrompt,
        resetChatHistory: llmFunctions.chatSession.resetChatHistory,
    } as const;

    public constructor(window: BrowserWindow) {
        this.rendererLlmRpc = createElectronSideBirpc<
            RenderedFunctions,
            typeof this.functions
        >("llmRpc", "llmRpc", window, this.functions);

        this.sendCurrentLlmState = this.sendCurrentLlmState.bind(this);

        llmState.createChangeListener(this.sendCurrentLlmState);
        this.sendCurrentLlmState();
    }

    public sendCurrentLlmState() {
        this.rendererLlmRpc.updateState(llmState.state);
    }
}

export type ElectronFunctions = typeof ElectronLlmRpc.prototype.functions;

export function registerLlmRpc(window: BrowserWindow) {
    new ElectronLlmRpc(window);
}

async function pathExists(path: string) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}
