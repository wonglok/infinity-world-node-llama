import { LoadFileIconSVG } from "../../../icons/LoadFileIconSVG.tsx";
import { DeleteIconSVG } from "../../../icons/DeleteIconSVG.tsx";
import { FixedDivWithSpacer } from "../FixedDivWithSpacer/FixedDivWithSpacer.tsx";

import "./Header.css";

export function Header({
    appVersion,
    canShowCurrentVersion,
    modelName,
    onLoadClick,
    loadPercentage,
    onResetChatClick,
}: HeaderProps) {
    return (
        <FixedDivWithSpacer className="appHeader flex flex-row top-4 pointer-events-none w-[calc(100%-32px)] max-w-[var(--app-max-width)]">
            <div
                className="relative flex flex-row self-start rounded-[1.25rem] border-2 border-[rgba(200,170,120,0.2)] overflow-clip isolate z-10 pointer-events-auto"
                style={{
                    backgroundColor: "var(--panel-background-color)",
                    color: "var(--panel-text-color)",
                    boxShadow: "var(--panel-box-shadow)",
                }}
            >
                <div
                    className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-opacity duration-300 ${loadPercentage === 1 ? "opacity-0" : ""}`}
                    style={{
                        backgroundColor: "var(--panel-progress-color)",
                        width:
                            loadPercentage != null
                                ? `${loadPercentage * 100}%`
                                : undefined,
                        zIndex: -1,
                    }}
                />

                {modelName != null ? (
                    <div className="flex-1 text-start self-center basis-[400px] py-3 px-6 break-words me-12">
                        {modelName}
                    </div>
                ) : (
                    <div className="flex-1 text-start self-center basis-[400px] py-3 px-6 break-words me-12">
                        No model loaded
                    </div>
                )}

                <button
                    className="shrink-0 flex flex-col items-center justify-center p-2 m-2 rounded-full transition-all duration-300 hover:[transform:scale(1.06)] active:[transform:scale(0.94)]"
                    style={{
                        backgroundColor: "var(--panel-button-background-color)",
                        color: "var(--panel-text-color)",
                        fill: "var(--panel-text-color)",
                    }}
                    disabled={onResetChatClick == null}
                    onClick={onResetChatClick}
                >
                    <DeleteIconSVG className="w-5 h-5" />
                </button>
                <button
                    className="shrink-0 flex flex-col items-center justify-center p-2 m-2 ml-0 rounded-full transition-all duration-300 hover:[transform:scale(1.06)] active:[transform:scale(0.94)]"
                    style={{
                        backgroundColor: "var(--panel-button-background-color)",
                        color: "var(--panel-text-color)",
                        fill: "var(--panel-text-color)",
                    }}
                    onClick={onLoadClick}
                    disabled={onLoadClick == null}
                >
                    <LoadFileIconSVG className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow" />
        </FixedDivWithSpacer>
    );
}

type HeaderProps = {
    appVersion?: string;
    canShowCurrentVersion?: boolean;
    modelName?: string;
    onLoadClick?(): void;
    loadPercentage?: number;
    onResetChatClick?(): void;
};
