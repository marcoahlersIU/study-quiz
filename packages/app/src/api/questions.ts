import {
  Merge,
  RemoveRelationships,
  createItem,
  deleteItem,
  readItems,
  updateItem,
} from '@directus/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import directus from '.';
import { Answer, DirectusUser, Question, Schema } from './types';
import { useUser } from './user';

const fields = [
  'id',
  'sort',
  'topic',
  'content',
  { answers: ['id', 'content', 'correct_answer', 'reason'] },
  { user_created: ['id', 'first_name', 'last_name'] },
] as const;

export type QuestionQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & Question>,
    'id' | 'sort' | 'user_created' | 'topic' | 'content'
  >,
  object
> & {
  answers: Merge<
    Pick<
      RemoveRelationships<Schema, object & Answer>,
      'id' | 'content' | 'correct_answer' | 'reason'
    >,
    object
  >[];
  user_created: Merge<
    Pick<RemoveRelationships<Schema, object & DirectusUser>, 'id' | 'first_name' | 'last_name'>,
    object
  >;
};

export function useQuestions(topicId: string) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: () =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      directus.request(
        readItems('questions', {
          fields,
          filter: {
            topic: { _eq: topicId },
          },
          sort: 'sort',
          limit: -1,
        }),
      ) as Promise<QuestionQueryItem[]>,
  });
}

export type SaveQuestionMutation = Pick<Question, 'id' | 'content' | 'sort'> & {
  answers: Pick<Answer, 'id' | 'content' | 'correct_answer' | 'reason'>[];
};

export function useQuestionSaveMutation(topicId: string) {
  const queryQuery = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveQuestionMutation) => {
      const previousQuestions = queryClient.getQueryData([
        'questions',
        topicId,
      ]) as QuestionQueryItem[];
      const highestSort = Math.max(...previousQuestions.map((question) => question.sort || 0));

      return directus.request(
        createItem(
          'questions',
          {
            ...data,
            topic: topicId,
            answers: data.answers.map((answer) => ({
              ...answer,
              topic: topicId,
              question: data.id,
            })) as Answer[],
            sort: highestSort + 1,
          },
          { fields },
        ),
      );
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['questions', topicId] });
      const previousQuestions = queryClient.getQueryData([
        'questions',
        topicId,
      ]) as QuestionQueryItem[];
      const highestSort = Math.max(...previousQuestions.map((question) => question.sort || 0));

      queryClient.setQueryData(['questions', topicId], (old: QuestionQueryItem[] | undefined) => {
        if (old) {
          const newQuestion = [
            {
              ...data,
              user_created: {
                first_name: queryQuery.data?.first_name,
                last_name: queryQuery.data?.last_name,
                id: queryQuery.data?.id,
              },
              sort: highestSort + 1,
            },
            ...old,
          ];
          return newQuestion.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        }
        return old;
      });

      return { previousQuestions };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['questions', topicId], context?.previousQuestions);
    },
  });
}

export type UpdateQuestionMutation = Pick<Question, 'id' | 'content' | 'sort'> & {
  answers: Pick<Answer, 'id' | 'content' | 'correct_answer' | 'reason'>[];
};

export function useQuestionUpdateMutation(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateQuestionMutation) => {
      directus.request(
        updateItem(
          'questions',
          data.id,
          {
            ...data,
            answers: data.answers.map((answer) => ({
              ...answer,
              topic: topicId,
              question: data.id,
            })),
            sort: undefined,
          },
          { fields },
        ),
      );
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['questions', topicId] });
      const previousQuestions = queryClient.getQueryData([
        'questions',
        topicId,
      ]) as QuestionQueryItem[];

      queryClient.setQueryData(['questions', topicId], (old: QuestionQueryItem[] | undefined) => {
        if (old) {
          const newQuestions = [...old];
          const i = newQuestions.findIndex((topic) => topic.id === data.id);

          if (i !== -1) {
            newQuestions[i] = {
              ...newQuestions[i],
              ...data,
            };
          }

          return newQuestions;
        }
        return old;
      });

      return { previousQuestions };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['questions', topicId], context?.previousQuestions);
    },
  });
}

export function useQuestionDeleteMutation(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => directus.request(deleteItem('questions', id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['questions', topicId] });
      const previousQuestions = queryClient.getQueryData([
        'questions',
        topicId,
      ]) as QuestionQueryItem[];

      queryClient.setQueryData(['questions', topicId], (old: QuestionQueryItem[] | undefined) => {
        if (old) {
          return old.filter((topic) => topic.id !== id);
        }
        return old;
      });

      return { previousQuestions };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['questions', topicId], context?.previousQuestions);
    },
  });
}
