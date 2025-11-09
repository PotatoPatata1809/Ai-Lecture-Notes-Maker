'use server';

/**
 * @fileOverview A lecture notes generation AI agent.
 *
 * - generateLectureNotes - A function that handles the lecture notes generation process.
 * - GenerateLectureNotesInput - The input type for the generateLectureNotes function.
 * - GenerateLectureNotesOutput - The return type for the generateLectureNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLectureNotesInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'A lecture audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  detailLevel: z
    .enum(['basic', 'medium', 'detailed'])
    .describe(
      'The desired level of detail for the notes. Can be "basic", "medium", or "detailed".'
    ),
});
export type GenerateLectureNotesInput = z.infer<typeof GenerateLectureNotesInputSchema>;

const GenerateLectureNotesOutputSchema = z.object({
  notes: z.string().describe('The summarized lecture notes in markdown format.'),
});
export type GenerateLectureNotesOutput = z.infer<typeof GenerateLectureNotesOutputSchema>;

export async function generateLectureNotes(input: GenerateLectureNotesInput): Promise<GenerateLectureNotesOutput> {
  return generateLectureNotesFlow(input);
}

const generateLectureNotesPrompt = ai.definePrompt({
  name: 'generateLectureNotesPrompt',
  input: {schema: GenerateLectureNotesInputSchema},
  output: {schema: GenerateLectureNotesOutputSchema},
  prompt: `You are an expert note-taker, skilled at summarizing lectures into concise and informative notes.

  Analyze the following lecture transcription and identify the main topics, key points, and any important formulas or examples.
  Create a well-structured summary in markdown format, including headings for each topic, bullet points for key points, and any relevant formulas or examples.
  Include timestamps where possible, to help the student find that point in the lecture.

  The user has requested a '{{{detailLevel}}}' level of detail for the notes. Please adjust the length and depth of the summary accordingly:
  - 'basic': A brief overview of the main topics.
  - 'medium': A standard summary with key points for each topic.
  - 'detailed': A comprehensive summary including in-depth explanations, examples, and formulas.

  Lecture Transcription: {{media url=audioDataUri}}`,
});

const generateLectureNotesFlow = ai.defineFlow(
  {
    name: 'generateLectureNotesFlow',
    inputSchema: GenerateLectureNotesInputSchema,
    outputSchema: GenerateLectureNotesOutputSchema,
  },
  async input => {
    const {output} = await generateLectureNotesPrompt(input);
    return output!;
  }
);
