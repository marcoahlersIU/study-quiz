import {
  Merge,
  RemoveRelationships,
  createItem,
  deleteItem,
  readItems,
  updateItem,
} from '@directus/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import directus from '.';
import { Schema, Topic } from './types';
import { useUser } from './user';

const queryKey = ['topics'];

const fields = ['id', 'date_created', 'icon', 'sort', 'title', 'user_created'] as const;

export type TopicQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & Topic>,
    'id' | 'date_created' | 'icon' | 'sort' | 'title' | 'user_created'
  >,
  object
>;

export function useTopics() {
  return useQuery({
    queryKey,
    queryFn: () =>
      directus.request(
        readItems('topics', {
          fields: fields,
          sort: '-sort',
          limit: -1,
        }),
      ) as Promise<TopicQueryItem[]>,
  });
}

export function useTopic(id: string) {
  const query = useTopics();
  const topic = query?.data?.find((topic) => topic.id === id);
  return { data: topic, isInitialLoading: query.isInitialLoading };
}

export type SaveTopicMutation = Pick<Topic, 'id' | 'title' | 'icon' | 'sort'>;

export function useTopicSaveMutation() {
  const queryQuery = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveTopicMutation) => directus.request(createItem('topics', data)),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTopics = queryClient.getQueryData(queryKey) as Topic[];

      queryClient.setQueryData(queryKey, (old: Topic[] | undefined) => {
        if (old) {
          const newTopics = [
            {
              ...data,
              user_created: queryQuery.data?.id || '',
              date_created: DateTime.now().toISODate(),
              user_updated: queryQuery.data?.id || '',
            },
            ...old,
          ];
          return newTopics;
        }
        return old;
      });

      return { previousTopics };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(queryKey, context?.previousTopics);
    },
  });
}

export type UpdateTopicMutation = Pick<Topic, 'id' | 'title' | 'icon' | 'sort'>;

export function useTopicUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTopicMutation) =>
      directus.request(
        updateItem('topics', data.id, {
          ...data,
          sort: undefined,
          id: undefined,
        }),
      ),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTopics = queryClient.getQueryData(queryKey) as TopicQueryItem[];

      queryClient.setQueryData(queryKey, (old: TopicQueryItem[] | undefined) => {
        if (old) {
          const newTopics = [...old];
          const i = newTopics.findIndex((topic) => topic.id === data.id);

          if (i !== -1) {
            newTopics[i] = {
              ...newTopics[i],
              ...data,
            };
          }

          return newTopics;
        }
        return old;
      });

      return { previousTopics };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(queryKey, context?.previousTopics);
    },
  });
}

export function useTopicDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => directus.request(deleteItem('topics', id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTopics = queryClient.getQueryData(queryKey) as TopicQueryItem[];

      queryClient.setQueryData(queryKey, (old: TopicQueryItem[] | undefined) => {
        if (old) {
          return old.filter((topic) => topic.id !== id);
        }
        return old;
      });

      return { previousTopics };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(queryKey, context?.previousTopics);
    },
  });
}

export function useTopicInvite(shareToken: string) {
  return useQuery({
    queryKey: ['invite-tokens', shareToken],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/topics/${shareToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!resp.ok) {
        throw new Error('Invalid invite link');
      }
      const data = await resp.json();
      return data as {
        id: string;
        title: string;
        user_created: { id: string; first_name: string; last_name: string };
      };
    },
    retry: false,
  });
}

export function useTopicAcceptInviteMutation(shareToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/topics/accept-invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareToken,
        }),
      });
      if (!resp.ok) {
        throw new Error('Failed to use invite link');
      }
      const data = await resp.json();
      return data as TopicQueryItem;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (old: Topic[] | undefined) => {
        if (old) {
          const newTopics = [
            {
              ...data,
            },
            ...old,
          ];
          return newTopics;
        }
        return old;
      });
    },
  });
}
