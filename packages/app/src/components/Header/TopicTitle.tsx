import { useEffect } from 'react';

import { Skeleton } from '@/components/ui';

import { useTranslation } from 'react-i18next';
import { useTopic } from '@/api/topics';
import { selectableIcons } from '../IconSelect';

export function TopicTitle({ id }: { id: string }) {
  const { t } = useTranslation();

  const query = useTopic(id);

  useEffect(() => {
    if (query.data?.title) {
      document.title = query.data?.title;
    }
  }, [query.data, t]);

  const Icon = query.data?.icon
    ? selectableIcons[query.data?.icon] || selectableIcons.GraduationCap
    : selectableIcons.GraduationCap;

  return (
    <div>
      {query.isInitialLoading ? (
        <Skeleton className="h-4 w-[200px]" />
      ) : (
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 stroke-[1.75px]"></Icon>
          <span>{query.data?.title}</span>
        </div>
      )}
    </div>
  );
}
