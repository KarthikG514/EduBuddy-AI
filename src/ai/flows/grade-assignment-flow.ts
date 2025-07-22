'use server';
/**
 * @fileOverview An AI agent for grading student assignments.
 *
 * - gradeAssignment - A function that handles the assignment grading process.
 */

import {ai} from '@/ai/genkit';
import {
    GradeAssignmentInputSchema,
    GradeAssignmentOutputSchema,
    type GradeAssignmentInput,
    type GradeAssignmentOutput,
} from '@/ai/schemas';

export async function gradeAssignment(input: GradeAssignmentInput): Promise<GradeAssignmentOutput> {
  return gradeAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeAssignmentPrompt',
  input: {schema: GradeAssignmentInputSchema},
  output: {schema: GradeAssignmentOutputSchema},
  prompt: `You are an expert Teaching Assistant responsible for grading student assignments.

You will receive an assignment document. Analyze its content based on the following rubric:
- **Clarity (4 points):** Is the language clear, concise, and easy to understand? Are concepts well-explained?
- **Structure (3 points):** Is the assignment well-organized with a logical flow, introduction, body, and conclusion?
- **Relevance (3 points):** Does the content directly address the assignment prompt and stay on topic?

Based on your analysis, provide a final score out of 10 and constructive feedback. The feedback should be a concise, one or two-sentence summary explaining the score and suggesting improvements.

Assignment for subject: {{{subject}}}
Student: {{{studentName}}}
Assignment Content:
{{media url=fileDataUri}}

Grade the assignment and provide the score and feedback in the specified JSON format.
`,
});

const gradeAssignmentFlow = ai.defineFlow(
  {
    name: 'gradeAssignmentFlow',
    inputSchema: GradeAssignmentInputSchema,
    outputSchema: GradeAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
