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

const TopicSchema = z.object({
    topic: z.string().describe('A main topic discussed in the lecture.'),
    timestamp: z.string().describe('The timestamp (MM:SS) where the topic is first mentioned.'),
});

const ExtractLectureTopicsOutputSchema = z.object({
  topics: z
    .array(TopicSchema)
    .describe('An array of main topics and their timestamps.'),
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
  prompt: `You are an expert in extracting the main topics and their corresponding start times from a lecture transcription.

  Please read the following transcription and identify the main topics discussed. For each topic, provide a timestamp in MM:SS format indicating when it is first mentioned.
  
  Your output should be a list of objects, where each object contains a "topic" and a "timestamp".

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
