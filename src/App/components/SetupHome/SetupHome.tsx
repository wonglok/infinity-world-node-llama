import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { electronLlmRpc } from "../../../rpc/llmRpc.ts";
import { llmState } from "../../../state/llmState.ts";
import { useExternalState } from "../../../hooks/useExternalState.ts";
import { DownloadIconSVG } from "../../../icons/DownloadIconSVG.tsx";
import { LoadFileIconSVG } from "../../../icons/LoadFileIconSVG.tsx";
import { ModelRamChecker } from "./components/ModelRamChecker.tsx";
import { ModelCacheIndicator } from "./components/ModelCacheIndicator.tsx";

import "./SetupHome.css";

const LAST_MODEL_KEY = "last-selected-model-uri";

const models = [
    {
        family: "Gemma 4 5B E2B",
        description:
            "Tiny but mighty — perfect for laptops with limited RAM. Great for quick chats and lightweight tasks.",
        variants: [
            {
                label: "Q8_0 · 5.0GB",
                uri: "hf:giladgd/gemma-4-E2B-it-GGUF:Q8_0",
            },
            {
                label: "Q6_K · 3.9GB",
                uri: "hf:giladgd/gemma-4-E2B-it-GGUF:Q6_K",
            },
        ],
    },
    {
        family: "Gemma 4 8B E4B",
        description:
            "The sweet spot — excellent quality and speed. Our most popular pick for everyday use.",
        variants: [
            {
                label: "Q8_0 · 8.1GB",
                uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q8_0",
            },
            {
                label: "Q6_K · 6.3GB",
                uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q6_K",
            },
            {
                label: "Q4_K_M · 5.4GB",
                uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q4_K_M",
            },
        ],
    },
    {
        family: "Gemma 4 12B",
        description:
            "Serious reasoning power. Strong instruction following for more demanding conversations.",
        variants: [
            {
                label: "Q8_0 · 12.7GB",
                uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q8_0",
            },
            {
                label: "Q6_K · 9.8GB",
                uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q6_K",
            },
            {
                label: "Q5_K_M · 8.5GB",
                uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q5_K_M",
            },
            {
                label: "Q4_K_M · 7.4GB",
                uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q4_K_M",
            },
        ],
    },
    {
        family: "Gemma 4 26B A4B MoE",
        description:
            "Mixture-of-Experts powerhouse — 26B parameters, 4B active. High quality, surprising efficiency.",
        variants: [
            {
                label: "Q8_0 · 26.9GB",
                uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q8_0",
            },
            {
                label: "Q6_K · 22.6GB",
                uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q6_K",
            },
            {
                label: "Q5_K_M · 19.1GB",
                uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q5_K_M",
            },
            {
                label: "Q4_K_M · 16.8GB",
                uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q4_K_M",
            },
        ],
    },
    {
        family: "Gemma 4 31B",
        description:
            "The big one — maximum quality for desktop workstations. Uncompromising performance.",
        variants: [
            {
                label: "Q8_0 · 32.6GB",
                uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q8_0",
            },
            {
                label: "Q6_K · 25.2GB",
                uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q6_K",
            },
            {
                label: "Q5_K_M · 21.8GB",
                uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q5_K_M",
            },
            {
                label: "Q4_K_M · 18.7GB",
                uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q4_K_M",
            },
        ],
    },
];

export function SetupHome() {
    const state = useExternalState(llmState);
    const navigate = useNavigate();
    const { modelDownload } = state;
    const [lastClickedUri, setLastClickedUri] = useState<string | null>(() => {
        try {
            return localStorage.getItem(LAST_MODEL_KEY);
        } catch {
            return null;
        }
    });
    const [pendingUri, setPendingUri] = useState<string | null>(null);

    const downloadModel = useCallback(async (uri: string) => {
        try {
            localStorage.setItem(LAST_MODEL_KEY, uri);
        } catch {
            // ignore storage errors
        }
        setLastClickedUri(uri);
        setPendingUri(uri);
        await electronLlmRpc.pullModel(uri);
        setPendingUri(null);
    }, []);

    const openFileDialog = useCallback(async () => {
        await electronLlmRpc.selectModelFileAndLoad();
    }, []);

    const selectDirectory = useCallback(async () => {
        await electronLlmRpc.selectModelsDirectory();
    }, []);

    const resetDirectory = useCallback(async () => {
        await electronLlmRpc.resetModelsDirectory();
    }, []);

    const displayDirectory = state.modelsDirectory ?? "Loading…";

    // Navigate to chat once a model is loaded
    if (
        state.model.loaded &&
        state.contextSequence.loaded &&
        state.chatSession.loaded
    ) {
        navigate("/chat", { replace: true });
    }

    const progress =
        modelDownload.totalSize != null && modelDownload.totalSize > 0
            ? Math.round(
                  ((modelDownload.downloadedSize ?? 0) /
                      modelDownload.totalSize) *
                      100,
              )
            : 0;

    return (
        <div className="setup-home w-full">
            <div className="mx-auto max-w-4xl px-6 py-14">
                <h1 className="hero-title mb-3">Welcome to Infinity World</h1>
                <p className="hero-subtitle mb-10 text-base">
                    Pick a model, download it once, and start chatting.
                    Everything runs locally on your machine.
                </p>

                {modelDownload.downloading && (
                    <div className="card-orange mb-8 p-6 animate-in">
                        <div className="mb-2 text-sm font-semibold text-[#6B4226]">
                            Downloading {modelDownload.modelName}&hellip;
                        </div>
                        <div className="progress-bar-track mb-2">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-xs opacity-50 text-[#5C3D2E]">
                            {modelDownload.totalSize != null
                                ? `${(modelDownload.downloadedSize! / 1e9).toFixed(1)} GB / ${(modelDownload.totalSize / 1e9).toFixed(1)} GB (${progress}%)`
                                : "Connecting to Hugging Face…"}
                        </div>
                    </div>
                )}

                {modelDownload.error != null && (
                    <div className="error-card mb-8 p-4 text-sm font-medium animate-in">
                        Something went wrong: {modelDownload.error}
                    </div>
                )}

                <div className="card-orange mb-6 p-5 animate-in">
                    <div className="mb-1 text-sm font-semibold text-[#6B4226]">
                        Storage folder
                    </div>
                    <div className="dir-path mb-3">{displayDirectory}</div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={selectDirectory}
                            disabled={modelDownload.downloading}
                            className="btn-secondary"
                        >
                            Change folder&hellip;
                        </button>
                        <button
                            onClick={resetDirectory}
                            disabled={modelDownload.downloading}
                            className="btn-secondary"
                        >
                            Reset to default
                        </button>
                    </div>
                </div>

                <div className="mb-12 animate-in">
                    <button
                        onClick={openFileDialog}
                        disabled={modelDownload.downloading}
                        className="btn-file"
                    >
                        <LoadFileIconSVG className="h-4 w-4" />
                        Open a local model file&hellip;
                    </button>
                </div>

                <div className="space-y-6">
                    {models.map((m, i) => (
                        <div
                            key={m.family}
                            className={
                                "model-section animate-in stagger-" + (i + 1)
                            }
                        >
                            <h2 className="model-section__title">{m.family}</h2>
                            <p className="model-section__desc">
                                {m.description}
                            </p>
                            <div className="model-table-wrapper">
                                <table className="model-table">
                                    <thead>
                                        <tr>
                                            <th>Quantization</th>
                                            <th>Size</th>
                                            <th>Cached</th>
                                            <th>RAM</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.variants.map((v) => {
                                            const [quant, size] =
                                                v.label.split(" · ");
                                            const isLastClicked =
                                                v.uri === lastClickedUri;
                                            const isDownloading =
                                                (modelDownload.downloading &&
                                                    modelDownload.modelUri ===
                                                        v.uri) ||
                                                pendingUri === v.uri;
                                            return (
                                                <tr
                                                    key={v.uri}
                                                    className={
                                                        isDownloading
                                                            ? "row-downloading"
                                                            : ""
                                                    }
                                                >
                                                    <td className="td-quant">
                                                        {quant}
                                                    </td>
                                                    <td className="td-size">
                                                        {size}
                                                    </td>
                                                    <td className="td-cached">
                                                        <ModelCacheIndicator
                                                            modelUri={v.uri}
                                                        />
                                                    </td>
                                                    <td className="td-ram">
                                                        <ModelRamChecker
                                                            modelUri={v.uri}
                                                        />
                                                    </td>
                                                    <td className="td-action">
                                                        <button
                                                            onClick={() =>
                                                                downloadModel(
                                                                    v.uri,
                                                                )
                                                            }
                                                            disabled={
                                                                modelDownload.downloading
                                                            }
                                                            className={
                                                                "btn-download" +
                                                                (isLastClicked
                                                                    ? " last-used"
                                                                    : "")
                                                            }
                                                        >
                                                            {isDownloading ? (
                                                                <svg
                                                                    className="h-3.5 w-3.5 animate-spin"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    />
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                <DownloadIconSVG className="h-3.5 w-3.5" />
                                                            )}
                                                            {isDownloading
                                                                ? "Loading…"
                                                                : "Download"}
                                                        </button>
                                                        {isLastClicked &&
                                                            !isDownloading && (
                                                                <div className="last-used-tag">
                                                                    Last used
                                                                </div>
                                                            )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
