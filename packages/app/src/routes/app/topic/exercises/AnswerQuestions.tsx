import directus from '@/api';
import {
  ExerciseParticipantAnswerQueryItem,
  ExerciseQueryItem,
  useExercise,
  useExerciseNextQuestionMutation,
  useExerciseQuestion,
  useExerciseQuestionParticipantAnswers,
  useExerciseQuestionSaveParticipantAnswer,
  useExerciseQuestionShowResult,
} from '@/api/exercises';
import { useUser } from '@/api/user';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Icons,
  Label,
  Progress,
  RadioGroup,
  Separator,
} from '@/components';
import { cn } from '@/lib/utils';

import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

function calculateProgress(endDate: DateTime, totalDurationSeconds: number): number {
  const startDate = endDate.minus({ seconds: totalDurationSeconds });

  const now = DateTime.now();

  if (now < startDate) {
    return 0;
  } else if (now > endDate) {
    return 100;
  } else {
    const elapsedTime = now.diff(startDate, 'seconds').seconds;
    const progress = (elapsedTime / totalDurationSeconds) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}

export function AnswerQuestions() {
  const { exerciseId, topicId } = useParams();

  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const userQuery = useUser();
  const exerciseQuery = useExercise(exerciseId || '');
  const exerciseQuestion = useExerciseQuestion(exerciseQuery.data?.current_exercise_question);

  const exerciseParticipantAnswers = useExerciseQuestionParticipantAnswers(
    exerciseQuery.data?.current_exercise_question || undefined,
  );

  const saveParticipantAnswer = useExerciseQuestionSaveParticipantAnswer(
    exerciseQuery.data?.current_exercise_question || undefined,
  );
  const nextQuestionMutation = useExerciseNextQuestionMutation(exerciseId || '');

  const showExerciseQuestionResultMutation = useExerciseQuestionShowResult(
    exerciseQuery.data?.current_exercise_question || undefined,
  );

  const currentUsersParticipantAnswer = exerciseParticipantAnswers.data?.find(
    (answer) => answer.participant.user.id === userQuery.data?.id,
  );

  const correctAnswer = exerciseQuestion.data?.exercise_question_answers?.find(
    (answer) => answer.correct_answer,
  );

  const isQuizCreator = exerciseQuery.data?.user_created === userQuery.data?.id;

  useEffect(() => {
    const subscribeToExerciseEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('exercises', {
        query: {
          filter: {
            id: { _eq: exerciseQuery.data?.id },
          },

          fields: ['id', 'current_exercise_question', 'status'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update') {
            queryClient.setQueryData(
              ['exercise', exerciseQuery.data?.id],
              (old: ExerciseQueryItem | undefined) => {
                if (old) {
                  return {
                    ...old,
                    ...item.data[0],
                  };
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    if (exerciseId) {
      const promise = subscribeToExerciseEvents();

      return () => {
        promise.then((unsub) => unsub());
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  useEffect(() => {
    const subscribeToExerciseQuestionEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('exercise_questions', {
        query: {
          filter: {
            id: { _eq: exerciseQuery.data?.current_exercise_question as string },
          },

          fields: ['id', 'show_result', 'answer_end_time'],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update') {
            queryClient.setQueryData(
              ['exercise-question', exerciseQuery.data?.current_exercise_question],
              (old: ExerciseQueryItem | undefined) => {
                if (old) {
                  return {
                    ...old,
                    show_result: item.data[0].show_result,
                    answer_end_time: item.data[0].answer_end_time,
                  };
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    const subscribeToParticipantAnswerEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe(
        'exercise_participant_answers',
        {
          query: {
            filter: {
              exercise_question: { _eq: exerciseQuery.data?.current_exercise_question },
            },

            fields: ['id', 'selected_exercise_answer'],
          },
        },
      );

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update') {
            queryClient.setQueryData(
              ['exercise-participant-answers', exerciseQuery.data?.current_exercise_question],
              (old: ExerciseParticipantAnswerQueryItem[] | undefined) => {
                if (old) {
                  const newAnswers = [...old];

                  item.data.forEach((updatedAnswer) => {
                    const i = newAnswers.findIndex((answer) => answer.id === updatedAnswer.id);
                    if (i !== -1) {
                      newAnswers[i] = {
                        ...newAnswers[i],
                        ...updatedAnswer,
                        selected_exercise_answer: updatedAnswer.selected_exercise_answer as string,
                      };
                    }
                  });

                  return newAnswers;
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    if (exerciseQuery.data?.current_exercise_question) {
      const questionsPromise = subscribeToExerciseQuestionEvents();
      const participantAnswersPromise = subscribeToParticipantAnswerEvents();

      return () => {
        questionsPromise.then((unsub) => unsub());
        participantAnswersPromise.then((unsub) => unsub());
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseQuery.data?.current_exercise_question]);

  const navigate = useNavigate();

  useEffect(() => {
    if (exerciseQuery.data?.status === 'finished') {
      navigate(`/app/topics/${topicId}/exercises/${exerciseId}/evaluation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseQuery.data]);

  const [questionTimeoutProgress, setQuestionTimeoutProgress] = useState<number | null>(null);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      !exerciseQuestion.data?.show_result &&
      exerciseQuestion.data?.answer_end_time &&
      !questionTimeoutRef.current
    ) {
      questionTimeoutRef.current = setInterval(() => {
        if (exerciseQuestion.data?.answer_end_time) {
          const progressValue = calculateProgress(
            DateTime.fromISO(exerciseQuestion.data?.answer_end_time),
            30,
          );
          setQuestionTimeoutProgress(progressValue);
        }
      }, 50);
    }

    if (exerciseQuestion.data?.show_result && questionTimeoutRef.current) {
      if (questionTimeoutRef.current) {
        clearInterval(questionTimeoutRef.current);
        questionTimeoutRef.current = null;
      }

      setQuestionTimeoutProgress(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseQuestion.data, questionTimeoutProgress]);

  return (
    <div className="p-4 w-full h-[calc(100vh-53px)] flex items-center justify-center">
      <Card className="w-full max-w-[800px]">
        <CardHeader className="min-h-[72px]">
          <CardTitle className="text-base text-center">{exerciseQuestion?.data?.content}</CardTitle>
        </CardHeader>

        <CardContent className="min-h-[427px]">
          <div className="w-full space-y-4">
            <RadioGroup
              className="w-full grid lg:grid-cols-2 gap-4 min-h-[383px]"
              onValueChange={(answerId) => {
                if (!exerciseQuestion.data?.show_result && currentUsersParticipantAnswer) {
                  saveParticipantAnswer.mutate({
                    selected_exercise_answer: answerId,
                    participant: currentUsersParticipantAnswer.participant.id,
                  });
                }
              }}
              value={currentUsersParticipantAnswer?.selected_exercise_answer || ''}
            >
              {exerciseQuestion.data?.exercise_question_answers?.map((answer) => {
                const selectedParticipantAnswers = exerciseParticipantAnswers.data?.filter(
                  (participantAnswer) => participantAnswer.selected_exercise_answer === answer.id,
                );

                const isRightAnswer = correctAnswer?.id === answer.id;

                return (
                  <div key={answer.id} className="w-full relative">
                    <div className="absolute -right-4 -top-4 flex gap-1 items-center">
                      {selectedParticipantAnswers?.map((selectedParticipantAnswer) => (
                        <Avatar className="w-8 h-8 shadow-md" key={selectedParticipantAnswer.id}>
                          <AvatarImage src="" />
                          <AvatarFallback className="text-[0.65rem] p-1">
                            {selectedParticipantAnswer.participant.user.first_name
                              .charAt(0)
                              .toUpperCase()}
                            {selectedParticipantAnswer.participant.user.last_name
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <RadioGroupItem value={answer.id} id={answer.id} className="peer sr-only" />
                    <Label
                      htmlFor={answer.id}
                      className={cn(
                        'cursor-pointer flex-col gap-3 h-[183.5px] text-sm w-full flex text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary',
                        isRightAnswer &&
                          exerciseQuestion.data?.show_result &&
                          '!border-green-500/90',
                        !isRightAnswer &&
                          exerciseQuestion.data?.show_result &&
                          '!border-red-500/90',
                      )}
                    >
                      {answer.content}
                      {answer.reason && exerciseQuestion.data?.show_result && (
                        <>
                          <Separator />
                          <div className="text-xs text-muted-foreground">{answer.reason}</div>
                        </>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            <div className="h-1">
              {!exerciseQuestion.data?.show_result &&
                exerciseQuestion.data?.answer_end_time &&
                questionTimeoutProgress !== null && (
                  <Progress
                    value={questionTimeoutProgress}
                    className={cn('h-1', questionTimeoutProgress > 70 && 'animate-pulse ')}
                  />
                )}
            </div>
          </div>
        </CardContent>
        {isQuizCreator && (
          <CardFooter className="flex justify-center">
            {!exerciseQuestion.data?.show_result ? (
              <Button size="sm" onClick={() => showExerciseQuestionResultMutation.mutate()}>
                <Icons.mailQuestion className="mr-2 stroke-[1.75px] w-4 h-4" /> {t('showResult')}
              </Button>
            ) : (
              <Button size="sm" onClick={() => nextQuestionMutation.mutate()}>
                <Icons.arrowRight className="mr-2 stroke-[1.75px] w-4 h-4" /> {t('nextQuestion')}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
