'use server';

import { orchestrateLectureNotesGeneration, type OrchestratorInput } from '@/ai/flows/generate-lecture-notes';
import { processYoutubeVideo, type ProcessYoutubeVideoInput } from '@/ai/flows/process-youtube-video';
import { z } from 'zod';

const audioActionInputSchema = z.object({
  audioDataUri: z.string().startsWith('data:audio/', { message: "Invalid audio file format." }),
  detailLevel: z.enum(['basic', 'medium', 'detailed']),
});

const youtubeActionInputSchema = z.object({
    youtubeUrl: z.string().url({ message: "Invalid YouTube URL." }),
    detailLevel: z.enum(['basic', 'medium', 'detailed']),
});

export async function processAudio(formData: FormData) {
  try {
    const inputData = {
      audioDataUri: formData.get('audioDataUri') as string,
      detailLevel: formData.get('detailLevel') as 'basic' | 'medium' | 'detailed',
    };
    
    const validatedInput = audioActionInputSchema.safeParse(inputData);

    if (!validatedInput.success) {
      console.error('Invalid input:', validatedInput.error.format());
      return { error: validatedInput.error.flatten().fieldErrors.audioDataUri?.[0] || 'Invalid input.' };
    }

    const lectureNotesInput: OrchestratorInput = {
        audioDataUri: validatedInput.data.audioDataUri,
        detailLevel: validatedInput.data.detailLevel,
    };

    const result = await orchestrateLectureNotesGeneration(lectureNotesInput);

    if (!result || !result.notes) {
      return { error: 'Failed to generate notes. The AI returned an empty result.' };
    }

    return { notes: result.notes };

  } catch (e) {
    console.error('Error processing audio:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during processing.';
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }
}

export async function processYoutubeUrl(formData: FormData) {
  try {
    const inputData = {
      youtubeUrl: formData.get('youtubeUrl') as string,
      detailLevel: formData.get('detailLevel') as 'basic' | 'medium' | 'detailed',
    };
    
    const validatedInput = youtubeActionInputSchema.safeParse(inputData);

    if (!validatedInput.success) {
      console.error('Invalid input:', validatedInput.error.format());
      return { error: validatedInput.error.flatten().fieldErrors.youtubeUrl?.[0] || 'Invalid input.' };
    }

    const youtubeVideoInput: ProcessYoutubeVideoInput = {
        videoUrl: validatedInput.data.youtubeUrl,
        detailLevel: validatedInput.data.detailLevel,
    };

    const result = await processYoutubeVideo(youtubeVideoInput);

    if (!result || !result.notes) {
      return { error: 'Failed to generate notes. The AI returned an empty result.' };
    }

    return { notes: result.notes };

  } catch (e) {
    console.error('Error processing YouTube URL:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during processing.';
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }
}
