import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

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

import { useTranslation } from 'react-i18next';
import z from 'zod';

export function Register() {
  const { t } = useTranslation();

  const [registeredUser, setRegisteredUser] = useState(false);

  const formSchema = z
    .object({
      email: z.string().min(1),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      password: z.string().min(1).max(256),
      passwordRepeat: z.string().min(1).max(256),
    })
    .refine((data) => data.password === data.passwordRepeat, {
      message: t('invalidPasswordRepeat'),
      path: ['passwordRepeat'],
    });

  type RegisterForm = z.infer<typeof formSchema>;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultValues: RegisterForm = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordRepeat: '',
  };

  const form = useForm<RegisterForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: RegisterForm) {
    setIsLoading(true);

    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      }),
    });

    if (resp.status === 201) {
      setRegisteredUser(true);
    } else {
      const data = await resp.json();
      if (data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        form.setError('email', { message: t('emailAlreadyUsed') });
      }
    }

    setIsLoading(false);
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {!registeredUser ? t('createAnAccount') : t('completedRegistration')}{' '}
        </h1>
        <p className="text-sm text-muted-foreground">
          {!registeredUser
            ? t('createAnAccountDescription')
            : t('completedRegistrationDescritpion')}
        </p>
      </div>
      <div className="grid gap-6">
        {!registeredUser && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('password')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordRepeat"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t('passwordRepeat')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordRepeat')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className="text-[0.7rem] text-muted-foreground col-span-2"
                dangerouslySetInnerHTML={{ __html: t('acceptAgbs') }}
              />

              <Button disabled={isLoading} className="col-span-2">
                {isLoading && <Icons.loading className="mr-2 h-4 w-4 animate-spin" />}
                {t('register')}
              </Button>
            </form>
          </Form>
        )}

        <Separator />

        <Link className="text-center text-sm text-muted-foreground underline" to="/auth">
          {t('alreadyHaveAnAccount')}
        </Link>
      </div>
    </>
  );
}
