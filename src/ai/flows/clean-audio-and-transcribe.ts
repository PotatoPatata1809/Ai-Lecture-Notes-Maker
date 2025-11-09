// The cleanAudioAndTranscribe flow cleans audio and transcribes it.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CleanAudioAndTranscribeInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type CleanAudioAndTranscribeInput = z.infer<
  typeof CleanAudioAndTranscribeInputSchema
>;

const CleanAudioAndTranscribeOutputSchema = z.object({
  transcription: z.string().describe('The transcription of the cleaned audio.'),
});

export type CleanAudioAndTranscribeOutput = z.infer<
  typeof CleanAudioAndTranscribeOutputSchema
>;

export async function cleanAudioAndTranscribe(
  input: CleanAudioAndTranscribeInput
): Promise<CleanAudioAndTranscribeOutput> {
  return cleanAudioAndTranscribeFlow(input);
}

const cleanAudioAndTranscribePrompt = ai.definePrompt({
  name: 'cleanAudioAndTranscribePrompt',
  input: {schema: CleanAudioAndTranscribeInputSchema},
  output: {schema: CleanAudioAndTranscribeOutputSchema},
  prompt: `You are an AI assistant that transcribes audio. The user will provide an audio file.
  
  Your task is to:
  1. Detect the language being spoken in the audio.
  2. Transcribe the audio into text in its original language.
  
  Return only the transcription.

  Audio: {{media url=audioDataUri}}`,
});

const cleanAudioAndTranscribeFlow = ai.defineFlow(
  {
    name: 'cleanAudioAndTranscribeFlow',
    inputSchema: CleanAudioAndTranscribeInputSchema,
    outputSchema: CleanAudioAndTranscribeOutputSchema,
  },
  async input => {
    const llmResponse = await cleanAudioAndTranscribePrompt(input);
    return llmResponse.output!;
  }
);
