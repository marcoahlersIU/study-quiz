import { Merge, RemoveRelationships, readUsers } from '@directus/sdk';
import { useQuery } from '@tanstack/react-query';
import directus from '.';
import { DirectusUser, Schema } from './types';

const fields = ['id', 'first_name', 'last_name', 'last_ping'] as const;

export type ParticipantQueryItem = Merge<
  Pick<
    RemoveRelationships<Schema, object & DirectusUser>,
    'id' | 'first_name' | 'last_name' | 'last_ping'
  >,
  object
>;

export function useParticipants(topicId: string) {
  return useQuery({
    queryKey: ['participants', topicId],
    queryFn: () =>
      directus.request(
        readUsers({
          fields,
          filter: {
            _or: [
              {
                shared_topics: {
                  topic: {
                    id: {
                      _eq: topicId,
                    },
                  },
                },
              },
              {
                topics: {
                  id: {
                    _eq: topicId,
                  },
                },
              },
            ],
          },
          limit: -1,
        }),
      ) as Promise<ParticipantQueryItem[]>,
  });
}
