import { Merge, RemoveRelationships, deleteUser, readMe, updateMe } from '@directus/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import directus from '.';
import { DirectusUser, Schema } from './types';

const queryKey = ['user'];

const fields = ['id', 'first_name', 'last_name', 'email', 'language', 'last_ping'] as const;

export type UserQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & DirectusUser>,
    'id' | 'first_name' | 'last_name' | 'email' | 'language' | 'last_ping'
  >,
  object
>;

export function useUser() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const token = await directus.getToken();

      if (token) {
        await directus.connect();
        return directus.request(readMe({ fields }));
      }

      return null;
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await directus.login(email, password, {});
      await directus.connect();
      const me = await directus.request(readMe({ fields }));
      queryClient.setQueryData(['user'], me);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await directus.logout();
      directus.disconnect();
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });
}

export function useUpdateUserMuation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      lastPing,
    }: {
      firstName?: string;
      lastName?: string;
      lastPing?: string;
    }) =>
      directus.request(
        updateMe({ first_name: firstName, last_name: lastName, last_ping: lastPing }, { fields }),
      ),
    onMutate: async (data) => {
      if (!data.lastPing) {
        await queryClient.cancelQueries({ queryKey });
        const previousMe = queryClient.getQueryData(queryKey) as UserQueryItem;
        queryClient.setQueryData(queryKey, (old: UserQueryItem | undefined) => {
          return { ...old, first_name: data.firstName, last_name: data.lastName };
        });
        return { previousMe };
      }
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(queryKey, context?.previousMe);
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const user = queryClient.getQueryData(queryKey) as UserQueryItem;
      return directus.request(deleteUser(user.id));
    },
  });
}
