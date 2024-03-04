import { useTopics } from '@/api/topics';
import { Button, Icons } from '@/components';
import { EmptyPlaceholder } from '@/components/EmptyPlaceholder';
import { TopicDialog } from '@/components/TopicDialog';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function NoTopic() {
  const { t } = useTranslation();

  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const navigate = useNavigate();
  const topicsQuery = useTopics();

  useEffect(() => {
    if (topicsQuery.data?.length) {
      navigate(`/app/topics/${topicsQuery.data[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsQuery.data]);

  return (
    <div className="p-4">
      {!topicsQuery.isLoading && (
        <>
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="fileText" />
            <EmptyPlaceholder.Title>{t('noTopicsCreated')}</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              {t('noTopicsCreatedDescription')}
            </EmptyPlaceholder.Description>
            <Button size="sm" onClick={() => setOpenTopicDialog(true)}>
              <Icons.plusCircle className="w-4 h-4 stroke-[1.75px] mr-2" />
              {t('newTopic')}
            </Button>
          </EmptyPlaceholder>

          <TopicDialog
            open={openTopicDialog}
            setOpen={(val) => {
              setOpenTopicDialog(val);
            }}
            topics={[]}
          />
        </>
      )}
    </div>
  );
}
