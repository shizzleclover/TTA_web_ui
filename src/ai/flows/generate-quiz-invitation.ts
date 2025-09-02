'use server';
/**
 * @fileOverview Generates an engaging quiz invitation message using room parameters.
 *
 * - generateQuizInvitation - A function to generate the invitation message.
 * - GenerateQuizInvitationInput - The input type for the generateQuizInvitation function.
 * - GenerateQuizInvitationOutput - The return type for the generateQuizInvitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInvitationInputSchema = z.object({
  roomName: z.string().describe('The name of the quiz room.'),
  scheduledTime: z.string().describe('The scheduled time of the quiz.'),
  numberOfQuestions: z.number().describe('The number of questions in the quiz.'),
  questionCategory: z.string().describe('The category of questions in the quiz.'),
  roomCreatorName: z.string().describe('The name of the room creator.'),
});

export type GenerateQuizInvitationInput = z.infer<typeof GenerateQuizInvitationInputSchema>;

const GenerateQuizInvitationOutputSchema = z.object({
  invitationMessage: z.string().describe('The generated engaging invitation message.'),
});

export type GenerateQuizInvitationOutput = z.infer<typeof GenerateQuizInvitationOutputSchema>;

export async function generateQuizInvitation(input: GenerateQuizInvitationInput): Promise<GenerateQuizInvitationOutput> {
  return generateQuizInvitationFlow(input);
}

const invitationPrompt = ai.definePrompt({
  name: 'invitationPrompt',
  input: {schema: GenerateQuizInvitationInputSchema},
  output: {schema: GenerateQuizInvitationOutputSchema},
  prompt: `You are an AI assistant designed to create engaging invitation messages for quiz rooms.

  Given the following quiz room parameters, generate an invitation message that will entice people to join.

  Room Name: {{{roomName}}}
  Scheduled Time: {{{scheduledTime}}}
  Number of Questions: {{{numberOfQuestions}}}
  Question Category: {{{questionCategory}}}
  Room Creator: {{{roomCreatorName}}}

  The invitation message should be short, friendly, and persuasive. It should highlight the key details of the quiz and create a sense of excitement and anticipation.
  Make it personalized to the room creator.
  Here's an example:
  "Hey everyone, join {{{roomCreatorName}}}'s quiz room \"{{{roomName}}}\" on {{{scheduledTime}}}! Get ready for {{{numberOfQuestions}}} questions about {{{questionCategory}}}. Don't miss out!"
  `,
});

const generateQuizInvitationFlow = ai.defineFlow(
  {
    name: 'generateQuizInvitationFlow',
    inputSchema: GenerateQuizInvitationInputSchema,
    outputSchema: GenerateQuizInvitationOutputSchema,
  },
  async input => {
    const {output} = await invitationPrompt(input);
    return output!;
  }
);
