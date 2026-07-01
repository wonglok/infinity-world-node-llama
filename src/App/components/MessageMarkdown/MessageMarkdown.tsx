import { useMemo } from "react";
import { MarkdownContent } from "../MarkdownContent/MarkdownContent.js";

export function MessageMarkdown({
    children,
    activeDot = false,
    className,
}: MessageMarkdownProps) {
    const renderContent = useMemo(() => {
        if (children == null) return "";
        if (!activeDot) return children;

        const lines = children.split("\n");
        const lastLine = lines.at(-1);

        if (
            lastLine != null &&
            ["-", "+", "*", "1.", "1", "--"].includes(lastLine.trim())
        )
            return lines.slice(0, -1).join("\n");
        else if (
            lastLine != null &&
            lastLine.trim().length === 1 &&
            (lastLine.endsWith(" *") ||
                lastLine.endsWith(" _") ||
                lastLine.endsWith(" ~"))
        )
            return [
                ...lines.slice(0, -1),
                lastLine.slice(0, -" _".length),
            ].join("\n");

        return children;
    }, [children, activeDot]);

    return (
        <>
            <style>{`
                .md.active:empty:after,
                .md.active:not(:empty) > :last-child:not(ol, ul, table):after,
                .md.active:not(:empty) > :last-child:where(ol, ul) > :last-child:not(:has(> :last-child:where(ol, ul))):after,
                .md.active:not(:empty) > :last-child:where(ol, ul) > :last-child > :last-child:where(ol, ul) > :last-child:after,
                .md.active:not(:empty) > :last-child:where(table) > :last-child > :last-child > :last-child:after {
                    content: "";
                    position: static;
                    display: inline-block;
                    background-color: currentColor;
                    width: 8px;
                    height: 8px;
                    translate: 0px -2px;
                    border-radius: 10px;
                    margin-inline-start: 8px;
                    vertical-align: middle;
                    animation: messageMarkdownActiveDot 2s infinite ease-in-out;
                }
                .md blockquote:before {
                    content: "";
                    position: absolute;
                    width: 4px;
                    height: 100%;
                    background-color: var(--message-blockquote-border-color);
                    inset-inline-start: 0px;
                }
                .md table {
                    border-style: hidden;
                    border-radius: 12px;
                    outline: solid 1px var(--message-table-outline-color);
                    outline-offset: -1px;
                    max-width: max-content;
                    border-collapse: collapse;
                    overflow-x: auto;
                    background-color: var(--background-color);
                }
                .md table thead { text-align: justify; }
                .md table tr {
                    background-color: var(--message-table-background-color);
                    border-top: 1px solid var(--message-table-outline-color);
                }
                .md table tr:nth-child(2n) td {
                    background-color: var(--message-table-even-background-color);
                }
                .md table tr th {
                    background-color: var(--message-table-even-background-color);
                    border: 1px solid var(--message-table-outline-color);
                    padding: 8px 16px;
                }
                .md table tr td {
                    border: 1px solid var(--message-table-outline-color);
                    padding: 8px 16px;
                }
                @keyframes messageMarkdownActiveDot {
                    0% { transform: scale(1); opacity: 0.64; }
                    50% { transform: scale(1.4); opacity: 0.32; }
                    100% { transform: scale(1); opacity: 0.64; }
                }
            `}</style>

            <MarkdownContent
                className={`inline-block md leading-9 tracking-tight  ${activeDot ? "active" : ""} ${className ?? ""}`}
            >
                {renderContent}
            </MarkdownContent>
        </>
    );
}

type MessageMarkdownProps = {
    children?: string;
    activeDot?: boolean;
    className?: string;
};
