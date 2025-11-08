'use server';

import { generateLectureNotes, type GenerateLectureNotesInput } from '@/ai/flows/generate-lecture-notes';
import { z } from 'zod';

const actionInputSchema = z.object({
  audioDataUri: z.string().startsWith('data:audio/', { message: "Invalid audio file format." }),
});

export async function processAudio(formData: FormData) {
  try {
    const inputData = {
      audioDataUri: formData.get('audioDataUri') as string,
    };
    
    const validatedInput = actionInputSchema.safeParse(inputData);

    if (!validatedInput.success) {
      console.error('Invalid input:', validatedInput.error.format());
      return { error: validatedInput.error.flatten().fieldErrors.audioDataUri?.[0] || 'Invalid audio data URI format.' };
    }

    const lectureNotesInput: GenerateLectureNotesInput = {
        audioDataUri: validatedInput.data.audioDataUri,
    };

    const result = await generateLectureNotes(lectureNotesInput);

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
