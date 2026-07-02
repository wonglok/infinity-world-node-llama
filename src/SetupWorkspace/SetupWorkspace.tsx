import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { electronWorkspaceRpc } from "../rpc/workspaceRpc.ts";

export function SetupWorkspace() {
    const navigate = useNavigate();
    const [workspaceFolder, setWorkspaceFolder] = useState<
        string | undefined
    >();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        electronWorkspaceRpc
            .getWorkspaceFolder()
            .then((folder) => {
                setWorkspaceFolder(folder);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to get workspace folder", err);
                setLoading(false);
            });
    }, []);

    const selectFolder = useCallback(async () => {
        const folder = await electronWorkspaceRpc.selectWorkspaceFolder();
        setWorkspaceFolder(folder);
    }, []);

    const displayFolder = workspaceFolder ?? "No folder selected";

    return (
        <div className="w-full">
            <div className="mx-auto max-w-4xl px-6 py-14">
                <h1 className="mb-3 text-[2.25rem] leading-[1.15] font-bold tracking-tight">
                    Set Up Your Workspace
                </h1>
                <p className="mb-10 text-base opacity-60">
                    Choose where to store your project files. You can change
                    this later.
                </p>

                {loading ? (
                    <div className="flex items-center gap-3 opacity-60 font-medium">
                        <div className="w-5 h-5 border-2 border-(--text-color,#4a3f35) border-t-transparent rounded-full animate-[spin_0.7s_linear_infinite]" />
                        Loading&hellip;
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[rgba(200,170,120,0.25)] bg-[rgba(255,255,255,0.45)] p-6 shadow-[0_2px_12px_rgba(180,160,140,0.08),inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                        <div className="mb-1 text-sm font-semibold text-[#6B4226]">
                            Workspace folder
                        </div>
                        <div className="mb-4 text-sm font-mono text-[#5C3D2E] break-all">
                            {displayFolder}
                        </div>
                        <div className="flex gap-2.5">
                            <button
                                onClick={selectFolder}
                                className="rounded-lg border border-[rgba(200,170,120,0.3)] bg-white/60 px-4 py-2 text-sm font-medium transition-colors hover:border-[rgba(180,140,80,0.5)]"
                            >
                                {workspaceFolder ? "Change folder…" : "Browse…"}
                            </button>
                            {workspaceFolder && (
                                <button
                                    onClick={() => navigate("/setup-home")}
                                    className="rounded-lg border border-[rgba(180,140,80,0.4)] bg-[#d4a964] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c89a4e]"
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
