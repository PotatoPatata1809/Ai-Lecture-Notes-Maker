'use client';

import { useState } from 'react';
import { processAudio, processYoutubeUrl } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Loader, FileAudio, Settings2, Youtube } from 'lucide-react';
import NotesDisplay from './notes-display';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';

type State = 'idle' | 'loading' | 'success' | 'error';
type DetailLevel = 'basic' | 'medium' | 'detailed';

const MAX_FILE_SIZE_MB = 25;

export default function LectureScribe() {
  const [state, setState] = useState<State>('idle');
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('medium');
  const [youtubeUrl, setYoutubeUrl] = useState('');
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
            formData.append('detailLevel', detailLevel);

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

  const handleYoutubeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!youtubeUrl) {
        toast({
            variant: "destructive",
            title: "Invalid URL",
            description: "Please enter a valid YouTube URL.",
        });
        return;
    }

    setState('loading');
    setGeneratedNotes('');
    setFileName(youtubeUrl);

    try {
        const formData = new FormData();
        formData.append('youtubeUrl', youtubeUrl);
        formData.append('detailLevel', detailLevel);

        const result = await processYoutubeUrl(formData);

        if (result.error) {
            throw new Error(result.error);
        }

        if (result.notes) {
            setGeneratedNotes(result.notes);
            setState('success');
        } else {
            throw new Error('No notes were generated.');
        }
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
      setYoutubeUrl('');
  }

  const renderContent = () => {
    switch (state) {
        case 'loading':
            return (
                <div className="text-center flex flex-col items-center gap-4 py-8">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium text-foreground">Brewing your notes...</p>
                    <p className="text-sm text-muted-foreground max-w-full truncate">{fileName}</p>
                </div>
            );
        case 'success':
            return <NotesDisplay notes={generatedNotes} fileName={fileName.replace(/\.[^/.]+$/, "")} onReset={handleReset} />;
        case 'error':
        case 'idle':
        default:
            return (
                <div className="w-full flex flex-col items-center justify-center text-center p-0 sm:p-6 transition-colors relative gap-6">
                    <Tabs defaultValue="audio" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="audio"><FileAudio className="mr-2 h-5 w-5" /> Audio File</TabsTrigger>
                            <TabsTrigger value="youtube"><Youtube className="mr-2 h-5 w-5" />YouTube</TabsTrigger>
                        </TabsList>
                        <TabsContent value="audio" className="pt-6">
                            <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/80 hover:bg-primary/5 transition-colors w-full">
                                <div className='absolute -top-4 -left-4 bg-background p-2 rounded-full border'>
                                    <FileAudio className="h-8 w-8 text-primary" />
                                </div>
                                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">Click to upload or drag and drop</h3>
                                <p className="text-sm text-muted-foreground mt-1">MP3, WAV, M4A (Max {MAX_FILE_SIZE_MB}MB)</p>
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
                        </TabsContent>
                        <TabsContent value="youtube" className="pt-6">
                           <form onSubmit={handleYoutubeSubmit} className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg w-full gap-4">
                                <div className='absolute -top-4 -left-4 bg-background p-2 rounded-full border'>
                                    <Youtube className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Paste YouTube Video URL</h3>
                                <Input
                                    id="youtube-url"
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    disabled={state === 'loading'}
                                    aria-label="YouTube video URL"
                                />
                                <Button type="submit" disabled={state === 'loading' || !youtubeUrl}>
                                    Generate from URL
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    <div className="w-full p-6 border rounded-lg relative bg-background/50">
                        <div className='absolute -top-4 -left-4 bg-background p-2 rounded-full border'>
                            <Settings2 className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-md font-semibold text-foreground mb-3 text-left">Note Detail Level</h4>
                        <RadioGroup defaultValue="medium" className="flex flex-col sm:flex-row gap-4 sm:gap-8" onValueChange={(value: DetailLevel) => setDetailLevel(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="basic" id="r1" />
                                <Label htmlFor="r1">Basic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="r2" />
                                <Label htmlFor="r2">Medium</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="detailed" id="r3" />
                                <Label htmlFor="r3">Detailed</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            );
    }
  }

  return (
    <Card className="w-full max-w-3xl shadow-lg animate-fade-in border-border/40 bg-card/80 backdrop-blur-sm">
      {state !== 'success' && (
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Upload Your Lecture</CardTitle>
          <CardDescription className="text-center">Let AI transform your lecture into structured, easy-to-read notes.</CardDescription>
        </CardHeader>
      )}
      <CardContent className="min-h-[200px] flex items-center justify-center p-2 sm:p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
