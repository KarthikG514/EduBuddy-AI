'use server';
/**
 * @fileOverview An AI agent for providing teaching plan advice.
 *
 * - generateAdvice - A function that handles the advice generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateAdviceInputSchema, 
    GenerateAdviceOutputSchema, 
    type GenerateAdviceInput, 
    type GenerateAdviceOutput 
} from '@/ai/schemas';

export async function generateAdvice(input: GenerateAdviceInput): Promise<GenerateAdviceOutput> {
  return generateAdviceFlow(input);
}

const generateAdvicePrompt = ai.definePrompt({
  name: 'generateAdvicePrompt',
  input: {schema: GenerateAdviceInputSchema},
  output: {schema: GenerateAdviceOutputSchema},
  prompt: `You are an AI Teaching Assistant designed to help college professors plan their next class session.

You will receive a syllabus or lecture notes as input.

From that:
1. Extract and list all covered topics.
2. Suggest the next logical topic that should follow based on standard college flow.
3. Mention any important concepts that may have been skipped or are unclear.
4. Recommend topics that should be revised before any test.

Use bullet points for each section. Keep the tone professional and helpful.

Input Content:
{{#if fileDataUri}}{{media url=fileDataUri}}{{else}}{{{text}}}{{/if}}

Format the output clearly in the specified JSON format.
`,
});

const generateAdviceFlow = ai.defineFlow(
  {
    name: 'generateAdviceFlow',
    inputSchema: GenerateAdviceInputSchema,
    outputSchema: GenerateAdviceOutputSchema,
  },
  async input => {
    const {output} = await generateAdvicePrompt(input);
    return output!;
  }
);
