import { RightSidebarContext } from '@/components/Sidebar/RightSidebarContext';
import { TopicsSidebar } from '@/components/TopicsSidebar';
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useParams } from 'react-router-dom';

export function TopicLayout() {
  const rightSidebarRef = useContext(RightSidebarContext);
  const [rightSidebar, setRightSidebar] = useState<HTMLDivElement | undefined>(undefined);

  useEffect(() => {
    if (rightSidebarRef?.current) {
      setRightSidebar(rightSidebarRef.current);
    }
  }, [rightSidebarRef]);

  const { topicId, exerciseId } = useParams();

  return (
    <div>
      <Outlet />
      {rightSidebar &&
        createPortal(
          <TopicsSidebar topicId={topicId || ''} exerciseId={exerciseId} />,
          rightSidebar,
        )}
    </div>
  );
}
