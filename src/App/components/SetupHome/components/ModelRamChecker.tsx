import {useEffect, useState} from "react";
import {electronLlmRpc} from "../../../../rpc/llmRpc.ts";
import type {ModelResourcesInfo} from "../../../../../electron/rpc/llmRpc.ts";

function formatBytes(bytes: number) {
    return `${(bytes / 1e9).toFixed(1)} GB`;
}

export function ModelRamChecker({modelUri}: {modelUri: string}) {
    const [info, setInfo] = useState<ModelResourcesInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        electronLlmRpc.checkModelResources(modelUri).then((res) => {
            if (!cancelled) {
                setInfo(res);
                setLoading(false);
            }
        }).catch((err) => {
            if (!cancelled) {
                setError(String(err));
                setLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [modelUri]);

    if (loading) {
        return (
            <span className="text-[10px] opacity-40">Checking RAM…</span>
        );
    }

    if (error != null) {
        return (
            <span className="text-[10px] opacity-40">Couldn't check RAM</span>
        );
    }

    if (info == null) return null;

    return (
        <span className={"text-[10px] " + (info.hasEnoughRam ? "text-green-400" : "text-red-400")}>
            {info.hasEnoughRam ? "✓" : "⚠"} {formatBytes(info.modelRamRequired)} RAM needed · {formatBytes(info.systemRamFree)} free
        </span>
    );
}
