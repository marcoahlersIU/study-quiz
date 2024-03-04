import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';

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

import { passwordReset } from '@directus/sdk';
import { useTranslation } from 'react-i18next';
import directus from '@/api';
import z from 'zod';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return '';
  }
}

export function PasswordReset() {
  const { t } = useTranslation();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const navigate = useNavigate();

  if (!token) navigate('/auth/request-password-reset');
  const email = parseJwt(token || '').email;

  const formSchema = z
    .object({
      password: z.string().min(8).max(256),
      passwordRepeat: z.string().min(8).max(256),
    })
    .refine((data) => data.password === data.passwordRepeat, {
      message: t('invalidPasswordRepeat'),
      path: ['passwordRepeat'],
    });

  type PasswordResetForm = z.infer<typeof formSchema>;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newPasswordSet, setNewPasswordSet] = useState<boolean>(false);
  const [tokenInvalidOrExpired, setTokenInvalidOrExpired] = useState<boolean>(false);

  const defaultValues = {
    password: '',
    passwordRepeat: '',
  };

  const form = useForm<PasswordResetForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: PasswordResetForm) {
    try {
      setIsLoading(true);
      await directus.request(passwordReset(token || '', values.password));
      setNewPasswordSet(true);
    } catch (err) {
      setTokenInvalidOrExpired(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('resetPassword')}</h1>
        {!newPasswordSet && !tokenInvalidOrExpired && (
          <p className="text-sm text-muted-foreground">{t('resetPasswordDescription')}</p>
        )}
      </div>
      <div className="grid gap-6">
        {!newPasswordSet && !tokenInvalidOrExpired && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('newPassword')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordRepeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordRepeat')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordRepeat')} {...field} />
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
        )}

        {newPasswordSet && (
          <div className="text-center ">
            <div className="text-sm">{t('passwordWasUpdated')}</div>
            <Link to={`/auth?${new URLSearchParams([['email', email || '']]).toString()}`}>
              <Button variant="link" className="underline">
                {t('goToLogin')}
              </Button>
            </Link>
          </div>
        )}

        {tokenInvalidOrExpired && (
          <div className="text-center text-sm text-destructive">
            {t('passwordResetTokenExpired')}
          </div>
        )}

        <Separator />
        <Link className="text-center text-sm text-muted-foreground hover:underline" to="/auth">
          {t('rememberedPassword')}
        </Link>
      </div>
    </>
  );
}
