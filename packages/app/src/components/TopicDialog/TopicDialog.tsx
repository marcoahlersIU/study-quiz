import { TopicQueryItem, useTopicSaveMutation, useTopicUpdateMutation } from '@/api/topics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Icons,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import IconSelect, { SelectableIcon } from '../IconSelect/IconSelect';

type TopicDialogProps = {
  open: boolean;
  setOpen: (val: boolean) => void;
  editTopic?: TopicQueryItem;
  topics: TopicQueryItem[];
};

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(256),
  icon: z.string(),
  sort: z.number(),
});

type TopicForm = z.infer<typeof formSchema> & {
  icon: SelectableIcon;
};

export function TopicDialog({ open, setOpen, editTopic, topics }: TopicDialogProps) {
  const { t } = useTranslation();

  const form = useForm<TopicForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: uuidv4(),
      title: '',
      icon: 'GraduationCap',
      sort: (topics[0]?.sort || 0) + 1,
    },
  });

  useEffect(() => {
    form.setValue('sort', (topics[0]?.sort || 0) + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  useEffect(() => {
    if (editTopic) {
      form.setValue('id', editTopic.id);
      form.setValue('title', editTopic.title);
      form.setValue('icon', editTopic.icon || 'GraduationCap');
      form.setValue('sort', editTopic.sort !== null ? editTopic.sort : (topics[0]?.sort || 0) + 1);
    } else {
      form.setValue('id', uuidv4());
      form.setValue('title', '');
      form.setValue('icon', 'GraduationCap');
      form.setValue('sort', (topics[0]?.sort || 0) + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTopic, open]);

  const navigation = useNavigate();

  const saveTopicMutation = useTopicSaveMutation();
  const updateTopicMutation = useTopicUpdateMutation();

  async function onSubmit(values: TopicForm) {
    if (!editTopic) {
      await saveTopicMutation.mutateAsync(values);
      navigation(`/app/topics/${values.id}`);
    } else {
      updateTopicMutation.mutate(values);
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{!editTopic ? t('newTopic') : t('editTopic')}</DialogTitle>
              <DialogDescription>{t('newTopicDescription')}</DialogDescription>
            </DialogHeader>

            <div className="flex items-start gap-2 my-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconSelect
                        selectedIcon={field.value}
                        onSelect={(icon) => field.onChange(icon)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder={t('title')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {saveTopicMutation.status === 'pending' ? (
                  <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.save className="w-4 h-4 stroke-[1.75px] mr-2" />
                )}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
