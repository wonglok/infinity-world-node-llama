import { useCallback, useState } from "react";
import { CopyIconSVG } from "../../../../../../../icons/CopyIconSVG.js";
import { CheckIconSVG } from "../../../../../../../icons/CheckIconSVG.js";
import { SimplifiedModelChatItem } from "../../../../../../../../electron/state/llmState.js";

const showCopiedTime = 1000 * 2;

export function ModelMessageCopyButton({
    modelMessage,
}: ModelMessageCopyButtonProps) {
    const [copies, setCopies] = useState(0);

    const onClick = useCallback(() => {
        const text = modelMessage
            .filter((item) => item.type === "text")
            .map((item) => item.text)
            .join("\n")
            .trim();

        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopies((copies) => copies + 1);
                setTimeout(() => {
                    setCopies((copies) => copies - 1);
                }, showCopiedTime);
            })
            .catch((error) => {
                console.error("Failed to copy text to clipboard", error);
            });
    }, [modelMessage]);

    return (
        <button
            onClick={onClick}
            className={`grid grid-cols-1 grid-rows-1 p-1.5 border-none rounded-lg transition-colors duration-100 not-hover:not-focus-visible:bg-transparent ${copies > 0 ? "[&_.copy-icon]:opacity-0 [&_.copy-icon]:[transition-delay:0s] [&_.check-icon]:opacity-100 [&_.check-icon]:[transition-delay:0.1s]" : ""}`}
        >
            <CopyIconSVG className="copy-icon [grid-area:1/1] w-[18px] h-[18px] opacity-100 [transition:opacity_0.3s_ease-in-out] [transition-delay:0.1s]" />
            <CheckIconSVG className="check-icon [grid-area:1/1] w-[18px] h-[18px] opacity-0 [transition:opacity_0.3s_ease-in-out]" />
        </button>
    );
}

type ModelMessageCopyButtonProps = {
    modelMessage: SimplifiedModelChatItem["message"];
};
