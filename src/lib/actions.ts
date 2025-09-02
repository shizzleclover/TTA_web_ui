// @ts-nocheck
'use server';

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

// This is a placeholder function. Replace this with a call to your custom backend.
async function getInvitationFromBackend(data: z.infer<typeof CreateRoomSchema>): Promise<{ invitationMessage: string }> {
  console.log('Room data to send to backend:', data);
  // Example:
  // const response = await fetch('YOUR_BACKEND_URL/create-quiz', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to create room on backend');
  // }
  // const result = await response.json();
  // return { invitationMessage: result.invitation };

  // For now, returning a mock invitation.
  await new Promise(resolve => setTimeout(resolve, 1000));
  const roomCreatorName = 'QuizMaster';
  return {
    invitationMessage: `Hey everyone, join ${roomCreatorName}'s quiz room "${data.roomName}" on ${data.scheduledTime}! Get ready for ${data.numberOfQuestions} questions about ${data.questionCategory}. Don't miss out!`,
  };
}


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

  try {
    const result = await getInvitationFromBackend(validatedFields.data);
    return {
      message: 'Invitation generated successfully!',
      invitation: result.invitationMessage,
    };
  } catch (error) {
    console.error('Backend Invitation Generation Error:', error);
    return {
      message: 'An unexpected error occurred while generating the invitation.',
    };
  }
}
