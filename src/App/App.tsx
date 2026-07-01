import { useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { llmState } from "../state/llmState.ts";
import { electronLlmRpc } from "../rpc/llmRpc.ts";
import { useExternalState } from "../hooks/useExternalState.ts";
import { ChatHistory } from "./components/ChatHistory/ChatHistory.tsx";
import { InputRow } from "./components/InputRow/InputRow.tsx";

export function App() {
    const state = useExternalState(llmState);
    const navigate = useNavigate();
    const { generatingResult } = state.chatSession;
    const isScrollAnchoredRef = useRef(false);
    const lastAnchorScrollTopRef = useRef<number>(0);

    const isScrolledToTheBottom = useCallback(() => {
        return (
            document.documentElement.scrollHeight -
                document.documentElement.scrollTop -
                1 <=
            document.documentElement.clientHeight
        );
    }, []);

    const scrollToBottom = useCallback(() => {
        const newScrollTop =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

        if (
            newScrollTop > document.documentElement.scrollTop &&
            newScrollTop > lastAnchorScrollTopRef.current
        ) {
            document.documentElement.scrollTo({
                top: newScrollTop,
                behavior: "smooth",
            });
            lastAnchorScrollTopRef.current = document.documentElement.scrollTop;
        }

        isScrollAnchoredRef.current = true;
    }, []);

    useLayoutEffect(() => {
        // anchor scroll to bottom

        function onScroll() {
            const currentScrollTop = document.documentElement.scrollTop;

            isScrollAnchoredRef.current =
                isScrolledToTheBottom() ||
                currentScrollTop >= lastAnchorScrollTopRef.current;

            // handle scroll animation
            if (isScrollAnchoredRef.current)
                lastAnchorScrollTopRef.current = currentScrollTop;
        }

        const observer = new ResizeObserver(() => {
            if (isScrollAnchoredRef.current && !isScrolledToTheBottom())
                scrollToBottom();
        });

        window.addEventListener("scroll", onScroll, { passive: false });
        observer.observe(document.body, {
            box: "border-box",
        });
        scrollToBottom();

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const openSelectModelFileDialog = useCallback(async () => {
        await electronLlmRpc.selectModelFileAndLoad();
    }, []);

    const stopActivePrompt = useCallback(() => {
        void electronLlmRpc.stopActivePrompt();
    }, []);

    const resetChatHistory = useCallback(() => {
        void electronLlmRpc.stopActivePrompt();
        void electronLlmRpc.resetChatHistory();
    }, []);

    const sendPrompt = useCallback(
        (prompt: string) => {
            if (generatingResult) return;

            scrollToBottom();
            void electronLlmRpc.prompt(prompt);
        },
        [generatingResult, scrollToBottom],
    );

    const onPromptInput = useCallback((currentText: string) => {
        void electronLlmRpc.setDraftPrompt(currentText);
    }, []);

    const error =
        state.llama.error ??
        state.model.error ??
        state.context.error ??
        state.contextSequence.error;
    const loading =
        state.selectedModelFilePath != null &&
        error == null &&
        (!state.model.loaded ||
            !state.llama.loaded ||
            !state.context.loaded ||
            !state.contextSequence.loaded ||
            !state.chatSession.loaded);
    const showMessage =
        state.selectedModelFilePath == null ||
        error != null ||
        state.chatSession.simplifiedChat.length === 0;

    return (
        <div className="mx-auto flex flex-col w-full min-h-full max-w-180 [--app-max-width:720px] relative p-5">
            <button
                className="flex items-center gap-2"
                onClick={() => navigate("/")}
                title="Back to setup"
            >
                <svg
                    className="h-4 w-4"
                    viewBox="0 -960 960 960"
                    fill="currentColor"
                >
                    <path d="m313-440 196 196q12 12 11.5 28.5T508-187q-12 11-28 11.5T452-188L188-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l264-264q11-11 27.5-11t28.5 11q12 12 12 28.5T508-715L313-520h447q17 0 28.5 11.5T800-480q0 17-11.5 28.5T760-440H313Z" />
                </svg>
                <span>Setup</span>
            </button>

            {showMessage && (
                <div className="flex-1 flex flex-col justify-evenly items-center gap-12 overflow-auto py-6">
                    {error != null && (
                        <div className="border-2 border-(--error-border-color) py-2.5 px-4 rounded-2xl shadow-[0_8px_32px_-16px_var(--error-border-color)]">
                            {String(error)}
                        </div>
                    )}
                    {loading && (
                        <div className="flex flex-row items-center gap-3 opacity-60 font-medium">
                            <div className="w-5 h-5 border-2 border-(--text-color,#4a3f35) border-t-transparent rounded-full animate-[spin_0.7s_linear_infinite]" />
                            Loading AI...
                        </div>
                    )}
                    {(state.selectedModelFilePath == null ||
                        state.llama.error != null) && (
                        <div className="flex flex-col items-center gap-16 text-start">
                            <div className="opacity-60">
                                No model loaded. Go to setup to choose and
                                download a model.
                            </div>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-(--button-hover-border-color) bg-(--button-background-color) px-4 py-2 text-sm font-medium transition-colors hover:border-(--link-color)"
                                onClick={() => navigate("/")}
                            >
                                Back to Setup
                            </button>
                        </div>
                    )}
                    {!loading &&
                        state.selectedModelFilePath != null &&
                        error == null &&
                        state.chatSession.simplifiedChat.length === 0 && (
                            <div className="typeMessage opacity-60 bg-[rgba(255,255,255,0.45)] border border-[rgba(200,170,120,0.25)] rounded-[9999px] py-2.5 px-6 text-sm shadow-[0_2px_12px_rgba(180,160,140,0.08),inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                                Type a message to start the conversation
                            </div>
                        )}
                </div>
            )}
            {!showMessage && (
                <ChatHistory
                    className="mb-8"
                    simplifiedChat={state.chatSession.simplifiedChat}
                    generatingResult={generatingResult}
                />
            )}
            <InputRow
                disabled={!state.model.loaded || !state.contextSequence.loaded}
                stopGeneration={generatingResult ? stopActivePrompt : undefined}
                onPromptInput={onPromptInput}
                sendPrompt={sendPrompt}
                generatingResult={generatingResult}
                autocompleteInputDraft={state.chatSession.draftPrompt.prompt}
                autocompleteCompletion={
                    state.chatSession.draftPrompt.completion
                }
            />
        </div>
    );
}
