import { useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { llmState } from "../state/llmState.ts";
import { electronLlmRpc } from "../rpc/llmRpc.ts";
import { useExternalState } from "../hooks/useExternalState.ts";
// import { Header } from "./components/Header/Header.tsx";
import { ChatHistory } from "./components/ChatHistory/ChatHistory.tsx";
import { InputRow } from "./components/InputRow/InputRow.tsx";

import "./App.css";

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
        <div id="AppArea" className="app p-5">
            <button
                className="flex items-center space-x-3"
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
            {/* <div className=" flex justify-end">
                <Header
                    appVersion={state.appVersion}
                    canShowCurrentVersion={state.selectedModelFilePath == null}
                    modelName={state.model.name}
                    loadPercentage={state.model.loadProgress}
                    onLoadClick={openSelectModelFileDialog}
                    onResetChatClick={
                        !showMessage ? resetChatHistory : undefined
                    }
                />
            </div> */}

            {showMessage && (
                <div className="message">
                    {error != null && (
                        <div className="error">{String(error)}</div>
                    )}
                    {loading && (
                        <div className="loading">
                            <div className="loading-spinner" />
                            Loading AI...
                        </div>
                    )}
                    {(state.selectedModelFilePath == null ||
                        state.llama.error != null) && (
                        <div className="loadModel">
                            <div className="hint">
                                No model loaded. Go to setup to choose and
                                download a model.
                            </div>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--button-hover-border-color)] bg-[var(--button-background-color)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--link-color)]"
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
                            <div className="typeMessage">
                                Type a message to start the conversation
                            </div>
                        )}
                </div>
            )}
            {!showMessage && (
                <ChatHistory
                    className="chatHistory"
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
