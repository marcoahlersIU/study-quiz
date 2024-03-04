import { TopicQueryItem, useTopicDeleteMutation } from '@/api/topics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icons,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

type DeleteTopicDialogProps = {
  open: boolean;
  setOpen: (val: boolean) => void;
  topic?: TopicQueryItem;
};

export function DeleteTopicDialog({ open, setOpen, topic }: DeleteTopicDialogProps) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { topicId } = useParams();

  const deleteTopicMutation = useTopicDeleteMutation();

  async function deleteTopic() {
    if (topic) {
      await deleteTopicMutation.mutateAsync(topic?.id);
    }

    if (topicId && topicId === topic?.id) {
      navigate('/app/topics');
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteTopic')}</DialogTitle>
          <DialogDescription>
            {t('deleteTopicDescription', { topicTitle: topic?.title })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={() => deleteTopic()}>
            {deleteTopicMutation.status === 'pending' ? (
              <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.trash className="w-4 h-4 stroke-[1.75px] mr-2" />
            )}

            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
