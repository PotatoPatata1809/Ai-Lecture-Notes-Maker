'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RefreshCw } from "lucide-react";
import { Separator } from "./ui/separator";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from "react";

interface NotesDisplayProps {
    notes: string;
    fileName: string;
    onReset: () => void;
}

const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
    const createMarkup = (htmlContent: string) => {
        // A more robust markdown to html conversion
        let renderedHtml = htmlContent
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .split('\n').map(line => {
                if (line.startsWith('<li>')) {
                    return line;
                }
                if (line.match(/^<h[1-3]>/)) {
                    return line;
                }
                if (line.trim() === '') return '<br />';
                return `<p>${line}</p>`;
            }).join('');
        
        // Wrap adjacent li elements in ul
        renderedHtml = renderedHtml.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        return { __html: renderedHtml };
    };

    return <div className="prose prose-sm dark:prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={createMarkup(content)} />;
};


export default function NotesDisplay({ notes, fileName, onReset }: NotesDisplayProps) {
    const notesContentRef = useRef<HTMLDivElement>(null);

    const downloadPdf = () => {
        const input = notesContentRef.current;
        if (!input) return;

        html2canvas(input, { 
            scale: 2,
            backgroundColor: '#0a0a23',
            useCORS: true 
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth - 20; // with margin
            const height = width / ratio;
            
            let position = 0;
            let heightLeft = (canvasHeight * (pdfWidth - 20)) / canvasWidth;

            pdf.addImage(imgData, 'PNG', 10, 10, width, height);
            heightLeft -= (pdfHeight - 20);

            while (heightLeft >= 0) {
                position = heightLeft - ((canvasHeight * (pdfWidth - 20)) / canvasWidth);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, -(position - 10), width, height);
                heightLeft -= (pdfHeight - 20);
            }
            pdf.save(`${fileName}-notes.pdf`);
        });
    };

    return (
        <div className="w-full flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Notes are Ready!</h2>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={downloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download (.pdf)
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                </div>
            </div>
            <Separator />
            <ScrollArea className="h-[60vh] w-full rounded-md border p-4 lg:p-6 bg-black/10">
                <style jsx>{`
                    .prose h1 { font-size: 1.8rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem;}
                    .prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                    .prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
                    .prose p { margin-bottom: 0.75rem; line-height: 1.7; }
                    .prose ul { margin-left: 1.25rem; margin-bottom: 1rem; }
                    .prose li { list-style-type: disc; margin-bottom: 0.5rem; }
                    .prose :global(strong) { font-weight: 600; color: hsl(var(--primary-foreground)); background-color: hsl(var(--primary)); padding: 0.1rem 0.3rem; border-radius: 0.25rem;}
                    .prose :global(em) { font-style: italic; }
                    .prose :global(code) { background-color: hsl(var(--muted)); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: var(--font-code); }
                `}</style>
                <div ref={notesContentRef} className="p-2">
                  <SimpleMarkdownRenderer content={notes} />
                </div>
            </ScrollArea>
        </div>
    );
}
