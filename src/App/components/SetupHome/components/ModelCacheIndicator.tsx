/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { electronLlmRpc } from "../../../../rpc/llmRpc.ts";
import type { ModelCacheInfo } from "../../../../../electron/rpc/llmRpc.ts";

export function ModelCacheIndicator({ modelUri }: { modelUri: string }) {
    const [info, setInfo] = useState<ModelCacheInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        electronLlmRpc
            .checkModelCached(modelUri)
            .then((res) => {
                if (!cancelled) {
                    setInfo(res);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setInfo(null);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [modelUri]);

    if (loading) {
        return <span className="cache-indicator cache-indicator--loading">···</span>;
    }

    if (info?.cached) {
        return (
            <span className="cache-indicator cache-indicator--cached">
                ✓ Cached
            </span>
        );
    }

    return <span className="cache-indicator cache-indicator--not-cached">Not cached</span>;
}
