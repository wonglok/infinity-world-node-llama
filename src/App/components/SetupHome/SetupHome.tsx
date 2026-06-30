import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {electronLlmRpc} from "../../../rpc/llmRpc.ts";
import {llmState} from "../../../state/llmState.ts";
import {useExternalState} from "../../../hooks/useExternalState.ts";
import {DownloadIconSVG} from "../../../icons/DownloadIconSVG.tsx";
import {LoadFileIconSVG} from "../../../icons/LoadFileIconSVG.tsx";

const models = [
    {
        family: "Gemma 4 5B E2B",
        description: "Lightweight 5B-parameter model with 2B expert. Best for low-resource machines.",
        variants: [
            {label: "Q8_0 — 5.0GB", uri: "hf:giladgd/gemma-4-E2B-it-GGUF:Q8_0"},
            {label: "Q6_K — 3.9GB", uri: "hf:giladgd/gemma-4-E2B-it-GGUF:Q6_K"},
        ],
    },
    {
        family: "Gemma 4 8B E4B",
        description: "8B-parameter model with 4B expert. Great balance of quality and speed.",
        variants: [
            {label: "Q8_0 — 8.1GB", uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q8_0"},
            {label: "Q6_K — 6.3GB", uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q6_K"},
            {label: "Q4_K_M — 5.4GB", uri: "hf:giladgd/gemma-4-E4B-it-GGUF:Q4_K_M"},
        ],
    },
    {
        family: "Gemma 4 12B",
        description: "12B-parameter dense model. Strong reasoning and instruction following.",
        variants: [
            {label: "Q8_0 — 12.7GB", uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q8_0"},
            {label: "Q6_K — 9.8GB", uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q6_K"},
            {label: "Q5_K_M — 8.5GB", uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q5_K_M"},
            {label: "Q4_K_M — 7.4GB", uri: "hf:giladgd/gemma-4-12B-it-GGUF:Q4_K_M"},
        ],
    },
    {
        family: "Gemma 4 26B A4B MoE",
        description: "26B-parameter Mixture-of-Experts with 4B active. High quality with efficient inference.",
        variants: [
            {label: "Q8_0 — 26.9GB", uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q8_0"},
            {label: "Q6_K — 22.6GB", uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q6_K"},
            {label: "Q5_K_M — 19.1GB", uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q5_K_M"},
            {label: "Q4_K_M — 16.8GB", uri: "hf:giladgd/gemma-4-26B-A4B-it-GGUF:Q4_K_M"},
        ],
    },
    {
        family: "Gemma 4 31B",
        description: "31B-parameter dense model. Maximum quality for high-end machines.",
        variants: [
            {label: "Q8_0 — 32.6GB", uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q8_0"},
            {label: "Q6_K — 25.2GB", uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q6_K"},
            {label: "Q5_K_M — 21.8GB", uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q5_K_M"},
            {label: "Q4_K_M — 18.7GB", uri: "hf:giladgd/gemma-4-31B-it-GGUF:Q4_K_M"},
        ],
    },
];

export function SetupHome() {
    const state = useExternalState(llmState);
    const navigate = useNavigate();
    const {modelDownload} = state;

    const downloadModel = useCallback(async (uri: string) => {
        await electronLlmRpc.pullModel(uri);
    }, []);

    const openFileDialog = useCallback(async () => {
        await electronLlmRpc.selectModelFileAndLoad();
    }, []);

    const selectDirectory = useCallback(async () => {
        await electronLlmRpc.selectModelsDirectory();
    }, []);

    const displayDirectory = state.modelsDirectory ?? "Loading…";

    // Navigate to chat once a model is loaded
    if (state.model.loaded && state.contextSequence.loaded && state.chatSession.loaded) {
        navigate("/chat", {replace: true});
    }

    const progress = modelDownload.totalSize != null && modelDownload.totalSize > 0
        ? Math.round((modelDownload.downloadedSize ?? 0) / modelDownload.totalSize * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
            <div className="mx-auto max-w-3xl px-6 py-12">
                <h1 className="mb-2 text-3xl font-bold tracking-tight">Welcome to Infinity World</h1>
                <p className="mb-8 text-base opacity-70">
                    Choose a Gemma 4 model to download and start chatting. Models are downloaded once and cached locally.
                </p>

                {modelDownload.downloading && (
                    <div className="mb-8 rounded-xl border border-[var(--button-hover-border-color)] bg-[var(--panel-background-color)] p-6">
                        <div className="mb-2 text-sm font-medium">
                            Downloading {modelDownload.modelName}…
                        </div>
                        <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--panel-progress-color)]">
                            <div
                                className="h-full rounded-full bg-[var(--button-hover-border-color)] transition-all duration-300"
                                style={{width: `${progress}%`}}
                            />
                        </div>
                        <div className="text-xs opacity-60">
                            {modelDownload.totalSize != null
                                ? `${(modelDownload.downloadedSize! / 1e9).toFixed(1)} GB / ${(modelDownload.totalSize / 1e9).toFixed(1)} GB (${progress}%)`
                                : "Connecting…"}
                        </div>
                    </div>
                )}

                {modelDownload.error != null && (
                    <div className="mb-8 rounded-xl border border-[var(--error-border-color)] bg-[var(--panel-background-color)] p-4 text-sm">
                        Failed to download: {modelDownload.error}
                    </div>
                )}

                <div className="mb-6 rounded-xl border border-[var(--actions-block-border-color)] bg-[var(--actions-block-background-color)] p-4">
                    <div className="mb-1 text-sm font-medium">Models storage directory</div>
                    <div className="mb-3 text-xs opacity-50 break-all font-mono">{displayDirectory}</div>
                    <button
                        onClick={selectDirectory}
                        disabled={modelDownload.downloading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--actions-block-border-color)] bg-[var(--button-background-color)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--link-color)] disabled:opacity-40"
                    >
                        Change directory…
                    </button>
                </div>

                <div className="mb-10">
                    <button
                        onClick={openFileDialog}
                        disabled={modelDownload.downloading}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--button-hover-border-color)] bg-[var(--button-background-color)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--link-color)] disabled:opacity-40"
                    >
                        <LoadFileIconSVG className="h-4 w-4" />
                        Open local model file…
                    </button>
                </div>

                <div className="space-y-6">
                    {models.map((m) => (
                        <div
                            key={m.family}
                            className="rounded-xl border border-[var(--actions-block-border-color)] bg-[var(--actions-block-background-color)] p-5"
                        >
                            <h2 className="mb-1 text-lg font-semibold">{m.family}</h2>
                            <p className="mb-4 text-sm opacity-60">{m.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {m.variants.map((v) => (
                                    <button
                                        key={v.uri}
                                        onClick={() => downloadModel(v.uri)}
                                        disabled={modelDownload.downloading}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--actions-block-border-color)] bg-[var(--button-background-color)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--link-color)] disabled:opacity-40"
                                    >
                                        <DownloadIconSVG className="h-3.5 w-3.5" />
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
