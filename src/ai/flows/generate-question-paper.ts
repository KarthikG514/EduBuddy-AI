'use server';
/**
 * @fileOverview An AI agent for generating college-level question papers.
 *
 * - generateQuestionPaper - A function that handles the question paper generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateQuestionPaperInputSchema, 
    GenerateQuestionPaperOutputSchema,
    type GenerateQuestionPaperInput,
    type GenerateQuestionPaperOutput
} from '@/ai/schemas';

export async function generateQuestionPaper(input: GenerateQuestionPaperInput): Promise<GenerateQuestionPaperOutput> {
  return generateQuestionPaperFlow(input);
}

const generateQuestionPaperPrompt = ai.definePrompt({
  name: 'generateQuestionPaperPrompt',
  input: {schema: GenerateQuestionPaperInputSchema},
  output: {schema: GenerateQuestionPaperOutputSchema},
  prompt: `You are an expert question paper setter for engineering college exams.

Based on the provided input, generate a balanced question paper for the specified subject.

Subject: {{{subject}}}

Input Content (use this as the primary source):
{{#if fileDataUri}}{{media url=fileDataUri}}{{else}}Topic: {{{unit}}}{{/if}}

Instructions:
- Generate exactly 10 one-mark MCQs. Each MCQ must have 4 options (a, b, c, d) and a correct answer.
- Generate exactly 10 two-mark short answer questions to test understanding.
- Generate exactly 4 ten-mark descriptive/essay type questions. The instructions for the student will be to answer any two.

Generate the response in the specified JSON format.
`,
});

const generateQuestionPaperFlow = ai.defineFlow(
  {
    name: 'generateQuestionPaperFlow',
    inputSchema: GenerateQuestionPaperInputSchema,
    outputSchema: GenerateQuestionPaperOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionPaperPrompt(input);
    return output!;
  }
);

    