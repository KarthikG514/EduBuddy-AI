'use server';
/**
 * @fileOverview An AI agent for visualizing a course structure as a knowledge galaxy.
 *
 * - generateKnowledgeGalaxy - Generates a structured map of topics and sub-topics for a given subject.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateKnowledgeGalaxyInputSchema, 
    GenerateKnowledgeGalaxyOutputSchema,
    type GenerateKnowledgeGalaxyInput, 
    type GenerateKnowledgeGalaxyOutput 
} from '@/ai/schemas';

export async function generateKnowledgeGalaxy(input: GenerateKnowledgeGalaxyInput): Promise<GenerateKnowledgeGalaxyOutput> {
  return generateKnowledgeGalaxyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKnowledgeGalaxyPrompt',
  input: {schema: GenerateKnowledgeGalaxyInputSchema},
  output: {schema: GenerateKnowledgeGalaxyOutputSchema},
  prompt: `You are an expert curriculum designer. Your task is to break down a given university-level subject or syllabus into a "Knowledge Galaxy".

{{#if subject}}Subject: {{{subject}}}{{/if}}
{{#if fileDataUri}}Syllabus Content: {{media url=fileDataUri}}{{/if}}

Instructions:
1.  Identify 5-7 core concepts or units for the subject based on the provided input. These will be your "planets".
2.  For each "planet" (core concept), identify 3-5 related sub-topics. These will be its "moons".
3.  Each planet and moon should have a very short, one-sentence description.
4.  The entire structure should represent a logical flow of learning for a semester.

Ensure all content is directly related to the provided subject or syllabus. Format the output in the specified JSON format.
`,
});

const generateKnowledgeGalaxyFlow = ai.defineFlow(
  {
    name: 'generateKnowledgeGalaxyFlow',
    inputSchema: GenerateKnowledgeGalaxyInputSchema,
    outputSchema: GenerateKnowledgeGalaxyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
