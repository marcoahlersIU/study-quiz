import {
  QuestionQueryItem,
  useQuestionSaveMutation,
  useQuestionUpdateMutation,
} from '@/api/questions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  ScrollArea,
  Separator,
  Switch,
  Textarea,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { EmptyPlaceholder } from '../EmptyPlaceholder';

type QuestionDialogProps = {
  open: boolean;
  setOpen: (val: boolean) => void;
  editQuestion?: QuestionQueryItem;
  questions: QuestionQueryItem[];
  topicId: string;
};

export function QuestionDialog({
  open,
  setOpen,
  editQuestion,
  questions,
  topicId,
}: QuestionDialogProps) {
  const { t } = useTranslation();

  const formSchema = z.object({
    id: z.string(),
    content: z.string().min(1).max(256),
    sort: z.number(),
    answers: z
      .array(
        z.object({
          id: z.string(),
          content: z.string().min(1),
          correct_answer: z.boolean(),
          reason: z.union([z.string(), z.null()]),
        }),
      )
      .refine((answers) => answers.length >= 2, {
        message: t('atLeastTwoAnswersRequired'),
      })
      .refine((answers) => answers.some((answer) => !!answer.correct_answer), {
        message: t('missingCorrectAnswer'),
      }),
  });

  type QuestionForm = z.infer<typeof formSchema>;

  const form = useForm<QuestionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: uuidv4(),
      content: '',
      sort: (questions[0]?.sort || 0) + 1,
    },
  });

  useEffect(() => {
    form.setValue('sort', (questions[0]?.sort || 0) + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    if (editQuestion) {
      form.clearErrors();
      form.setValue('id', editQuestion.id);
      form.setValue('content', editQuestion.content);
      form.setValue(
        'sort',
        editQuestion.sort !== null ? editQuestion.sort : (questions[0]?.sort || 0) + 1,
      );
      form.setValue('answers', editQuestion.answers);
    } else {
      form.setValue('id', uuidv4());
      form.setValue('content', '');
      form.setValue('sort', (questions[0]?.sort || 0) + 1);
      form.setValue('answers', [
        {
          id: uuidv4(),
          content: '',
          correct_answer: false,
          reason: null,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuestion, open]);

  const { fields, append, remove } = useFieldArray({
    name: 'answers',
    control: form.control,
  });

  const saveQuestionMutation = useQuestionSaveMutation(topicId);
  const updateQuestionMutation = useQuestionUpdateMutation(topicId);

  async function onSubmit(values: QuestionForm) {
    if (!editQuestion) {
      await saveQuestionMutation.mutateAsync(values);
    } else {
      updateQuestionMutation.mutate(values);
    }

    setOpen(false);
  }

  const changeCorrectAnswer = (val: boolean, index: number, onChangeHandler: any) => {
    if (val) {
      form.setValue(
        'answers',
        form.getValues('answers').map((answer) => ({ ...answer, correct_answer: false })),
      );
    }

    setTimeout(() => {
      onChangeHandler(val);
      form.trigger('answers');
    }, 10);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="lg:max-w-[1024px] xl:max-w-[1280px] p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6">
              <DialogTitle>{!editQuestion ? t('newQuestion') : t('editQuestion')}</DialogTitle>
              <DialogDescription>{t('questionDescription')}</DialogDescription>
            </div>
            <Separator />

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t('question')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 lg:grid-cols-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col gap-3">
                        <div className="flex justify-between">
                          <FormField
                            control={form.control}
                            name={`answers.${index}.correct_answer`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3">
                                <FormLabel className="text-xs font-medium ">
                                  {t('correctAnswer')}
                                </FormLabel>
                                <FormControl>
                                  <Switch
                                    className="!mt-0"
                                    checked={field.value}
                                    onCheckedChange={(val) =>
                                      changeCorrectAnswer(val, index, field.onChange)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Icons.minus className="w-4 h-4 stroke-[1.75px]" />
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name={`answers.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea {...field} className="min-h-[180px]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`answers.${index}.reason`}
                          render={({ field: localField }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">
                                {t('explanation')}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...localField}
                                  value={localField.value || ''}
                                  className="min-h-[90px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}

                    {fields.length < 4 && (
                      <EmptyPlaceholder className="min-h-[358px]">
                        <EmptyPlaceholder.Title className="mt-0">
                          {t('addAnswer')}
                        </EmptyPlaceholder.Title>
                        <EmptyPlaceholder.Description className="mb-2">
                          {t('addNewAnswerDescription')}
                        </EmptyPlaceholder.Description>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            append({
                              id: uuidv4(),
                              content: '',
                              correct_answer: false,
                              reason: null,
                            })
                          }
                        >
                          <Icons.plus className="w-4 h-4 stroke-[1.75px] mr-2" />
                          {t('addAnswer')}
                        </Button>
                      </EmptyPlaceholder>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 flex justify-between items-center">
              <p id=":r13:-form-item-message" className="text-sm font-medium text-destructive">
                {form.formState.errors.answers?.root?.message &&
                  form.formState.errors.answers?.root?.message}
              </p>
              <Button type="submit">
                {saveQuestionMutation.status === 'pending' ? (
                  <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.save className="w-4 h-4 stroke-[1.75px] mr-2" />
                )}
                {t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
