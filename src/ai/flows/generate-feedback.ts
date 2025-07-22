'use server';
/**
 * @fileOverview An AI agent for generating personalized student feedback.
 *
 * - generateFeedback - A function that handles the feedback generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateFeedbackInputSchema, 
    GenerateFeedbackOutputSchema, 
    type GenerateFeedbackInput, 
    type GenerateFeedbackOutput 
} from '@/ai/schemas';

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

const generateFeedbackPrompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: {schema: GenerateFeedbackInputSchema},
  output: {schema: GenerateFeedbackOutputSchema},
  prompt: `You are an expert academic advisor for university students. Your task is to provide constructive, personalized feedback based on a student's marks.

Student Name: {{{studentName}}}
Subjects and Marks:
{{#each marks}}
- {{ @key }}: {{ this }}
{{/each}}

Analyze the student's performance. Identify strengths (subjects with marks > 85) and weaknesses (subjects with marks < 75).
Provide a few concise, actionable tips for improvement focused on the weak subjects.
Then, create a structured 7-day study plan. The plan should be balanced and help the student focus on their weaker subjects without neglecting others. Each day should have a clear topic and a simple task.

Generate the feedback in the following JSON format:
`,
});

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateFeedbackPrompt(input);
    return output!;
  }
);
