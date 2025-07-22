// src/ai/flows/generate-attendance-report.ts
'use server';
/**
 * @fileOverview An AI agent for generating student attendance reports.
 *
 * - generateAttendanceReport - A function that handles the report generation process.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateAttendanceReportInputSchema,
    GenerateAttendanceReportOutputSchema,
    type GenerateAttendanceReportInput,
    type GenerateAttendanceReportOutput
} from '@/ai/schemas';


export async function generateAttendanceReport(input: GenerateAttendanceReportInput): Promise<GenerateAttendanceReportOutput> {
  return generateAttendanceReportFlow(input);
}

const generateAttendanceReportPrompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: {schema: GenerateAttendanceReportInputSchema},
  output: {schema: GenerateAttendanceReportOutputSchema},
  prompt: `You are an academic advisor writing concise student attendance and behavior summaries for internal reports.

Given the following input:

Student Name: {{{studentName}}}
Total Days: {{{totalDays}}}
Present Days: {{{presentDays}}}
Behavior Tags: {{#if behaviorTags}}{{#each behaviorTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

Tasks:
1. Calculate attendance percentage.
2. Classify it as:
   - Excellent (90-100%)
   - Good (80-89%)
   - Fair (70-79%)
   - Poor (<70%)
3. Mention behavioral issues if any. If there are no tags, state that behavior is satisfactory.
4. End with a professional recommendation in one line.

Format your response exactly like this:
[Student Name] has an attendance of [xx%] which is [quality category]. Behavioral notes include: [summarized tags if any]. Recommendation: [one-liner advice].

Example Input:
Student Name: Vignesh
Total Days: 30
Present Days: 22
Behavior Tags: Distracted, Late, Late

Example Output:
Vignesh has an attendance of 73% which is Fair. Behavioral notes include: frequent distractions and lateness. Recommendation: Needs to improve focus and punctuality.

Generate the report in the specified JSON format.
`,
});

const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateAttendanceReportInputSchema,
    outputSchema: GenerateAttendanceReportOutputSchema,
  },
  async input => {
    const {output} = await generateAttendanceReportPrompt(input);
    return output!;
  }
);
