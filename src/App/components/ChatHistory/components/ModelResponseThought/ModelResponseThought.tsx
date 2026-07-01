import { useCallback, useMemo, useState } from "react";
import prettyMilliseconds from "pretty-ms";
import { MessageMarkdown } from "../../../MessageMarkdown/MessageMarkdown.js";
import { RightChevronIconSVG } from "../../../../../icons/RightChevronIconSVG.js";
import { MarkdownContent } from "../../../MarkdownContent/MarkdownContent.js";

const excerptLength = 1024;

export function ModelResponseThought({
    text,
    active,
    duration,
}: ModelResponseThoughtProps) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = useCallback(() => setIsOpen((v) => !v), []);

    const title = useMemo(() => {
        if (active) return "Thinking";
        if (duration != null) {
            const formattedDuration = prettyMilliseconds(duration, {
                secondsDecimalDigits: duration < 1000 * 10 ? 2 : 0,
                verbose: true,
            });
            return `Thought for ${formattedDuration}`;
        }
        return "Finished thinking";
    }, [active, duration]);

    return (
        <>
            <style>{`
                @keyframes thinking-animation {
                    0% { mask-position: 100% 100%; }
                    100% { mask-position: 0 100%; }
                }
                .rt-excerpt {
                    interpolate-size: allow-keywords;
                    max-width: calc-size(fit-content, min(360px, size + 8px));
                }
                .rt-content {
                    interpolate-size: allow-keywords;
                }
            `}</style>
            <div
                className={`px-2 transition-[margin-bottom] duration-300 ease-(--transition-easing) opacity-80 ${active ? "mb-2" : ""}`}
            >
                <button
                    className="border-none bg-transparent flex flex-col p-0 select-none outline-2 outline-transparent outline-offset-4 rounded-sm self-start max-w-full focus-visible:outline-[Highlight] cursor-pointer"
                    onClick={toggleIsOpen}
                >
                    <span
                        className={`flex flex-row items-center transition-opacity duration-300 ease-(--transition-easing) ${active ? "opacity-100" : "opacity-[0.64] hover:opacity-100"}`}
                    >
                        <span
                            className={active ? "opacity-60 font-bold" : ""}
                            style={{
                                transition:
                                    "font-weight 0.3s var(--transition-easing), opacity 0.3s var(--transition-easing), margin-bottom 0.3s var(--transition-easing)",
                                ...(active
                                    ? {
                                          mask: "linear-gradient(to right, rgb(0 0 0 / 48%) 34%, black, rgb(0 0 0 / 48%) 66%) content-box 0 0 / 300% 100% no-repeat",
                                          animation:
                                              "thinking-animation 2s infinite ease-in-out",
                                      }
                                    : {}),
                            }}
                        >
                            {title}
                        </span>
                        <RightChevronIconSVG
                            className={`shrink-0 w-5 h-5 -m-1 ms-0 origin-[56%_56%] transition-[transform,opacity] duration-200 ease-(--transition-easing) ${isOpen ? "rotate-90" : ""} ${active ? "opacity-[0.48]" : "opacity-[0.64]"}`}
                        />
                    </span>
                    <div
                        className={`rt-excerpt whitespace-nowrap overflow-hidden flex justify-end justify-self-start text-sm mt-0.5 select-none pe-6 ${isOpen ? "h-0 opacity-0" : "opacity-[0.24]"}`}
                        style={{
                            mask: "linear-gradient(to right, transparent, black 48px)",
                            transition: isOpen
                                ? "height 0.5s var(--transition-easing), opacity 0.3s 0s var(--transition-easing)"
                                : "height 0.5s var(--transition-easing), opacity 0.3s 0.2s var(--transition-easing)",
                        }}
                    >
                        <MarkdownContent dir="auto" inline>
                            {text.slice(-excerptLength)}
                        </MarkdownContent>
                    </div>
                </button>
                <div
                    className={`rt-content mt-4 pl-6 justify-self-start relative overflow-clip ${!isOpen ? "h-0 mb-0 opacity-0" : "mb-6 opacity-[0.64]"}`}
                    style={{
                        transition: !isOpen
                            ? "height 0.5s var(--transition-easing), margin-bottom 0.5s var(--transition-easing), opacity 0.3s 0s var(--transition-easing)"
                            : "height 0.5s var(--transition-easing), margin-bottom 0.5s var(--transition-easing), opacity 0.3s 0.2s var(--transition-easing)",
                    }}
                >
                    <div
                        className="absolute left-0 top-0 w-1 h-full"
                        style={{
                            backgroundColor:
                                "var(--message-blockquote-border-color)",
                        }}
                    />
                    <MessageMarkdown activeDot={active}>{text}</MessageMarkdown>
                </div>
            </div>
        </>
    );
}

type ModelResponseThoughtProps = {
    text: string;
    active: boolean;
    duration?: number;
};
