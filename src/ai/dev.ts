import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lecture-notes.ts';
import '@/ai/flows/clean-audio-and-transcribe.ts';
import '@/ai/flows/extract-lecture-topics.ts';