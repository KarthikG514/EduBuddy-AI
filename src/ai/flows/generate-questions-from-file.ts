'use server';
/**
 * @fileOverview A question generator AI agent that uses an uploaded document.
 *
 * - generateQuestionsFromFile - A function that handles question generation from a file.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateQuestionsFromFileInputSchema, 
    GenerateQuestionsOutputSchema,
    type GenerateQuestionsFromFileInput,
    type GenerateQuestionsOutput
} from '@/ai/schemas';

export async function generateQuestionsFromFile(input: GenerateQuestionsFromFileInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFromFileFlow(input);
}

const generateQuestionsFromFilePrompt = ai.definePrompt({
  name: 'generateQuestionsFromFilePrompt',
  input: {schema: GenerateQuestionsFromFileInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are a university-level MCQ generator.

Based on the following uploaded notes/syllabus, extract important concepts and generate {{numberOfQuestions}} MCQs of {{difficulty}} level.

Input document:
{{media url=fileDataUri}}

Instructions:
- Each question must be based on the provided document.
- Each question should have 4 options (A, B, C, D).
- You must provide the correct option for each question in the 'answer' field.
- Use a professional tone.
- Ensure all questions are distinct.

Generate the response in the specified JSON format.
`,
});

const generateQuestionsFromFileFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromFileFlow',
    inputSchema: GenerateQuestionsFromFileInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionsFromFilePrompt(input);
    return output!;
  }
);
