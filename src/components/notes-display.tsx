'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RefreshCw } from "lucide-react";
import { Separator } from "./ui/separator";

interface NotesDisplayProps {
    notes: string;
    fileName: string;
    onReset: () => void;
}

const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
    const createMarkup = (htmlContent: string) => {
        return { __html: htmlContent };
    };

    const renderedHtml = content
        .split('\n')
        .map(line => {
            if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
            if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
            if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
            if (line.startsWith('* ') || line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
            if (line.trim() === '') return `<br />`;
            return `<p>${line}</p>`;
        })
        .join('');

    return <div className="prose prose-sm dark:prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={createMarkup(renderedHtml)} />;
};


export default function NotesDisplay({ notes, fileName, onReset }: NotesDisplayProps) {

    const downloadMarkdown = () => {
        const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-notes.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Notes are Ready!</h2>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                        <Download className="mr-2 h-4 w-4" />
                        Download (.md)
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                </div>
            </div>
            <Separator />
            <ScrollArea className="h-[60vh] w-full rounded-md border p-4 lg:p-6 bg-white/50 dark:bg-black/10">
                <style jsx>{`
                    .prose h1 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose p { margin-bottom: 0.5rem; line-height: 1.6; }
                    .prose li { margin-left: 1.25rem; list-style-type: disc; margin-bottom: 0.25rem; }
                    .prose :global(strong) { font-weight: 600; }
                `}</style>
                <SimpleMarkdownRenderer content={notes} />
            </ScrollArea>
        </div>
    );
}
