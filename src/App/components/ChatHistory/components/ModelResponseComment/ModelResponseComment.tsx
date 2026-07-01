import { useCallback, useMemo, useState } from "react";
import { MessageMarkdown } from "../../../MessageMarkdown/MessageMarkdown.js";
import { RightChevronIconSVG } from "../../../../../icons/RightChevronIconSVG.js";
import { MarkdownContent } from "../../../MarkdownContent/MarkdownContent.js";

const excerptLength = 1024;

export function ModelResponseComment({
    text,
    active,
}: ModelResponseCommentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = useCallback(() => setIsOpen((v) => !v), []);

    const title = useMemo(() => {
        if (active) return "Generating comment";
        return "Generated comment";
    }, [active]);

    return (
        <>
            <style>{`
                @keyframes generating-animation {
                    0% { mask-position: 100% 100%; }
                    100% { mask-position: 0 100%; }
                }
                .rc-excerpt {
                    interpolate-size: allow-keywords;
                    width: calc-size(fit-content, min(360px, size + 8px));
                }
                .rc-comment {
                    interpolate-size: allow-keywords;
                }
            `}</style>
            <div
                className={`py-1 px-4 relative mx-[-8px] my-1 rounded-xl transition-[margin-bottom,background-color] duration-300 ease-(--transition-easing) ${active ? "mb-2" : ""} ${isOpen ? "mb-5 bg-(--model-comment-block-background-color)" : ""}`}
            >
                <div className="flex flex-row">
                    <button
                        className="border-none bg-(--model-comment-block-button-background-color) flex flex-col py-2 px-3 ms-[-12px] rounded-xl select-none outline-2 outline-transparent outline-offset-4 self-start max-w-full opacity-[0.64] transition-opacity duration-300 hover:opacity-[0.82] focus-visible:outline-[Highlight] focus-visible:outline-offset-0"
                        onClick={toggleIsOpen}
                    >
                        <span className="flex flex-row items-center">
                            <span
                                className={`rc-title whitespace-nowrap ${active ? "opacity-60 font-bold" : ""}`}
                                style={{
                                    transition:
                                        "font-weight 0.3s var(--transition-easing), opacity 0.3s var(--transition-easing), margin-bottom 0.3s var(--transition-easing)",
                                    ...(active
                                        ? {
                                              mask: "linear-gradient(to right, rgb(0 0 0 / 48%) 34%, black, rgb(0 0 0 / 48%) 66%) content-box 0 0 / 300% 100% no-repeat",
                                              animation:
                                                  "generating-animation 2s infinite ease-in-out",
                                          }
                                        : {
                                              mask: "linear-gradient(to right, rgb(0 0 0 / 100%) 34%, black, rgb(0 0 0 / 100%) 66%) content-box 0 0 / 300% 100% no-repeat",
                                              animation:
                                                  "generating-animation 2s infinite ease-in-out",
                                              animationPlayState: "paused",
                                          }),
                                }}
                            >
                                {title}
                            </span>
                            <RightChevronIconSVG
                                className={`shrink-0 w-5 h-5 -m-1 ms-0 -me-1.5 opacity-[0.64] origin-[56%_56%] transition-[transform,margin-inline-end,opacity] duration-200 ease-(--transition-easing) ${isOpen ? "rotate-90 -me-0.5" : ""} ${active ? "opacity-[0.48]" : ""}`}
                            />
                        </span>
                        <MarkdownContent
                            className={`rc-excerpt whitespace-nowrap overflow-hidden flex justify-end self-center opacity-[0.24] ms-1 select-none transition-[margin-inline-start,width,opacity] duration-300 ease-(--transition-easing) ${isOpen ? "opacity-0 ms-0 [transition-delay:0s,0s]" : "[transition-delay:0s,0s,0.2s]"}`}
                            dir="auto"
                            inline
                        >
                            {text.slice(-excerptLength)}
                        </MarkdownContent>
                    </button>
                </div>
                <div
                    className={`rc-comment mt-4 pb-3 flex flex-col transition-[height,margin-top,padding-bottom,margin-bottom,opacity] duration-500 ease-(--transition-easing) ${!isOpen ? "mt-8 h-0 -mb-3 pb-0 opacity-0 [transition-delay:0s,0s,0s,0s]" : "[transition-delay:0s,0s,0s,0.2s]"}`}
                >
                    <MessageMarkdown
                        className="opacity-[0.64] justify-self-start relative overflow-hidden max-h-full"
                        activeDot={active}
                    >
                        {text}
                    </MessageMarkdown>
                </div>
            </div>
        </>
    );
}

type ModelResponseCommentProps = {
    text: string;
    active: boolean;
};
