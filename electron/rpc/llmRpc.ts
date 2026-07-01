import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { BrowserWindow, dialog } from "electron";
import { readGgufFileInfo, GgufInsights } from "node-llama-cpp";
import { createElectronSideBirpc } from "../utils/createElectronSideBirpc.ts";
import {
    llmFunctions,
    llmState,
    defaultModelsDirectory,
} from "../state/llmState.ts";
import type { RenderedFunctions } from "../../src/rpc/llmRpc.ts";

export type ModelCacheInfo = {
    cached: boolean;
    filePath?: string;
};

export type ModelResourcesInfo = {
    modelRamRequired: number;
    systemRamTotal: number;
    systemRamFree: number;
    modelSize: number;
    hasEnoughRam: boolean;
};

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
        resetModelsDirectory() {
            llmState.state = {
                ...llmState.state,
                modelsDirectory: defaultModelsDirectory,
            };
        },
        async selectModelFileAndLoad() {
            const res = await dialog.showOpenDialog({
                message: "Select a model file",
                title: "Select a model file",
                filters: [{ name: "Model file", extensions: ["gguf"] }],
                buttonLabel: "Open",
                defaultPath: (await pathExists(
                    llmState.state.modelsDirectory ?? "",
                ))
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
        async checkModelCached(modelUri: string): Promise<ModelCacheInfo> {
            const directory =
                llmState.state.modelsDirectory ?? defaultModelsDirectory;

            // Parse the URI: hf:user/repo:quant
            const firstColon = modelUri.indexOf(":");
            const lastColon = modelUri.lastIndexOf(":");
            const repoPath =
                firstColon >= 0 && lastColon > firstColon
                    ? modelUri.slice(firstColon + 1, lastColon)
                    : "";
            const quant = lastColon >= 0 ? modelUri.slice(lastColon + 1) : "";
            const repoName = repoPath.split("/").pop()?.toLowerCase() ?? "";
            const quantLower = quant.toLowerCase();

            // Scan the models directory recursively for .gguf files
            const ggufFiles = await findGgufFiles(directory);
            for (const filePath of ggufFiles) {
                const lowerPath = filePath.toLowerCase();

                if (
                    // must keep repoName.replace("-gguf", "")
                    lowerPath.includes(repoName.replace("-gguf", "")) &&
                    lowerPath.includes(quantLower)
                ) {
                    return { cached: true, filePath };
                }
            }
            return { cached: false };
        },
        async checkModelResources(
            modelUri: string,
        ): Promise<ModelResourcesInfo> {
            const systemRamTotal = os.totalmem();
            const systemRamFree = os.freemem();

            const ggufFileInfo = await readGgufFileInfo(modelUri);
            const insights = await GgufInsights.from(ggufFileInfo);
            const { cpuRam: modelRamRequired } =
                await insights.estimateModelResourceRequirementsV2({
                    gpuLayers: 0,
                });

            return {
                modelRamRequired,
                systemRamTotal,
                systemRamFree,
                modelSize: insights.modelSize,
                hasEnoughRam: systemRamFree >= modelRamRequired,
            };
        },
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

async function findGgufFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const subResults = await findGgufFiles(fullPath);
                results.push(...subResults);
            } else if (entry.isFile() && entry.name.endsWith(".gguf")) {
                results.push(fullPath);
            }
        }
    } catch {
        // Directory doesn't exist or can't be read
    }
    return results;
}

async function pathExists(path: string) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}
