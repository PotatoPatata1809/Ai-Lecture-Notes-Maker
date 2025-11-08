'use client';

import { useState } from 'react';
import { processAudio } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Loader } from 'lucide-react';
import NotesDisplay from './notes-display';

type State = 'idle' | 'loading' | 'success' | 'error';

const MAX_FILE_SIZE_MB = 25;

export default function LectureScribe() {
  const [state, setState] = useState<State>('idle');
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
            variant: "destructive",
            title: "File too large",
            description: `Please upload an audio file smaller than ${MAX_FILE_SIZE_MB}MB.`,
        });
        event.target.value = ''; // Reset file input
        return;
    }

    setFileName(file.name);
    setState('loading');
    setGeneratedNotes('');

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const formData = new FormData();
            formData.append('audioDataUri', base64data);

            const result = await processAudio(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.notes) {
                setGeneratedNotes(result.notes);
                setState('success');
            } else {
                throw new Error('No notes were generated.');
            }
        };
        reader.onerror = () => {
            throw new Error('Failed to read the file.');
        };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Oh no! Something went wrong.",
            description: errorMessage,
        });
        setState('error');
    }
  };

  const handleReset = () => {
      setState('idle');
      setGeneratedNotes('');
      setFileName('');
  }

  const renderContent = () => {
    switch (state) {
        case 'loading':
            return (
                <div className="text-center flex flex-col items-center gap-4 py-8">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium text-foreground">Processing your lecture...</p>
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
            );
        case 'success':
            return <NotesDisplay notes={generatedNotes} fileName={fileName.replace(/\.[^/.]+$/, "")} onReset={handleReset} />;
        case 'error':
        case 'idle':
        default:
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/10 transition-colors relative">
                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Click to upload or drag and drop</h3>
                    <p className="text-sm text-muted-foreground mt-1">Supported formats: MP3, WAV, M4A (Max {MAX_FILE_SIZE_MB}MB)</p>
                    <Input
                        id="audio-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="audio/mpeg, audio/wav, audio/x-m4a, audio/mp4"
                        onChange={handleFileChange}
                        disabled={state === 'loading'}
                        aria-label="Upload audio file"
                    />
                </div>
            );
    }
  }

  return (
    <Card className="w-full max-w-3xl shadow-lg animate-fade-in border-border/80">
      {state !== 'success' && (
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Upload Your Lecture Audio</CardTitle>
          <CardDescription>Let AI transform your audio into structured, easy-to-read notes.</CardDescription>
        </CardHeader>
      )}
      <CardContent className="min-h-[200px] flex items-center justify-center p-4 sm:p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
