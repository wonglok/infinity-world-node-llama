import { MessageMarkdown } from "../../../MessageMarkdown/MessageMarkdown.js";
import { SimplifiedModelChatItem } from "../../../../../../electron/state/llmState.js";
import { ModelResponseThought } from "../ModelResponseThought/ModelResponseThought.js";
import { ModelResponseComment } from "../ModelResponseComment/ModelResponseComment.js";
import { ModelMessageCopyButton } from "./components/ModelMessageCopyButton/ModelMessageCopyButton.js";

export function ModelMessage({ modelMessage, active }: ModelMessageProps) {
    return (
        <div className="self-start me-12 ps-4.5 wrap-break-word max-w-[calc(100%-48px)] box-border min-h-fit [interpolate-size:allow-keywords] transition-[min-height,max-height] duration-500 ease-(--transition-easing) last:mb-0 last:min-h-[50svh]">
            {modelMessage.message.map((message, responseIndex) => {
                const isLastMessage =
                    responseIndex === modelMessage.message.length - 1;

                if (message.type === "segment") {
                    if (message.segmentType === "thought")
                        return (
                            <ModelResponseThought
                                key={responseIndex}
                                text={message.text}
                                active={isLastMessage && active}
                                duration={
                                    message.startTime != null &&
                                    message.endTime != null
                                        ? new Date(message.endTime).getTime() -
                                          new Date(message.startTime).getTime()
                                        : undefined
                                }
                            />
                        );
                    else if (message.segmentType === "comment")
                        return (
                            <ModelResponseComment
                                key={responseIndex}
                                text={message.text}
                                active={isLastMessage && active}
                            />
                        );
                    else
                        void (message.segmentType satisfies never);
                }

                return (
                    <MessageMarkdown
                        key={responseIndex}
                        activeDot={isLastMessage && active}
                        className="px-1.5"
                    >
                        {message.text}
                    </MessageMarkdown>
                );
            })}
            {modelMessage.message.length === 0 && active && (
                <MessageMarkdown className="px-1.5" activeDot />
            )}
            <div
                className={`flex flex-row py-3 opacity-60 justify-self-start transition-opacity duration-100 hover:opacity-100 focus-visible:opacity-100 ${active ? "opacity-0" : ""}`}
                {...(active ? { inert: true } : {})}
            >
                <ModelMessageCopyButton modelMessage={modelMessage.message} />
            </div>
        </div>
    );
}

type ModelMessageProps = {
    modelMessage: SimplifiedModelChatItem;
    active: boolean;
};
