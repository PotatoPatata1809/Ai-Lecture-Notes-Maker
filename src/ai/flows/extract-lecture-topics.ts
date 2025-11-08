'use server';

/**
 * @fileOverview Extracts the main topics from a lecture transcription.
 *
 * - extractLectureTopics - A function that extracts lecture topics from a transcription.
 * - ExtractLectureTopicsInput - The input type for the extractLectureTopics function.
 * - ExtractLectureTopicsOutput - The return type for the extractLectureTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLectureTopicsInputSchema = z.object({
  transcription: z.string().describe('The transcription of the lecture.'),
});
export type ExtractLectureTopicsInput = z.infer<typeof ExtractLectureTopicsInputSchema>;

const ExtractLectureTopicsOutputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('The main topics discussed in the lecture.'),
});
export type ExtractLectureTopicsOutput = z.infer<typeof ExtractLectureTopicsOutputSchema>;

export async function extractLectureTopics(
  input: ExtractLectureTopicsInput
): Promise<ExtractLectureTopicsOutput> {
  return extractLectureTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLectureTopicsPrompt',
  input: {schema: ExtractLectureTopicsInputSchema},
  output: {schema: ExtractLectureTopicsOutputSchema},
  prompt: `You are an expert in extracting the main topics from a lecture transcription.

  Please read the following transcription and extract the main topics discussed.
  Return a list of strings.

  Transcription: {{{transcription}}}`,
});

const extractLectureTopicsFlow = ai.defineFlow(
  {
    name: 'extractLectureTopicsFlow',
    inputSchema: ExtractLectureTopicsInputSchema,
    outputSchema: ExtractLectureTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
