'use server';
/**
 * @fileOverview An AI agent for generating feedback on internal marks.
 *
 * - generateMarkFeedback - A function that handles the feedback generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateMarkFeedbackInputSchema,
    GenerateMarkFeedbackOutputSchema,
    type GenerateMarkFeedbackInput,
    type GenerateMarkFeedbackOutput
} from '@/ai/schemas';

export async function generateMarkFeedback(input: GenerateMarkFeedbackInput): Promise<GenerateMarkFeedbackOutput> {
  return generateMarkFeedbackFlow(input);
}

const generateMarkFeedbackPrompt = ai.definePrompt({
  name: 'generateMarkFeedbackPrompt',
  input: {schema: GenerateMarkFeedbackInputSchema},
  output: {schema: GenerateMarkFeedbackOutputSchema},
  prompt: `You are a "Mark Calculator". Your task is to generate a concise, one-line feedback summary for a student's report card based on the provided data.

Inputs:
- Student Name: {{studentName}}
- Internal Score: {{internalScore}} / 30
- Grade: {{grade}}
- Attendance: {{attendance}}%

Example:
Input:
- Student Name: Keerthi
- Internal Score: 27
- Grade: A
- Attendance: 92
Output:
Keerthi scored 27/30 and secured Grade A with 92% attendance. Excellent performance and consistency.

Generate the feedback in the specified JSON format.
`,
});

const generateMarkFeedbackFlow = ai.defineFlow(
  {
    name: 'generateMarkFeedbackFlow',
    inputSchema: GenerateMarkFeedbackInputSchema,
    outputSchema: GenerateMarkFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateMarkFeedbackPrompt(input);
    return output!;
  }
);
