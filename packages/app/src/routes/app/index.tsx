import { ScrollArea } from '@/components';

import { Header } from '@/components/Header';
import { HeaderContext } from '@/components/Header/HeaderContext';
import { MenuSidebar, RightSidebar } from '@/components/Sidebar';
import { MenuSidebarContext } from '@/components/Sidebar/MenuSidebarContext';
import { RightSidebarContext } from '@/components/Sidebar/RightSidebarContext';
import { useExerciseInvites } from '@/hooks/use-exercise-invites';
import { usePingUser } from '@/hooks/use-ping-user';
import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

export function ApplicationLayout() {
  const rightSidebarRef = useRef(null);
  const rightHeaderMenuRef = useRef(null);

  const [menuSidebarOpen, setMenuSidebarOpen] = useState(true);

  useExerciseInvites();
  usePingUser();

  return (
    <MenuSidebarContext.Provider value={{ open: menuSidebarOpen, setOpen: setMenuSidebarOpen }}>
      <RightSidebarContext.Provider value={rightSidebarRef}>
        <HeaderContext.Provider value={rightHeaderMenuRef}>
          <div className="flex">
            <MenuSidebar />
            <div className="h-screen w-full min-w-0">
              <Header headerRightMenuRef={rightHeaderMenuRef} />
              <ScrollArea className="h-[calc(100vh-52px)]">
                <Outlet />
              </ScrollArea>
            </div>
            <RightSidebar ref={rightSidebarRef} />
          </div>
        </HeaderContext.Provider>
      </RightSidebarContext.Provider>
    </MenuSidebarContext.Provider>
  );
}
