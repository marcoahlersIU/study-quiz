import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  Separator,
} from '@/components';

import z from 'zod';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '@/api/user';

const formSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof formSchema>;

export function Login() {
  const { t } = useTranslation();
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || 'marco.ahlers+user-1@gridventures.de';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailUnverified, setEmailUnverified] = useState<boolean>(false);
  const [resendedVerficationEmail, setResendedVerificaitonEmail] = useState<boolean>(false);

  const defaultValues = {
    email: email || '',
    password: 'Test123$',
  };

  const form = useForm<LoginForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    form.setValue('email', email || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function onSubmit(values: LoginForm) {
    try {
      setEmailUnverified(false);
      setResendedVerificaitonEmail(false);
      setIsLoading(true);
      await loginMutation.mutateAsync(values);
      navigate('/app/topics');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.errors[0]?.extensions?.code === 'USER_SUSPENDED') {
        form.setError('root', { message: t('userDeactivated') });
      } else if (err?.errors[0]?.extensions?.code === 'UNVERIFIED') {
        setEmailUnverified(true);
      } else {
        form.setError('root', { message: t('invalidEmailOrPassword') });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function resendVerificationEmail() {
    const resp = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/accounts/resend-verification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.getValues('email'),
        }),
      },
    );

    if (resp.status === 200) {
      setResendedVerificaitonEmail(true);
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('welcomeBack')}</h1>
        <p className="text-sm text-muted-foreground">{t('loginDescription')}</p>
      </div>
      <div className="grid gap-6">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('password')} {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    <Link
                      className="text-center text-sm text-muted-foreground underline"
                      to="/auth/request-reset-password"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </FormDescription>
                </FormItem>
              )}
            />

            {form.formState.errors?.root?.message && (
              <FormMessage>{form.formState.errors.root?.message}</FormMessage>
            )}

            {emailUnverified && !resendedVerficationEmail && (
              <div className="text-sm text-destructive">
                {t('emailIsNotVerified')}{' '}
                <span
                  className="underline px-0 cursor-pointer"
                  onClick={() => resendVerificationEmail()}
                >
                  {t('clickHereToResendVerifcationEmail')}
                </span>
              </div>
            )}

            {resendedVerficationEmail && (
              <div className="text-sm text-muted-foreground">{t('resendedVerificationEmail')}</div>
            )}

            <Button disabled={isLoading} className="w-full">
              {isLoading && <Icons.loading className="mr-2 h-4 w-4 animate-spin" />}
              {t('signIn')}
            </Button>
          </form>
        </Form>

        <Separator />

        <Link className="text-center text-sm text-muted-foreground underline" to="/auth/register">
          {t('doNotHaveAnAccount')}
        </Link>
      </div>
    </>
  );
}
