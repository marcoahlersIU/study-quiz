import { useDeleteUserMutation, useLogoutMutation } from '@/api/user';
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  Input,
} from '@/components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import z from 'zod';

export function AccountSettings() {
  const { t } = useTranslation();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const formSchema = z.object({
    confirmDeletion: z.string().refine((confirmText) => confirmText === 'delete account', {
      message: t('invalidConfirmationInput'),
    }),
  });

  type ConfirmAccountDeletionForm = z.infer<typeof formSchema>;

  const defaultValues = {
    confirmDeletion: '',
  };

  const form = useForm<ConfirmAccountDeletionForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const deleteUserMutation = useDeleteUserMutation();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  async function onSubmit() {
    await deleteUserMutation.mutateAsync();
    try {
      await logoutMutation.mutateAsync();
    } catch {}

    navigate('/auth');
  }

  return (
    <>
      <Card className="lg:max-w-[50%]">
        <CardHeader>
          <CardTitle className="leading-none text-base">{t('deleteAccount')}</CardTitle>
          <CardDescription>{t('deleteAccountDescription')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full"
            size="sm"
            variant="destructive"
            onClick={() => setOpenConfirmDialog(true)}
          >
            {t('deleteAccount')}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={openConfirmDialog} onOpenChange={(val) => setOpenConfirmDialog(val)}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{t('confirmAccountDeletion')}</DialogTitle>
                <DialogDescription>{t('confirmAccountDeletionDescription')}</DialogDescription>
              </DialogHeader>

              <FormField
                control={form.control}
                name="confirmDeletion"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={t('confirmDeletionInput')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="destructive" type="submit">
                  {deleteUserMutation.status === 'pending' ? (
                    <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.trash className="w-4 h-4 stroke-[1.75px] mr-2" />
                  )}
                  {t('deleteAccount')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
