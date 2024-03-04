import { ParticipantQueryItem, useParticipants } from '@/api/participants';

import { useExercise, useExerciseInvitateMutation } from '@/api/exercises';
import { useTopic } from '@/api/topics';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Icons,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '../ui';

import { useUser } from '@/api/user';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import directus from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';

export function Participants({ topicId, exerciseId }: { topicId: string; exerciseId?: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const participantsQuery = useParticipants(topicId);
  const topic = useTopic(topicId);

  const userQuery = useUser();
  const exerciseQuery = useExercise(exerciseId);
  const exerciseInviteMutation = useExerciseInvitateMutation(topicId);

  const isQuizCreator = exerciseQuery.data?.user_created === userQuery.data?.id;
  const quizIsStared =
    location.pathname.endsWith('answer-questions') || location.pathname.endsWith('evaluation');

  const participants = !quizIsStared
    ? participantsQuery.data
    : participantsQuery.data?.filter(
        (participant) =>
          !!exerciseQuery.data?.participants.find(
            (exerciseParticipant) => exerciseParticipant.user === participant.id,
          ),
      );

  const queryClient = useQueryClient();

  useEffect(() => {
    const subscribeToUserEvent = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('directus_users', {
        query: {
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
          fields: ['id', 'first_name', 'last_name', 'last_ping'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update') {
            queryClient.setQueryData(
              ['participants', topicId],
              (old: ParticipantQueryItem[] | undefined) => {
                if (old) {
                  const newParticipants = [...old];
                  item.data.forEach((updatedUser) => {
                    const index = newParticipants.findIndex(
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      (participant) => participant.id === updatedUser.id,
                    );
                    if (index !== -1) {
                      newParticipants[index] = {
                        ...newParticipants[index],
                        ...updatedUser,
                      };
                    }
                  });

                  return newParticipants;
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    const promise = subscribeToUserEvent();
    return () => {
      promise.then((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const { toast } = useToast();

  const inviteParticipant = async (participantId: string) => {
    try {
      await exerciseInviteMutation.mutateAsync({
        id: uuidv4(),
        topic: topicId,
        exercise: exerciseId || '',
        user: participantId,
        status: 'invited',
      });
    } catch (err: any) {
      if (err?.errors?.some((error: any) => error?.extensions?.code === 'ALREADY_IN_QUIZ')) {
        toast({
          title: t('alreadyInQuiz.title'),
          description: t('alreadyInQuiz.description'),
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="grid gap-6 p-4 pr-6">
      {participants?.map((participant) => {
        const exerciseParticipant = exerciseQuery.data?.participants.find(
          (exerciseParticipant) => exerciseParticipant.user === participant.id,
        );

        const isOnline = participant.last_ping
          ? DateTime.fromISO(participant.last_ping) > DateTime.now().minus({ minute: 1 })
          : false;
        const isAbsent = participant.last_ping
          ? DateTime.fromISO(participant.last_ping) < DateTime.now().minus({ seconds: 30 })
          : false;

        const inviteQuizButton = (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs shadow-sm min-w-[90px]"
            disabled={!isQuizCreator}
            onClick={() => inviteParticipant(participant.id)}
          >
            <Icons.sendHorizonal className="w-3.5 h-3.5 mr-1.5 stroke-[1.5px]" />
            {t('invite')}
          </Button>
        );

        return (
          <div key={participant.id} className="flex items-center justify-between">
            <div className="w-full flex justify-between items-center space-x-4">
              <div className="flex items-center space-x-4 min-w-[160px]">
                <Avatar className="w-8 h-8 relative overflow-visible">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-[0.65rem] p-1">
                    {participant.first_name.charAt(0).toUpperCase()}
                    {participant.last_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                  {isOnline && (
                    <div
                      className={cn(
                        'h-1.5 w-1.5 absolute left-[-3px] top-[-3px] rounded-full',
                        isOnline && 'bg-green-500/90',
                        isOnline && isAbsent && '!bg-yellow-500/90',
                      )}
                    />
                  )}
                </Avatar>
                <div>
                  <p className="text-xs font-medium leading-none">
                    {participant.first_name} {participant.last_name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {!exerciseId
                      ? topic.data?.user_created === participant.id
                        ? t('creator')
                        : t('participant')
                      : exerciseQuery.data?.user_created === participant.id
                        ? t('quizCreator')
                        : t('participant')}
                  </p>
                </div>
              </div>
              {exerciseId && !quizIsStared && (
                <>
                  {!exerciseParticipant &&
                    (!isQuizCreator ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div>{inviteQuizButton}</div>
                          </TooltipTrigger>

                          <TooltipContent side="left" sideOffset={30}>
                            <p>{t('onlyQuizCreatorCanInvite')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      inviteQuizButton
                    ))}

                  {exerciseParticipant && (
                    <Badge
                      className="text-xs font-medium h-7 px-2 text-[11px] min-w-[90px] justify-center shadow-sm "
                      variant="outline"
                    >
                      {exerciseParticipant.status === 'invited' && (
                        <Icons.mailCheck className={cn('w-3.5 h-3.5 mr-1.5 stroke-[1.75px] ')} />
                      )}
                      {exerciseParticipant.status === 'accepted' && (
                        <Icons.check
                          className={cn('w-3.5 h-3.5 mr-1.5 stroke-[1.75px] text-green-500/90')}
                        />
                      )}
                      {exerciseParticipant.status === 'rejected' && (
                        <Icons.xCircle
                          className={cn('w-3.5 h-3.5 mr-1.5 stroke-[1.75px] text-red-500/90')}
                        />
                      )}

                      {t(exerciseParticipant.status)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
