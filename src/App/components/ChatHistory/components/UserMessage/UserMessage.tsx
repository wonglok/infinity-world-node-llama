import { MessageMarkdown } from "../../../MessageMarkdown/MessageMarkdown.js";
import { SimplifiedUserChatItem } from "../../../../../../electron/state/llmState.js";

export function UserMessage({ message }: UserMessageProps) {
    return (
        <div className="self-end max-w-[calc(100%-48px-12px)] ms-12 me-4 mb-4 first:mt-0 mt-9 animate-[floatUp_0.3s_ease-out_both]">
            <div className="relative flex justify-end">
                <MessageMarkdown className="bg-(--user-message-background-color) text-(--user-message-text-color) py-2.5 px-4 rounded-[1.25rem] wrap-break-word box-border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]">
                    {message.message}
                </MessageMarkdown>
                <div className="absolute bottom-1.5 -right-1.5 w-0 h-0 border-l-[7px] border-l-(--user-message-background-color) border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent" />
            </div>
        </div>
    );
}

type UserMessageProps = {
    message: SimplifiedUserChatItem;
};
