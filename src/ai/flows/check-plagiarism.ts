'use server';
/**
 * @fileOverview An AI agent for checking plagiarism between two documents.
 *
 * - checkPlagiarism - A function that handles the plagiarism check process.
 */

import {ai} from '@/ai/genkit';
import {
  PlagiarismCheckInputSchema,
  PlagiarismCheckOutputSchema,
  type PlagiarismCheckInput,
  type PlagiarismCheckOutput,
} from '@/ai/schemas';

export async function checkPlagiarism(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
  return checkPlagiarismFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkPlagiarismPrompt',
  input: {schema: PlagiarismCheckInputSchema},
  output: {schema: PlagiarismCheckOutputSchema},
  prompt: `You are an expert AI for detecting plagiarism in academic documents.

You will be given two documents to compare. Your task is to analyze both documents and determine the degree of similarity between them.

Document 1 ({{doc1Name}}):
{{media url=doc1Content}}

Document 2 ({{doc2Name}}):
{{media url=doc2Content}}

Instructions:
1.  Read both documents carefully.
2.  Compare their content, structure, wording, and ideas.
3.  Calculate a similarity percentage. A score of 100% means the documents are identical. A score of 0% means they are completely different.
4.  Provide a detailed analysis explaining your reasoning for the similarity score. Point out specific sections, sentences, or ideas that are similar or identical. If you find no significant similarities, state that clearly.
5.  Based on the similarity score, provide a final verdict: "No Plagiarism Detected", "Low Similarity", "Moderate Similarity", "High Similarity", or "Likely Plagiarized".

Format the output strictly in the specified JSON format.
`,
});

const checkPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkPlagiarismFlow',
    inputSchema: PlagiarismCheckInputSchema,
    outputSchema: PlagiarismCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
