'use server';
/**
 * @fileOverview An AI agent for gamifying classroom topics.
 *
 * - generateClassroomGame - Generates a quiz and a puzzle from a topic.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateClassroomGameInputSchema, 
    GenerateClassroomGameOutputSchema,
    type GenerateClassroomGameInput, 
    type GenerateClassroomGameOutput 
} from '@/ai/schemas';

export async function generateClassroomGame(input: GenerateClassroomGameInput): Promise<GenerateClassroomGameOutput> {
  return generateClassroomGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassroomGamePrompt',
  input: {schema: GenerateClassroomGameInputSchema},
  output: {schema: GenerateClassroomGameOutputSchema},
  prompt: `You are an AI expert in educational gamification for university students. Your task is to convert a given topic into a short, fun, and engaging classroom activity.

Topic: {{{topic}}}

Generate the following based on the topic:
1.  **Quiz**: Create exactly 5 multiple-choice questions. Each question must have 4 options (A, B, C, D) and a correct answer. The questions should be challenging but fair for a live classroom setting.
2.  **Puzzle**: Create a word scramble puzzle. The puzzle should consist of one key term from the topic scrambled into a jumble of letters. You must also provide the unscrambled answer. The term should be between 6 and 12 letters long.

Ensure all content is directly related to the provided topic. Format the output in the specified JSON format.
`,
});

const generateClassroomGameFlow = ai.defineFlow(
  {
    name: 'generateClassroomGameFlow',
    inputSchema: GenerateClassroomGameInputSchema,
    outputSchema: GenerateClassroomGameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
