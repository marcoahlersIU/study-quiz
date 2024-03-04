import { useContext, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Icons } from '@/components/ui';

import { useTranslation } from 'react-i18next';
import { MenuSidebarContext } from '../Sidebar/MenuSidebarContext';
import { TopicTitle } from './TopicTitle';

type RoutesBreadcrumbDefinition = {
  path: string | (() => string);
  element: string | JSX.Element;
  routes?: RoutesBreadcrumbDefinition[];
};

export function Header({
  headerRightMenuRef,
}: {
  headerRightMenuRef: React.RefObject<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();

  const routes: RoutesBreadcrumbDefinition[] = [
    {
      path: '/app/topics',
      element: (
        <div className="flex items-center gap-2">
          <Icons.plusCircle className="w-4 h-4 stroke-[1.75px]"></Icons.plusCircle>
          <span>{t('firstTopic')}</span>
        </div>
      ),
    },
    {
      path: () => `/app/topics/${params?.topicId || ''}`,
      element: <TopicTitle id={params?.topicId || ''} />,
      routes: [
        {
          path: () => `/app/topics/${params?.topicId || ''}/exercises/${params.exerciseId}`,
          element: t('quiz'),
        },
      ],
    },

    {
      path: '/app/settings',
      element: (
        <div className="flex items-center gap-2">
          <Icons.settings className="w-4 h-4 stroke-[1.75px]"></Icons.settings>
          <span>{t('settings')}</span>
        </div>
      ),
    },

    {
      path: '/app/topic-invite',
      element: (
        <div className="flex items-center gap-2">
          <Icons.share className="w-4 h-4 stroke-[1.75px]" />
          <span>{t('acceptTopicInvite')}</span>
        </div>
      ),
    },
  ];

  const getRoutes = () => {
    const matchedRoutes: RoutesBreadcrumbDefinition[] = [];

    const findRoute = (
      currentRoutes: RoutesBreadcrumbDefinition[],
    ): undefined | RoutesBreadcrumbDefinition => {
      const matchedRoute = currentRoutes
        .filter((currentRoute) => {
          const path =
            typeof currentRoute.path === 'function' ? currentRoute.path() : currentRoute.path;
          return location.pathname.startsWith(path);
        })
        .sort((a, b) => {
          const pathA = typeof a.path === 'function' ? a.path() : a.path;
          const pathB = typeof b.path === 'function' ? b.path() : b.path;
          return pathB.length - pathA.length;
        })[0];

      if (matchedRoute) matchedRoutes.push(matchedRoute);
      if (matchedRoute?.routes) {
        const matchedChildRoute = findRoute(matchedRoute.routes);
        if (matchedChildRoute) return matchedChildRoute;
      }
      return matchedRoute;
    };

    findRoute(routes);
    return matchedRoutes;
  };

  const matchedRoutes = getRoutes();
  const lastRoute = matchedRoutes[matchedRoutes.length - 1];

  useEffect(() => {
    if (lastRoute?.element && typeof lastRoute.element === 'string') {
      document.title = lastRoute.element;
    }
  }, [lastRoute]);

  const { open, setOpen } = useContext(MenuSidebarContext);

  return (
    <div className="flex justify-between h-[53px] w-full items-center border-b px-4 gap-2">
      {!open && (
        <div>
          <Button
            onClick={() => setOpen(true)}
            size="icon"
            variant="ghost"
            className="h-9 w-[18px]"
          >
            <Icons.chevronRight className="h-4 w-4 stroke-[1.75px]"></Icons.chevronRight>
          </Button>
        </div>
      )}

      <div className="flex justify-between w-full items-center">
        <Breadcrumb>
          {matchedRoutes.map((route) => {
            const path = typeof route.path === 'string' ? route.path : route.path();
            return (
              <BreadcrumbItem key={path}>
                <BreadcrumbLink to={path}>{route.element}</BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
        <div id="header-right-menu" ref={headerRightMenuRef}></div>
      </div>
    </div>
  );
}
