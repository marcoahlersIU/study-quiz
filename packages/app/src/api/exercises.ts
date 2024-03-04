import {
  Merge,
  RemoveRelationships,
  createItem,
  readItem,
  readItems,
  updateItem,
} from '@directus/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import directus from '.';
import {
  DirectusUser,
  Exercise,
  ExerciseAnswer,
  ExerciseParticipant,
  ExerciseParticipantAnswer,
  ExerciseQuestion,
  Schema,
} from './types';
import { useUser } from './user';

const fields = [
  'id',
  'user_created',
  'topic',
  'status',
  'current_exercise_question',
  { participants: ['id', 'user', 'status'] },
] as const;

export type ExerciseQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & Exercise>,
    'id' | 'user_created' | 'topic' | 'status' | 'current_exercise_question'
  >,
  object
> & {
  participants: Merge<
    Pick<RemoveRelationships<Schema, object & ExerciseParticipant>, 'id' | 'user' | 'status'>,
    object
  >[];
};

export function useExercise(id?: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () =>
      id
        ? (directus.request(
            readItem('exercises', id, {
              fields: fields,
            }),
          ) as Promise<ExerciseQueryItem>)
        : null,
  });
}

export function useUsersActiveExercise() {
  const userQuery = useUser();

  return useQuery({
    queryKey: ['active-user-exercises'],
    queryFn: () =>
      directus.request(
        readItems('exercises', {
          fields,
          filter: {
            status: { _in: ['init', 'started'] },
            participants: {
              user: { id: { _eq: userQuery.data?.id } },
              status: { _eq: 'accepted' },
            },
          },
          limit: -1,
        }),
      ) as Promise<ExerciseQueryItem[]>,
  });
}

export function useExerciseAcceptInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: string }) =>
      directus.request(
        updateItem('exercise_participants', inviteId, {
          status: 'accepted',
        }),
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['active-user-exercises'] });
    },
  });
}

export function useExerciseSaveMutation(topicId: string) {
  const userQuery = useUser();
  const queryClient = useQueryClient();
  const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;

  return useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topicId,
          participants: [userQuery.data?.id],
        }),
      });
      if (!resp.ok) {
        throw new Error('Failed to create exercise');
      }
      const data = await resp.json();

      const exercise = await directus.request(
        readItem('exercises', (data as { exerciseId: string }).exerciseId, { fields }),
      );
      return exercise;
    },
    onSettled: async (data) => {
      queryClient.setQueryData(['exercises', topicId], (old: ExerciseQueryItem[] | undefined) => {
        if (old) {
          return [...old, data];
        }
        return old;
      });
      queryClient.invalidateQueries({ queryKey: ['active-user-exercises'] });

      return data;
    },
  });
}

export function useExerciseInvitateMutation(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExerciseParticipant) =>
      directus.request(createItem('exercise_participants', data)),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['exercises', topicId] });
      const previousExercises = queryClient.getQueryData([
        'exercises',
        topicId,
      ]) as ExerciseQueryItem[];

      queryClient.setQueryData(['exercises', topicId], (old: ExerciseQueryItem[] | undefined) => {
        if (old) {
          const exerciseIndex = old.findIndex((exercise) => exercise.id === data.exercise);
          if (exerciseIndex !== -1) {
            const newExercises = [...old];
            newExercises[exerciseIndex] = {
              ...newExercises[exerciseIndex],
              participants: [
                ...newExercises[exerciseIndex].participants,
                { id: data.id, user: data.user as string, status: data.status },
              ],
            };
            return newExercises;
          }
        }
        return old;
      });

      return { previousExercises };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['exercises', topicId], context?.previousExercises);
    },
    retry: false,
  });
}

export function useExerciseStartMutation(exerciseId: string, topicId: string) {
  const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/exercises/${exerciseId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );
      if (!resp.ok) {
        throw new Error('Failed to start exercise');
      }
      const data = await resp.json();
      return data as ExerciseQueryItem;
    },
    onSettled: async (data) => {
      if (data) {
        queryClient.setQueryData(['exercises', topicId], (old: ExerciseQueryItem[] | undefined) => {
          if (old) {
            const newExercises = [...old];
            const exerciseIndex = newExercises.findIndex((exercise) => exercise.id === data.id);
            if (exerciseIndex !== -1) {
              newExercises[exerciseIndex] = {
                ...newExercises[exerciseIndex],
                ...data,
                participants: newExercises[exerciseIndex].participants,
              };
            }

            return [...old, data];
          }
          return old;
        });
      }

      return data;
    },
  });
}

export function useExerciseNextQuestionMutation(exerciseId: string) {
  const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/exercises/${exerciseId}/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        throw new Error('Failed to start exercise');
      }
      const data = await resp.json();
      return data as ExerciseQueryItem;
    },
    onSettled: async (data) => {
      if (data) {
        queryClient.setQueryData(['exercise', exerciseId], (old: ExerciseQueryItem | undefined) => {
          if (old) {
            return {
              ...old,
              ...data,
              participants: old.participants,
            };
          }
          return old;
        });
      }

      return data;
    },
  });
}

const exerciseQuestionsFields = [
  'id',
  'content',
  'show_result',
  'answer_end_time',
  { exercise_question_answers: ['id', 'content', 'correct_answer', 'reason'] },
] as const;

export type ExerciseQuestionQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & ExerciseQuestion>,
    'id' | 'content' | 'show_result' | 'answer_end_time'
  >,
  object
> & {
  exercise_question_answers: Merge<
    Pick<
      RemoveRelationships<Schema, object & ExerciseAnswer>,
      'id' | 'content' | 'correct_answer' | 'reason'
    >,
    object
  >[];
};

export function useExerciseQuestion(exerciseQuestionId?: string | null) {
  return useQuery({
    queryKey: ['exercise-question', exerciseQuestionId],
    queryFn: () =>
      exerciseQuestionId
        ? directus.request(
            readItem('exercise_questions', exerciseQuestionId, {
              fields: exerciseQuestionsFields,
              limit: -1,
            }),
          )
        : null,
  });
}

export function useExerciseQuestionShowResult(exerciseQuestionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!exerciseQuestionId) {
        throw new Error('Missing exercise question id');
      }

      return directus.request(
        updateItem(
          'exercise_questions',
          exerciseQuestionId,
          { show_result: true },
          { fields: exerciseQuestionsFields },
        ),
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['exercise-question', exerciseQuestionId],
      });
      const previousExerciseQuestion = queryClient.getQueryData([
        'exercise-question',
        exerciseQuestionId,
      ]) as ExerciseParticipantAnswerQueryItem[];

      queryClient.setQueryData(
        ['exercise-question', exerciseQuestionId],
        (old: ExerciseQuestionQueryItem | undefined) => {
          if (old) {
            return {
              ...old,
              show_result: true,
            };
          }
          return old;
        },
      );

      return { previousExerciseQuestion };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        ['exercise-question', exerciseQuestionId],
        context?.previousExerciseQuestion,
      );
    },
  });
}

const exerciseParticipantAnswerFields = [
  'id',
  'selected_exercise_answer',
  { participant: ['id', { user: ['id', 'first_name', 'last_name'] }] },
] as const;

export type ExerciseParticipantAnswerQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & ExerciseParticipantAnswer>,
    'id' | 'selected_exercise_answer'
  >,
  {
    participant: Merge<
      Pick<RemoveRelationships<Schema, object & ExerciseParticipant>, 'id'>,
      {
        user: Pick<
          RemoveRelationships<Schema, object & DirectusUser>,
          'id' | 'first_name' | 'last_name'
        >;
      }
    >;
  }
>;

export function useExerciseQuestionParticipantAnswers(exerciseQuestionId?: string) {
  return useQuery({
    queryKey: ['exercise-participant-answers', exerciseQuestionId],
    queryFn: () =>
      exerciseQuestionId
        ? (directus.request(
            readItems('exercise_participant_answers', {
              filter: {
                exercise_question: { _eq: exerciseQuestionId },
              },
              fields: exerciseParticipantAnswerFields,
              limit: -1,
            }),
          ) as Promise<ExerciseParticipantAnswerQueryItem[]>)
        : null,
  });
}

export function useExerciseQuestionSaveParticipantAnswer(exerciseQuestionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { selected_exercise_answer: string; participant: string }) => {
      if (!exerciseQuestionId) {
        throw new Error('Missing exercise question id');
      }

      const exerciseParticipantAnswers = queryClient.getQueryData([
        'exercise-participant-answers',
        exerciseQuestionId,
      ]) as ExerciseParticipantAnswerQueryItem[];

      const existingExerciseParticipantAnswerIndex = exerciseParticipantAnswers.findIndex(
        (exerciseParticipantAnswer) =>
          exerciseParticipantAnswer.participant.id === data.participant,
      );

      if (existingExerciseParticipantAnswerIndex === -1) {
        throw new Error('Missing exercise participant answer');
      }

      return directus.request(
        updateItem(
          'exercise_participant_answers',
          exerciseParticipantAnswers[existingExerciseParticipantAnswerIndex].id,
          {
            selected_exercise_answer: data.selected_exercise_answer,
          },
        ),
      ) as Promise<ExerciseParticipantAnswerQueryItem>;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ['exercise-participant-answers', exerciseQuestionId],
      });
      const previousExerciseParticipantAnswers = queryClient.getQueryData([
        'exercise-participant-answers',
        exerciseQuestionId,
      ]) as ExerciseParticipantAnswerQueryItem[];

      queryClient.setQueryData(
        ['exercise-participant-answers', exerciseQuestionId],
        (old: ExerciseParticipantAnswerQueryItem[] | undefined) => {
          if (old) {
            const newAnswers = [...old];
            const i = newAnswers.findIndex((answer) => answer.participant.id === data.participant);
            if (i !== -1) {
              newAnswers[i] = {
                ...newAnswers[i],
                selected_exercise_answer: data.selected_exercise_answer,
              };
            }

            return newAnswers;
          }
          return old;
        },
      );

      return { previousExerciseParticipantAnswers };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        ['exercise-participant-answers', exerciseQuestionId],
        context?.previousExerciseParticipantAnswers,
      );
    },
  });
}

export function useExerciseEvaluation(exerciseId?: string) {
  const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;

  return useQuery({
    queryKey: ['exercise-evaluation', exerciseId],
    queryFn: async () => {
      if (exerciseId) {
        const resp = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/exercises/${exerciseId}/evaluation`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          },
        );
        if (!resp.ok) {
          throw new Error('Failed to create exercise');
        }
        const data = await resp.json();

        return data as {
          id: string;
          first_name: string;
          last_name: string;
          total: number;
          answeredCorrectlyCount: number;
        }[];
      }

      return null;
    },
  });
}

export function useExerciseEndMutation(exerciseId: string) {
  return useMutation({
    mutationFn: () =>
      directus.request(
        updateItem('exercises', exerciseId, {
          status: 'finished',
          current_exercise_question: null,
        }),
      ),
  });
}
