import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  Separator,
} from '@/components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from 'react-i18next';
import z from 'zod';
import directus from '@/api';
import { passwordRequest } from '@directus/sdk';

const formSchema = z.object({
  email: z.string().min(1),
});

type RequestPasswordResetForm = z.infer<typeof formSchema>;

export function RequestResetPassword() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newPasswordRequested, setNewPasswordRequested] = useState<boolean>(false);

  const defaultValues = {
    email: '',
  };

  const form = useForm<RequestPasswordResetForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: RequestPasswordResetForm) {
    try {
      setIsLoading(true);
      await directus.request(
        passwordRequest(values.email, `${import.meta.env.VITE_APP_URL}/auth/reset-password`),
      );
      setNewPasswordRequested(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('resetPassword')}</h1>
        {!newPasswordRequested && (
          <p className="text-sm text-muted-foreground">{t('requestPasswordResetDescription')}</p>
        )}
      </div>
      <div className="grid gap-6">
        {!newPasswordRequested ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('email')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isLoading} className="w-full">
                {isLoading && <Icons.loading className="mr-2 h-4 w-4 animate-spin" />}
                {t('resetPassword')}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center text-sm">{t('resetPasswordLinkSended')}</div>
        )}

        <Separator />
        <Link className="text-center text-sm text-muted-foreground hover:underline" to="/auth">
          {t('rememberedPassword')}
        </Link>
      </div>
    </>
  );
}
