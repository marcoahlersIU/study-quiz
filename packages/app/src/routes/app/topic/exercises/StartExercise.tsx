import directus from '@/api';
import { ExerciseQueryItem, useExercise, useExerciseStartMutation } from '@/api/exercises';
import { useUser } from '@/api/user';
import { Button, Card, CardContent, Icons } from '@/components';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export function StartExercise() {
  const { topicId, exerciseId } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const userQuery = useUser();
  const exerciseQuery = useExercise(exerciseId);
  const exerciseStartMutation = useExerciseStartMutation(exerciseId || '', topicId || '');

  const isQuizCreator = exerciseQuery.data?.user_created === userQuery.data?.id;

  useEffect(() => {
    const subscribeToExerciseParticipantsEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('exercise_participants', {
        query: {
          filter: {
            exercise: { _eq: exerciseId },
          },

          fields: ['id', 'user', 'status'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update' || item.event === 'create') {
            queryClient.setQueryData(
              ['exercise', exerciseId],
              (old: ExerciseQueryItem | undefined) => {
                if (old) {
                  const newExercises = {
                    ...old,
                    participants: [...old.participants],
                  };

                  item.data.forEach((updatedParticipant) => {
                    if (item.event === 'update') {
                      const participantIndex = newExercises.participants.findIndex(
                        (participant) => participant.id === updatedParticipant.id,
                      );
                      if (participantIndex !== -1) {
                        newExercises.participants[participantIndex] = {
                          ...newExercises.participants[participantIndex],
                          ...updatedParticipant,
                          user: updatedParticipant.user as string,
                        };
                      }
                    } else {
                      newExercises.participants.push({
                        ...updatedParticipant,
                        user: updatedParticipant.user as string,
                      });
                    }
                  });

                  return newExercises;
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    const subscribeToExercisEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('exercises', {
        query: {
          filter: {
            id: { _eq: exerciseId },
          },

          fields: ['id', 'status', 'current_exercise_question'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update') {
            queryClient.setQueryData(
              ['exercise', exerciseId],
              (old: ExerciseQueryItem[] | undefined) => {
                if (old) {
                  const newExercises = {
                    ...old,
                    ...item.data[0],
                    current_exercise_question: item.data[0].current_exercise_question as string,
                  };

                  return newExercises;
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    const participantsPromise = subscribeToExerciseParticipantsEvents();
    const exercisePromise = subscribeToExercisEvents();
    return () => {
      participantsPromise.then((unsub) => unsub());
      exercisePromise.then((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startExercise = async () => {
    await exerciseStartMutation.mutateAsync();
    navigate(`/app/topics/${topicId}/exercises/${exerciseId}/answer-questions`);
  };

  useEffect(() => {
    if (exerciseQuery.data?.status === 'started') {
      navigate(`/app/topics/${topicId}/exercises/${exerciseId}/answer-questions`);
    }

    if (exerciseQuery.data?.status === 'finished') {
      navigate(`/app/topics/${topicId}/exercises/${exerciseId}/evaluation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, exerciseQuery.data]);

  return (
    <div className="p-4 w-full h-[calc(100vh-53px)] flex items-center justify-center">
      <Card className="w-[412px]">
        {isQuizCreator ? (
          <CardContent className="flex flex-col items-center space-y-4 p-8 pt-6">
            <div className="space-y-2 text-center">
              <div className="text-2xl font-bold">{t('startQuiz')}</div>
              <div className="text-muted-foreground text-sm">{t('startQuizDescription')}</div>
            </div>
            <Button className="w-full" onClick={() => startExercise()}>
              <Icons.play className="w-4 h-4 stroke-[1.75px] mr-2" />
              {t('start')}
            </Button>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col items-center space-y-4 p-8 pt-6">
            <div className="space-y-2 text-center">
              <div className="text-2xl font-bold">{t('Waiting...')}</div>
              <div className="text-muted-foreground text-sm">{t('waitingForQuizToStart')}</div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
