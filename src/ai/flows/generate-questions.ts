// src/ai/flows/generate-questions.ts
'use server';
/**
 * @fileOverview A question generator AI agent for university-level educators.
 *
 * - generateQuestions - A function that handles the question generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateQuestionsInputSchema, 
    GenerateQuestionsOutputSchema,
    type GenerateQuestionsInput,
    type GenerateQuestionsOutput
} from '@/ai/schemas';


export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an AI quiz generator assistant for university professors. Your task is to generate high-quality **college-level MCQs** based on the input below.

Inputs:
- Subject: {{{subject}}}
- Topic: {{{topic}}}
- Number of Questions: {{{numberOfQuestions}}}
- Academic Complexity: {{{difficulty}}} (Easy = Recall, Moderate = Application, Advanced = Conceptual/Critical Thinking)

Instructions:
- Each question must be based on the selected topic.
- Each question should have 4 options (A, B, C, D).
- You must provide the correct option for each question in the 'answer' field.
- Use a professional tone.
- Ensure all questions are distinct.

Generate the response in the specified JSON format.
`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionsPrompt(input);
    return output!;
  }
);
