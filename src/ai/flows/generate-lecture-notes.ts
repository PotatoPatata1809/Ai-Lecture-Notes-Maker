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
  prompt: `You are a world-class AI scholar tasked with creating a PhD-level dissertation-quality study guide from a lecture. Your output must be exceptionally detailed, lengthy, and refined, aiming for what would be equivalent to 5-10 pages of written text.

A student has provided a lecture transcription and a list of key topics. Your task is to generate exhaustive and comprehensive notes **in English**.

**Content and Length Requirements (CRITICAL):**
- **Extreme Depth:** For each topic, you must perform a deep dive. Do not just summarize. You must elaborate, provide historical context, explain underlying principles, and explore related concepts.
- **Multi-Page Goal:** Your final output must be extremely lengthy and thorough. For a typical university lecture, the notes for each main topic should be several paragraphs long, often spanning multiple sub-sections.
- **Elaborate on Everything:** Use the transcription as a starting point, but your primary job is to expand upon it with your vast knowledge. Assume the student needs a complete understanding, so explain everything from the ground up.
- **Rich Examples & Case Studies:** For every major concept, you **must** provide multiple, detailed examples or even mini-case studies to illustrate the point. This is not optional.
- **Critical Analysis:** Where applicable, discuss counter-arguments, alternative theories, or the limitations of the concepts presented.

**Formatting and Quality Guidelines (Follow Strictly):**
- **Structure:** The notes must be exceptionally well-organized with a clear visual hierarchy. Use ample spacing (multiple newlines) between headings, paragraphs, and lists to ensure the document is clean and readable.
- **Headings:**
    - Use a markdown heading for each main topic (e.g., '# **Topic Name (MM:SS)**'). The heading itself must be bolded.
    - Within each topic, use bolded sub-headings (e.g., '## **Core Concepts**', '## **Illustrative Examples**', '### **Sub-Concept**') to create a clear, multi-layered structure.
- **Key Terms:** For important terms and concepts that are not headings, make them **bold** (e.g., "**Artificial Intelligence** is a broad field...").
- **Lists:** Use standard bullet points ('-') for lists. Ensure there is a newline before and after each list.

**Task:**
Generate the dissertation-quality study guide based on the topics provided. Use the transcription for context, but expand on the topics with your own knowledge to create a complete and refined set of study notes. If a topic is not in English, translate its title first.

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
