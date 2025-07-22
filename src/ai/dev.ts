import { config } from 'dotenv';
config({ path: require('path').resolve(process.cwd(), '.env') });

import '@/ai/flows/generate-questions.ts';
import '@/ai/flows/generate-feedback.ts';
import '@/ai/flows/generate-questions-from-file.ts';
import '@/ai/flows/generate-advice.ts';
import '@/ai/flows/generate-question-paper.ts';
import '@/ai/flows/generate-attendance-report.ts';
import '@/ai/flows/generate-mark-feedback.ts';
import '@/ai/flows/grade-assignment-flow.ts';
import '@/ai/flows/generate-classroom-game.ts';
import '@/ai/flows/generate-knowledge-galaxy.ts';
import '@/ai/flows/check-plagiarism.ts';
