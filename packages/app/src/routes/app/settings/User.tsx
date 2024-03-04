import { useUpdateUserMuation, useUser } from '@/api/user';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  useToast,
} from '@/components';
import { useTranslation } from 'react-i18next';
import z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type UserSettingsForm = z.infer<typeof formSchema>;

export function UserSettings() {
  const { t } = useTranslation();
  const userQuery = useUser();
  const updateUserMutation = useUpdateUserMuation();
  const { toast } = useToast();

  const defaultValues = {
    firstName: userQuery.data?.first_name || '',
    lastName: userQuery.data?.last_name || '',
  };

  const form = useForm<UserSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: Pick<UserSettingsForm, 'firstName' | 'lastName'>) {
    if (updateUserMutation.status !== 'pending') {
      await updateUserMutation.mutateAsync(values);
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Icons.check className="w-5 h-5 text-green-500/90" />
            {t('yourChangesHaveBeenSaved')}
          </div>
        ) as any,
      });
    }
  }

  return (
    <Card className="lg:max-w-[50%]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="leading-none text-base">{t('userSettings')}</CardTitle>
            <CardDescription>{t('userSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('firstName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('lastName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="sm" disabled={updateUserMutation.status === 'pending'}>
              {updateUserMutation.status === 'pending' && (
                <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('save')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
