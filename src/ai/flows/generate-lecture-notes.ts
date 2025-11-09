'use server';

/**
 * @fileOverview A lecture notes generation AI agent.
 *
 * - generateLectureNotes - A function that handles the lecture notes generation process.
 * - orchestrateLectureNotesGeneration - A function that orchestrates the entire notes generation process from an audio file.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {cleanAudioAndTranscribe} from './clean-audio-and-transcribe';
import {
  extractLectureTopics,
} from './extract-lecture-topics';

const TopicSchema = z.object({
  topic: z.string(),
  timestamp: z.string(),
});

const GenerateLectureNotesInputSchema = z.object({
  transcription: z.string().describe('The transcription of the lecture.'),
  topics: z
    .array(TopicSchema)
    .describe('The main topics of the lecture with timestamps.'),
  detailLevel: z
    .enum(['basic', 'medium', 'detailed'])
    .describe(
      'The desired level of detail for the notes. Can be "basic", "medium", or "detailed".'
    ),
});
export type GenerateLectureNotesInput = z.infer<
  typeof GenerateLectureNotesInputSchema
>;

const GenerateLectureNotesOutputSchema = z.object({
  notes: z.string().describe('The summarized lecture notes in markdown format.'),
});
export type GenerateLectureNotesOutput = z.infer<
  typeof GenerateLectureNotesOutputSchema
>;

export async function generateLectureNotes(
  input: GenerateLectureNotesInput
): Promise<GenerateLectureNotesOutput> {
  return generateLectureNotesFlow(input);
}

const generateLectureNotesPrompt = ai.definePrompt({
  name: 'generateLectureNotesPrompt',
  input: {schema: GenerateLectureNotesInputSchema},
  output: {schema: GenerateLectureNotesOutputSchema},
  prompt: `You are a world-class AI note-taker, renowned for creating structured, detailed, and aesthetically pleasing study materials. Your output should be refined and easy to read.

A student has provided a lecture transcription and a list of key topics with timestamps. Your task is to generate comprehensive notes **in English**.

**Formatting and Quality Guidelines (Follow Strictly):**
- **Structure:** The notes must be exceptionally well-organized with a clear visual hierarchy. Use ample spacing (newlines) between headings, paragraphs, and lists to ensure the document is clean and readable.
- **Headings:**
    - Use a markdown heading for each topic (e.g., '# Topic Name (MM:SS)'). The heading itself must be **bold**.
    - Use sub-headings (e.g., '## Key Concepts', '### Sub-Concept') for structure within a topic. These should also be **bold**.
- **Key Terms:** For important terms and concepts that are not headings, make them **bold** (e.g., "**Artificial Intelligence** is a broad field...").
- **Lists:** Use standard bullet points ('-') for lists of information, steps, or examples. Ensure there is a newline before and after the list.
- **Examples:** You **must** include clear and relevant examples to illustrate complex concepts, especially for 'medium' and 'detailed' levels. This is a critical requirement.
- **Clarity and Length:** Write in a clear, explanatory style suitable for a university student. The notes should be thorough and expand significantly on the provided topics.

**Task:**
Generate the notes based on the topics provided. Use the transcription for context, but expand on the topics with your own knowledge to create a complete and refined set of study notes. If a topic is not in English, translate its title first.

**Topics and Timestamps:**
{{#each topics}}
- Topic: {{{this.topic}}}, Timestamp: ({{{this.timestamp}}})
{{/each}}

**Lecture Transcription for Context:**
{{{transcription}}}
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

export async function orchestrateLectureNotesGeneration(
  input: OrchestratorInput
) {
  return orchestratorFlow(input);
}

const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: GenerateLectureNotesOutputSchema,
  },
  async input => {
    // Step 1: Clean and Transcribe Audio
    const transcriptionResult = await cleanAudioAndTranscribe({
      audioDataUri: input.audioDataUri,
    });
    if (!transcriptionResult.transcription) {
      throw new Error('Failed to transcribe audio.');
    }
    const {transcription} = transcriptionResult;

    // Step 2: Extract Topics from Transcription
    const topicsResult = await extractLectureTopics({transcription});
    if (!topicsResult.topics || topicsResult.topics.length === 0) {
      throw new Error('Failed to extract topics from transcription.');
    }
    const {topics} = topicsResult;

    // Step 3: Generate Notes from Topics and Transcription
    const notesResult = await generateLectureNotes({
      transcription,
      topics,
      detailLevel: input.detailLevel,
    });

    return notesResult;
  }
);
