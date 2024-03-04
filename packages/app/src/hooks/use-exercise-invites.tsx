import directus from '@/api';
import { useExerciseAcceptInviteMutation } from '@/api/exercises';
import { ExerciseParticipant, Schema, Topic } from '@/api/types';
import { useUser } from '@/api/user';
import { Button, Icons, useToast } from '@/components';
import { Merge, RemoveRelationships, readItems, updateItem } from '@directus/sdk';
import { ToastAction } from '@radix-ui/react-toast';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const fields = ['id', 'exercise', 'user', 'status', { topic: ['id', 'title'] }] as const;

export type ExerciseParticipantQueryItem = Merge<
  Pick<ExerciseParticipant, 'id' | 'exercise' | 'user' | 'status'>,
  object
> & {
  topic: Merge<Pick<RemoveRelationships<Schema, object & Topic>, 'id' | 'title'>, object>;
};

export function useExerciseInvites() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userQuery = useUser();
  const { toast } = useToast();
  const acceptExerciseInviteMutation = useExerciseAcceptInviteMutation();

  const getTaost = (invite: ExerciseParticipantQueryItem) => {
    return {
      description: (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3">
            <Icons.mailQuestion className="min-w-5 h-5" />
            {t('exerciseInviteDescription', {
              topicTitle: invite.topic.title,
            })}
          </div>
          <div className="w-full flex justify-end gap-2">
            <ToastAction asChild altText={t('reject')}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  directus.request(
                    updateItem('exercise_participants', invite.id, {
                      status: 'rejected',
                    }),
                  );
                }}
                className="h-8"
              >
                <Icons.xCircle className="w-4 h-4 mr-1.5 stroke-[1.75px]" />
                {t('reject')}
              </Button>
            </ToastAction>

            <ToastAction asChild altText={t('accept')}>
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  await acceptExerciseInviteMutation.mutateAsync({ inviteId: invite.id });
                  navigate(`/app/topics/${invite.topic.id}/exercises/${invite.exercise}`);
                }}
                className="h-8"
              >
                <Icons.check className="w-4 h-4 mr-1.5 stroke-[1.75px]" />
                {t('accept')}
              </Button>
            </ToastAction>
          </div>
        </div>
      ),
      duration: Infinity,
    };
  };

  useEffect(() => {
    const getActiveExerciseInvites = async () => {
      const exerciseParticipants = await directus.request(
        readItems('exercise_participants', {
          filter: {
            user: { _eq: userQuery.data?.id },
            status: { _eq: 'invited' },
          },
          fields,
          limit: -1,
        }),
      );

      exerciseParticipants.forEach((invite) => toast(getTaost(invite)));
    };

    const subscripeToExerciseInviteEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('exercise_participants', {
        query: {
          filter: {
            user: { _eq: userQuery.data?.id },
            status: { _eq: 'invited' },
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          fields: ['*,topic.id,topic.title'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'create') {
            item.data.forEach((invite) => toast(getTaost(invite as any)));
          }
        }
      })();

      return unsubscribe;
    };

    if (userQuery.data) {
      getActiveExerciseInvites();
      const promise = subscripeToExerciseInviteEvents();

      return () => {
        promise.then((unsubscribe) => unsubscribe());
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
