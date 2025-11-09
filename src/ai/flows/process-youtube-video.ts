'use server';

/**
 * @fileOverview A flow to process a YouTube video, extract audio, and generate lecture notes.
 *
 * - processYoutubeVideo - The main function to orchestrate the YouTube video processing.
 * - ProcessYoutubeVideoInput - The input type for the processYoutubeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateLectureNotes,
  GenerateLectureNotesOutput,
} from './generate-lecture-notes';
import {extractLectureTopics} from './extract-lecture-topics';

// Mock function to simulate YouTube audio extraction.
// In a real scenario, this would use a library like ytdl-core.
const extractAudioFromYoutube = ai.defineTool(
  {
    name: 'extractAudioFromYoutube',
    description: 'Extracts audio from a YouTube video URL and returns it as a data URI.',
    inputSchema: z.object({
      videoUrl: z.string().url().describe('The URL of the YouTube video.'),
    }),
    outputSchema: z.object({
      audioDataUri: z.string().describe('The extracted audio as a data URI.'),
      videoTitle: z.string().describe('The title of the YouTube video.'),
    }),
  },
  async ({videoUrl}) => {
    // This is a mock implementation.
    // A real implementation would download the video, extract audio, and convert to a data URI.
    console.log(`Extracting audio from ${videoUrl}`);
    // Returning a dummy data URI and title.
    // The actual transcription will be handled by the next step.
    return {
      audioDataUri: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
      videoTitle: 'Placeholder Title',
    };
  }
);


const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcription of the audio.'),
});

const transcribeAudioPrompt = ai.definePrompt({
    name: 'transcribeAudioPrompt',
    input: { schema: TranscribeAudioInputSchema },
    output: { schema: TranscribeAudioOutputSchema },
    prompt: `Transcribe the following audio.
  
    Audio: {{media url=audioDataUri}}`,
});


const ProcessYoutubeVideoInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video.'),
  detailLevel: z
    .enum(['basic', 'medium', 'detailed'])
    .describe(
      'The desired level of detail for the notes. Can be "basic", "medium", or "detailed".'
    ),
});

const GenerateLectureNotesOutputSchema = z.object({
  notes: z.string().describe('The summarized lecture notes in markdown format.'),
});

export type ProcessYoutubeVideoInput = z.infer<typeof ProcessYoutubeVideoInputSchema>;

export async function processYoutubeVideo(
  input: ProcessYoutubeVideoInput
): Promise<GenerateLectureNotesOutput> {
  return youtubeVideoFlow(input);
}

const youtubeVideoFlow = ai.defineFlow(
  {
    name: 'youtubeVideoFlow',
    inputSchema: ProcessYoutubeVideoInputSchema,
    outputSchema: GenerateLectureNotesOutputSchema,
    tools: [extractAudioFromYoutube]
  },
  async input => {
    // This is a mock implementation because there is no tool to get audio from youtube.
    const transcription = `Heuristic search is a search technique that seeks to improve the efficiency of a search process by sacrificing completeness or optimality. In other words, it aims to find a good solution, but not necessarily the best one. This is in contrast to exact algorithms, which are guaranteed to find the optimal solution but can be very slow.
Genetic algorithms are a type of heuristic search that is inspired by the process of natural selection. They are used to find solutions to optimization and search problems. Genetic algorithms work by creating a population of candidate solutions and then repeatedly applying a set of genetic operators to the population to evolve new and better solutions.`;
    
    // Step 2: Extract Topics from Transcription
    const {topics} = await extractLectureTopics({transcription});
    if (!topics || topics.length === 0) {
      throw new Error('Failed to extract topics from transcription.');
    }

    // Step 3: Generate Notes from Topics and Transcription
    const notesResult = await generateLectureNotes({
      transcription,
      topics,
      detailLevel: input.detailLevel,
    });

    return notesResult;
  }
);
