import directus from '@/api';
import { useExerciseSaveMutation, useUsersActiveExercise } from '@/api/exercises';
import { QuestionQueryItem, useQuestions } from '@/api/questions';
import {
  Button,
  Icons,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components';
import { EmptyPlaceholder } from '@/components/EmptyPlaceholder';
import { HeaderContext } from '@/components/Header/HeaderContext';
import { QuestionDialog } from '@/components/QuestionDialog/QuestionDialog';
import { QuestionItem } from '@/components/QuestionItem/QuestionItem';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export function Questions() {
  const { t } = useTranslation();
  const { topicId } = useParams();

  const questionsQuery = useQuestions(topicId || '');

  const [editQuestion, setEditQuestion] = useState<QuestionQueryItem | undefined>();
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);

  const exerciseSaveMutation = useExerciseSaveMutation(topicId || '');

  const rightHeaderMenuRef = useContext(HeaderContext);
  const [rightHeaderMenu, setRightHeaderMenu] = useState<HTMLDivElement | undefined>(undefined);

  useEffect(() => {
    if (rightHeaderMenuRef?.current) {
      setRightHeaderMenu(rightHeaderMenuRef.current);
    }
  }, [rightHeaderMenuRef]);

  const navigate = useNavigate();

  const usersActiveExercises = useUsersActiveExercise();
  const activeTopicExercise = usersActiveExercises.data?.find(
    (exercise) => exercise.topic === topicId,
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    const subscribeToQuestionsEvents = async () => {
      const { subscription, unsubscribe } = await directus.subscribe('questions', {
        query: {
          filter: {
            topic: { _eq: topicId },
          },

          fields: [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            'id,sort,topic,content,answers.id,answers.content,answers.correct_answer,answers.reason,user_created.id,user_created.first_name,user_created.last_name',
          ],
        },
      });

      (async () => {
        for await (const item of subscription) {
          if (item.event === 'update' || item.event === 'create') {
            queryClient.setQueryData(
              ['questions', topicId],
              (old: QuestionQueryItem[] | undefined) => {
                if (old) {
                  const newQuestions = [...old];

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  item.data.forEach((newQuestion: QuestionQueryItem) => {
                    const index = newQuestions.findIndex(
                      (question) => question.id === newQuestion.id,
                    );
                    if (index !== -1) {
                      newQuestions[index] = {
                        ...newQuestions[index],
                        ...newQuestion,
                      };
                    } else {
                      newQuestions.push(newQuestion);
                    }
                  });

                  return newQuestions;
                }
                return old;
              },
            );
          } else if (item.event === 'delete') {
            queryClient.setQueryData(
              ['questions', topicId],
              (old: QuestionQueryItem[] | undefined) => {
                if (old) {
                  const newQuestions = [...old];

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  item.data.forEach((questionId) => {
                    const index = newQuestions.findIndex((question) => question.id === questionId);
                    if (index !== -1) {
                      newQuestions.splice(index, 1);
                    }
                  });

                  return newQuestions;
                }
                return old;
              },
            );
          }
        }
      })();

      return unsubscribe;
    };

    const questionsPromise = subscribeToQuestionsEvents();

    return () => {
      questionsPromise.then((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startQuizButton = (
    <Button
      type="button"
      size="sm"
      className="h-7 px-2.5 text-xs shadow-sm"
      disabled={questionsQuery.status === 'success' && !questionsQuery.data?.length}
      onClick={async () => {
        const exercise = await exerciseSaveMutation.mutateAsync();
        navigate(`/app/topics/${topicId}/exercises/${exercise.id}`);
      }}
    >
      <Icons.play className="w-3.5 h-3.5 mr-1.5 stroke-[1.75px]" />
      {t('newQuiz')}
    </Button>
  );

  const [columns, setColumns] = useState('grid-cols-3');
  const gridParentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const adjustGridColumns = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      if (width < 600) {
        setColumns('grid-cols-1');
      } else if (width >= 600 && width < 900) {
        setColumns('grid-cols-2');
      } else if (width >= 900 && width < 1200) {
        setColumns('grid-cols-3');
      } else {
        setColumns('grid-cols-4');
      }
    };

    const observer = new ResizeObserver(adjustGridColumns);
    if (gridParentRef.current) {
      observer.observe(gridParentRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-53px)] relative w-full">
      <div ref={gridParentRef} className={cn('grid gap-4 p-4 mb-[4.5rem]', columns)}>
        {questionsQuery.status !== 'pending' && questionsQuery.data?.length === 0 && (
          <EmptyPlaceholder className="min-h-[203px]">
            <EmptyPlaceholder.Title className="mt-0">
              {t('addFirstQuestion')}
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description className="mb-2">
              {t('addFirstQuestionDescription')}
            </EmptyPlaceholder.Description>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setEditQuestion(undefined);
                setOpenQuestionDialog(true);
              }}
            >
              <Icons.plus className="w-4 h-4  mr-2" />
              {t('newQuestion')}
            </Button>
          </EmptyPlaceholder>
        )}

        {questionsQuery?.data?.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            onEdit={() => {
              setEditQuestion(question);
              setOpenQuestionDialog(true);
            }}
          />
        ))}
      </div>

      {rightHeaderMenu &&
        createPortal(
          <div className="flex gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs shadow-sm"
              onClick={() => {
                setEditQuestion(undefined);
                setOpenQuestionDialog(true);
              }}
            >
              <Icons.plus className="w-3.5 h-3.5 mr-1.5 stroke-[1.75px]" />
              {t('newQuestion')}
            </Button>

            {!activeTopicExercise ? (
              !questionsQuery.data?.length ? (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div>{startQuizButton}</div>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>{t('atLeastOneQuestionRequired')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                startQuizButton
              )
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-7 px-2.5 text-xs shadow-sm animate-pulse"
                onClick={async () => {
                  navigate(`/app/topics/${topicId}/exercises/${activeTopicExercise?.id}`);
                }}
              >
                <Icons.play className="w-3.5 h-3.5 mr-1.5 stroke-[1.75px]" />
                {t('continueQuiz')}
              </Button>
            )}
          </div>,
          rightHeaderMenu,
        )}

      <QuestionDialog
        open={openQuestionDialog}
        setOpen={(val) => {
          setEditQuestion(undefined);
          setOpenQuestionDialog(val);
        }}
        editQuestion={editQuestion}
        questions={questionsQuery.data || []}
        topicId={topicId || ''}
      />
    </div>
  );
}
