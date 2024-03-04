import { useTopicAcceptInviteMutation, useTopicInvite, useTopics } from '@/api/topics';
import { useUser } from '@/api/user';
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icons,
} from '@/components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AcceptTopicInvite() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('shareToken');
  const userQuery = useUser();

  const topicsQuery = useTopics();

  useEffect(() => {
    if (!token) {
      navigate('/app/topics');
    }
  }, [token, navigate]);

  const topicInviteQuery = useTopicInvite(token || '');
  const acceptTopicInviteMutation = useTopicAcceptInviteMutation(token || '');

  const acceptInvite = async () => {
    const topic = await acceptTopicInviteMutation.mutateAsync();
    navigate(`/app/topics/${topic.id}`);
  };

  let error;
  if (topicInviteQuery.error) {
    error = t('invalidInviteLink');
  } else if (
    topicInviteQuery.data &&
    topicInviteQuery.data?.user_created.id === userQuery.data?.id
  ) {
    error = t('canNotInviteToOwnTopic');
  } else if (
    topicInviteQuery.data &&
    topicsQuery.data?.some((topic) => topic.id === topicInviteQuery.data?.id)
  ) {
    error = t('alreadyTopicParticipant');
  }
  return (
    <div className="p-4 h-[calc(100vh-52px)] flex items-center justify-center">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{t('acceptTopic.title')}</CardTitle>
          {!error && (
            <CardDescription>
              {t('acceptTopic.description', {
                topicTitle: topicInviteQuery.data?.title,
                creatorName: `${topicInviteQuery.data?.user_created.first_name} ${topicInviteQuery.data?.user_created.last_name}`,
              })}
            </CardDescription>
          )}
        </CardHeader>
        {topicInviteQuery.isLoading && <Icons.loading className="mx-auto h-4 w-4 animate-spin" />}
        <CardFooter className="flex flex-col space-y-4">
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}

          {!error && !topicInviteQuery.isLoading && (
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/app/topics')}>
                {t('reject')}
              </Button>
              <Button onClick={() => acceptInvite()}>{t('accept')}</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
