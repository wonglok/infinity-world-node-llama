import { useCallback, useMemo, useRef, useState } from "react";
import { AddMessageIconSVG } from "../../../icons/AddMessageIconSVG.tsx";
import { AbortIconSVG } from "../../../icons/AbortIconSVG.tsx";
import { FixedDivWithSpacer } from "../FixedDivWithSpacer/FixedDivWithSpacer.tsx";

export function InputRow({
    disabled = false,
    stopGeneration,
    sendPrompt,
    onPromptInput,
    autocompleteInputDraft,
    autocompleteCompletion,
    generatingResult,
}: InputRowProps) {
    const [inputText, setInputText] = useState<string>("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const autocompleteCurrentTextRef = useRef<HTMLDivElement>(null);

    const autocompleteText = useMemo(() => {
        const fullText =
            (autocompleteInputDraft ?? "") + (autocompleteCompletion ?? "");
        if (fullText.startsWith(inputText))
            return fullText.slice(inputText.length);

        return "";
    }, [inputText, autocompleteInputDraft, autocompleteCompletion]);

    const setInputValue = useCallback((value: string) => {
        if (inputRef.current != null) inputRef.current.value = value;
        if (autocompleteCurrentTextRef.current != null)
            autocompleteCurrentTextRef.current.innerText = value;
        setInputText(value);
    }, []);

    const resizeInput = useCallback(() => {
        if (inputRef.current == null) return;
        inputRef.current.style.height = "";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
        if (autocompleteRef.current != null) {
            autocompleteRef.current.scrollTop = inputRef.current.scrollTop;
        }
    }, []);

    const submitPrompt = useCallback(() => {
        if (generatingResult || inputRef.current == null) return;
        const message = inputRef.current.value;
        if (message.length === 0) return;
        setInputValue("");
        resizeInput();
        onPromptInput?.("");
        sendPrompt(message);
    }, [
        setInputValue,
        generatingResult,
        resizeInput,
        sendPrompt,
        onPromptInput,
    ]);

    const onInput = useCallback(() => {
        setInputText(inputRef.current?.value ?? "");
        resizeInput();
        if (
            autocompleteCurrentTextRef.current != null &&
            inputRef.current != null
        )
            autocompleteCurrentTextRef.current.innerText =
                inputRef.current?.value;
        if (inputRef.current != null && onPromptInput != null)
            onPromptInput(inputRef.current?.value);
    }, [resizeInput, onPromptInput]);

    const onInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
            } else if (
                event.key === "Tab" &&
                !event.shiftKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                event.preventDefault();
                if (inputRef.current != null && autocompleteText !== "") {
                    const newlineIndex = autocompleteText.indexOf("\n");
                    const textToAccept =
                        newlineIndex <= 0
                            ? autocompleteText
                            : autocompleteText.slice(0, newlineIndex);
                    setInputValue(inputRef.current.value + textToAccept);
                    inputRef.current.scrollTop = inputRef.current.scrollHeight;
                    onPromptInput?.(inputRef.current.value);
                }
                resizeInput();
            }
        },
        [
            submitPrompt,
            setInputValue,
            onPromptInput,
            resizeInput,
            autocompleteText,
        ],
    );

    const previewAutocompleteText = useMemo(() => {
        const lines = autocompleteText.split("\n");
        if (lines.length <= 1 || lines[1]!.trim() === "") return lines[0]!;
        return autocompleteText;
    }, [autocompleteText]);

    return (
        <>
            <style>{`
                .input-row .input-area {
                    min-height: var(--min-height);
                    --min-height: 55px;
                }
                .input-row textarea {
                    padding: calc((var(--min-height) - 1lh) / 2) 24px;
                }
                .input-row .autocomplete-content {
                    padding: calc((var(--min-height) - 1lh) / 2) 24px;
                }
            `}</style>

            <div className="fixed bottom-4 left-0 w-full flex justify-center">
                <div
                    className={` input-row flex flex-row shrink-0 items-end w-[calc(100%-32px)] max-w-(--app-max-width) bg-(--panel-background-color) rounded-[1.25rem] shadow-(--panel-box-shadow) overflow-clip text-(--panel-text-color) border-2 border-[rgba(200,170,120,0.2)] ${disabled ? "opacity-[0.48]" : ""}`}
                >
                    <div className="flex-1 flex flex-row overflow-hidden relative isolate max-h-[400px] input-area">
                        <textarea
                            ref={inputRef}
                            onInput={onInput}
                            onKeyDownCapture={onInputKeyDown}
                            className="flex-1 border-none resize-none box-border max-h-[160px] outline-none bg-transparent font-[inherit] self-stretch text-(--panel-text-color) z-[2] [unicode-bidi:plaintext] overflow-auto placeholder:text-(--panel-text-color) placeholder:opacity-40"
                            autoComplete="off"
                            spellCheck
                            disabled={disabled}
                            onScroll={resizeInput}
                            placeholder={
                                autocompleteText === ""
                                    ? "Type a message..."
                                    : ""
                            }
                        />
                        <div
                            className="absolute inset-0 z-[1] flex overflow-hidden pointer-events-none select-none"
                            ref={autocompleteRef}
                        >
                            <div
                                className={`autocomplete-content flex-1 shrink-0 font-[inherit] text-start [unicode-bidi:plaintext] overflow-hidden ${autocompleteText === "" ? "opacity-0" : "opacity-[0.36]"}`}
                                style={{
                                    mask: "linear-gradient(to top, rgb(0 0 0 / 16%), black 24px)",
                                }}
                            >
                                <div
                                    className="opacity-0 inline whitespace-pre-wrap break-words [unicode-bidi:normal]"
                                    ref={autocompleteCurrentTextRef}
                                />
                                <div className="inline whitespace-pre-wrap break-words [unicode-bidi:normal]">
                                    {previewAutocompleteText}
                                </div>
                                <div className="inline-block -my-px mx-2 opacity-80 border border-[color-mix(in_srgb,currentColor,transparent_64%)] border-b-2 rounded-[10px] py-[0.1em] px-[0.4em] text-[0.8em] align-top">
                                    Tab
                                </div>
                            </div>
                        </div>
                    </div>
                    {generatingResult && stopGeneration != null && (
                        <button
                            className="shrink-0 flex flex-col items-center justify-center py-2 px-3 m-2 rounded-[10px] bg-(--panel-button-background-color) text-(--panel-text-color) fill-(--panel-text-color) transition-all duration-300 hover:scale-106 active:scale-94"
                            disabled={disabled}
                            onClick={stopGeneration}
                        >
                            <AbortIconSVG className="w-5 h-5" />
                        </button>
                    )}
                    {!generatingResult && (
                        <button
                            className="shrink-0 flex flex-col items-center justify-center py-2 px-3 m-2 ml-0 rounded-[10px] bg-(--panel-button-background-color) text-(--panel-text-color) fill-(--panel-text-color) transition-all duration-300 hover:scale-106 active:scale-94"
                            disabled={
                                disabled || inputText === "" || generatingResult
                            }
                            onClick={submitPrompt}
                        >
                            <AddMessageIconSVG className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

type InputRowProps = {
    disabled?: boolean;
    stopGeneration?(): void;
    sendPrompt(prompt: string): void;
    onPromptInput?(currentText: string): void;
    autocompleteInputDraft?: string;
    autocompleteCompletion?: string;
    generatingResult: boolean;
};
