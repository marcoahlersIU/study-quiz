import { useTranslation } from 'react-i18next';
import {
  Button,
  Icons,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '../ui';

import { RightSidebarResizeContainer, RightSidebarTitle } from '../Sidebar';
import { useTopic } from '@/api/topics';
import { useUser } from '@/api/user';
import { Participants } from './Participants';
import { useLocation } from 'react-router-dom';

async function copyToClipboard(textToCopy: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;

    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } finally {
      textArea.remove();
    }
  }
}

export function TopicsSidebar({ topicId, exerciseId }: { topicId: string; exerciseId?: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();

  const isInQuizView = location.pathname.includes('/exercises/');

  const userQuery = useUser();
  const topicQuery = useTopic(topicId);

  const copyTopicInviteLink = async () => {
    const token = JSON.parse(localStorage.getItem('authenticationData') || '{}')?.access_token;

    const resp = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/topics/${topicQuery.data?.id}/share-token`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    const data = await resp.json();

    await copyToClipboard(
      `${import.meta.env.VITE_APP_URL}/app/topic-invite?shareToken=${data.shareToken}`,
    );
    toast({
      title: t('inviteLinkWasCopied.title'),
      description: t('inviteLinkWasCopied.description', { topicTitle: topicQuery.data?.title }),
    });
  };

  return (
    <div className="relative">
      <RightSidebarResizeContainer name="participantsSidebar" defaultwidth="360px">
        <RightSidebarTitle>
          <div className="flex items-center gap-2 min-w-0 text-xs">
            <Icons.users className="shrink-0 w-4 h-4 stroke-[1.75px]" />
            {!isInQuizView ? t('participants') : t('lobby')}
          </div>
          {!exerciseId && userQuery.data?.id === topicQuery.data?.user_created && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-7 w-7 text-xs"
                    onClick={() => copyTopicInviteLink()}
                  >
                    <Icons.share className="w-4 h-4 stroke-[1.75px] " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('copyInviteLink')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </RightSidebarTitle>
        <div className="h-[calc(100vh-53px)]">
          <Participants topicId={topicId} exerciseId={exerciseId} />
        </div>
      </RightSidebarResizeContainer>
    </div>
  );
}
