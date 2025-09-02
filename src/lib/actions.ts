// @ts-nocheck
'use server';

import { generateQuizInvitation } from '@/ai/flows/generate-quiz-invitation';
import { z } from 'zod';

const CreateRoomSchema = z.object({
  roomName: z.string().min(3, 'Room name must be at least 3 characters'),
  questionCategory: z.string().min(1, 'Please select a category'),
  numberOfQuestions: z.coerce.number().min(5, 'Minimum 5 questions').max(50, 'Maximum 50 questions'),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
});

export type FormState = {
  message: string;
  invitation?: string;
  errors?: {
    roomName?: string[];
    questionCategory?: string[];
    numberOfQuestions?: string[];
    scheduledTime?: string[];
  };
};

export async function createRoomAndGetInvitation(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreateRoomSchema.safeParse({
    roomName: formData.get('roomName'),
    questionCategory: formData.get('questionCategory'),
    numberOfQuestions: formData.get('numberOfQuestions'),
    scheduledTime: formData.get('scheduledTime'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the errors.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  // In a real app, this would come from the authenticated user's session
  const roomCreatorName = 'QuizMaster';

  try {
    const result = await generateQuizInvitation({
      ...data,
      roomCreatorName,
    });
    return {
      message: 'Invitation generated successfully!',
      invitation: result.invitationMessage,
    };
  } catch (error) {
    console.error('AI Invitation Generation Error:', error);
    return {
      message: 'An unexpected error occurred while generating the invitation.',
    };
  }
}
