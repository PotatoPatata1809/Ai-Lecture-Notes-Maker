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
import {cleanAudioAndTranscribe} from './clean-audio-and-transcribe';
import {extractLectureTopics} from './extract-lecture-topics';

const GenerateLectureNotesInputSchema = z.object({
  transcription: z.string().describe('The transcription of the lecture.'),
  topics: z.array(z.string()).describe('The main topics of the lecture.'),
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

export async function generateLectureNotes(
  input: GenerateLectureNotesInput
): Promise<GenerateLectureNotesOutput> {
  return generateLectureNotesFlow(input);
}

const generateLectureNotesPrompt = ai.definePrompt({
  name: 'generateLectureNotesPrompt',
  input: {schema: GenerateLectureNotesInputSchema},
  output: {schema: GenerateLectureNotesOutputSchema},
  prompt: `You are an expert note-taker, skilled at summarizing and explaining complex topics.

  A student has provided a lecture transcription and a list of key topics from that lecture. Your task is to generate comprehensive notes about these topics.

  The user has requested a '{{{detailLevel}}}' level of detail. Please adjust the length and depth of the summary accordingly:
  - 'basic': A brief overview of the main topics.
  - 'medium': A standard summary with key points for each topic. Explain the concepts.
  - 'detailed': A comprehensive summary including in-depth explanations, examples, and any relevant formulas for each topic.

  Use the provided transcription to understand the context of the lecture, but generate the notes based on your knowledge of the topics provided. Include timestamps in your notes by referencing the original transcription.

  Topics:
  {{#each topics}}
  - {{{this}}}
  {{/each}}

  Lecture Transcription: {{{transcription}}}
  `,
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

const OrchestratorInputSchema = z.object({
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

export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

export async function orchestrateLectureNotesGeneration(input: OrchestratorInput) {
    return orchestratorFlow(input);
}

const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: GenerateLectureNotesOutputSchema,
  },
  async (input) => {
    // Step 1: Clean and Transcribe Audio
    const transcriptionResult = await cleanAudioAndTranscribe({ audioDataUri: input.audioDataUri });
    if (!transcriptionResult.transcription) {
        throw new Error("Failed to transcribe audio.");
    }
    const { transcription } = transcriptionResult;

    // Step 2: Extract Topics from Transcription
    const topicsResult = await extractLectureTopics({ transcription });
     if (!topicsResult.topics || topicsResult.topics.length === 0) {
        throw new Error("Failed to extract topics from transcription.");
    }
    const { topics } = topicsResult;

    // Step 3: Generate Notes from Topics and Transcription
    const notesResult = await generateLectureNotes({
        transcription,
        topics,
        detailLevel: input.detailLevel,
    });
    
    return notesResult;
  }
);
