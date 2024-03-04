import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Icons,
} from '@/components/ui';

import {} from '@/components/ui';
import { cn } from '@/lib/utils';

import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { TopicQueryItem, useTopics } from '@/api/topics';
import { LucideIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { selectableIcons } from '../IconSelect';
import { TopicDialog } from '../TopicDialog';

import { useUser } from '@/api/user';
import { DeleteTopicDialog } from '../DeleteTopicDialog';
import { ThemeMode, useTheme } from '../theme-provider';
import { Dropdown } from './Dropdown';
import { MenuSidebarContext } from './MenuSidebarContext';
import { useUsersActiveExercise } from '@/api/exercises';

function MenuItem({
  Icon,
  children,
  onClick,
  active,
}: {
  Icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn('w-full justify-start px-2 h-8 relative', active && 'bg-accent')}
      onClick={() => onClick && onClick()}
    >
      <Icon className="mr-2 w-4 h-4 stroke-[1.75px]" />
      <span className="truncate text-xs">{children}</span>
    </Button>
  );
}

function TopicMenuItem({
  topic,
  onEdit,
  onDelete,
}: {
  topic: TopicQueryItem;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const usersActiveExercises = useUsersActiveExercise();
  const activeTopicExercise = usersActiveExercises.data?.find(
    (exercise) => exercise.topic === topic.id,
  );

  const { pathname } = useLocation();

  const Icon = topic.icon
    ? selectableIcons[topic.icon] || Icons.graduationCap
    : Icons.graduationCap;

  const { t } = useTranslation();

  const [showMoreButton, setShowMoreButton] = useState(false);
  const [showDropDownMenu, setShowDropDownMenu] = useState(false);

  return (
    <Button
      onMouseOver={() => setShowMoreButton(true)}
      onMouseOut={() => setShowMoreButton(false)}
      size="sm"
      variant="ghost"
      className={cn(
        'w-full justify-between px-2 h-8 relative',
        pathname.startsWith(`/app/topics/${topic.id}`) && 'bg-accent',
      )}
    >
      <div className="flex items-center min-w-0">
        <Icon className="mr-2 w-4 h-4 stroke-[1.75px]" />
        <span className="truncate text-xs">{topic.title}</span>
        {activeTopicExercise && (
          <span className="flex h-[5px] min-w-[5px] rounded-full bg-primary mx-2" />
        )}
      </div>

      {(onEdit || onDelete) && (
        <>
          <DropdownMenu open={showDropDownMenu} onOpenChange={(val) => setShowDropDownMenu(val)}>
            <DropdownMenuTrigger asChild>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  setShowDropDownMenu(true);
                }}
                className={cn(
                  'h-full flex items-center text-muted-foreground hover:text-foreground',
                  !showMoreButton && !showDropDownMenu && 'opacity-0',
                  showDropDownMenu && 'text-foreground',
                )}
              >
                <Icons.moreHorizontal className="w-4 h-4 stroke-[1.75px]" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="" side="bottom" align="start">
              {onEdit && (
                <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEdit()}>
                  <Icons.pencil className="w-4 h-4 storke-[1.5px]"></Icons.pencil>
                  {t('edit')}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onDelete()}>
                  <Icons.trash className="w-4 h-4 storke-[1.5px]"></Icons.trash>
                  {t('delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </Button>
  );
}

function MenuTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('text-xs px-2 pb-1 text-muted-foreground font-bold', className)}>
      {children}
    </div>
  );
}

export function MenuSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mode, setThemeMode, isDarkMode } = useTheme();
  const userQuery = useUser();

  const { t } = useTranslation();

  const topicsQuery = useTopics();

  const { open, setOpen } = useContext(MenuSidebarContext);
  const [editTopic, setEditTopic] = useState<TopicQueryItem | undefined>();
  const [openTopicDialog, setOpenTopicDialog] = useState(false);

  const [deleteTopic, setDeleteTopic] = useState<TopicQueryItem | undefined>();
  const [openDeleteTopicDialog, setOpenDeleteTopicDialog] = useState(false);

  const [showCloseSidebarButton, setShowCloseSidebarButton] = useState(false);

  const topics = topicsQuery.data?.filter((topic) => topic.user_created === userQuery.data?.id);
  const sharedTopics = topicsQuery.data?.filter(
    (topic) => topic.user_created !== userQuery.data?.id,
  );

  return (
    <div
      onMouseOver={() => setShowCloseSidebarButton(true)}
      onMouseLeave={() => setShowCloseSidebarButton(false)}
    >
      <aside className={cn('h-screen w-60', !open && 'hidden')} aria-label="Sidebar">
        <div className="flex h-full flex-col overflow-y-auto border-r">
          <div className="p-2 w-full flex justify-between gap-1">
            <Dropdown />
            <div>
              <Button
                onClick={() => setOpen(false)}
                size="icon"
                variant="ghost"
                className={cn(
                  'h-9 w-[18px] opacity-0 transition-opacity',
                  showCloseSidebarButton && 'opacity-100',
                )}
              >
                <Icons.chevronLeft className="h-4 w-4 stroke-[1.75px]"></Icons.chevronLeft>
              </Button>
            </div>
          </div>

          <div className="px-2 space-y-4">
            <div>
              <div className="space-y-0.5">
                <MenuItem
                  Icon={Icons.settings}
                  active={pathname.includes('/app/settings')}
                  onClick={() => {
                    navigate('/app/settings');
                  }}
                >
                  {t('settings')}
                </MenuItem>

                <MenuItem
                  Icon={Icons.plusCircle}
                  onClick={() => {
                    setEditTopic(undefined);
                    setOpenTopicDialog(true);
                  }}
                >
                  {t('newTopic')}
                </MenuItem>
              </div>
            </div>
            {!!topics?.length && (
              <div>
                <MenuTitle>{t('topics')}</MenuTitle>
                <div className="space-y-0.5">
                  {topics.map((topic) => {
                    return (
                      <Link className="block" key={topic.id} to={`/app/topics/${topic.id}`}>
                        <TopicMenuItem
                          topic={topic}
                          onEdit={() => {
                            setEditTopic(topic);
                            setOpenTopicDialog(true);
                          }}
                          onDelete={() => {
                            setDeleteTopic(topic);
                            setOpenDeleteTopicDialog(true);
                          }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {!!sharedTopics?.length && (
              <div>
                <MenuTitle>{t('sharedTopics')}</MenuTitle>
                <div className="space-y-0.5">
                  {sharedTopics.map((topic) => {
                    return (
                      <Link className="block" key={topic.id} to={`/app/topics/${topic.id}`}>
                        <TopicMenuItem topic={topic} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto p-2 flex justify-between gap-1 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  {!isDarkMode ? (
                    <Icons.sun className="w-4 h-4 stroke-[1.75px]" />
                  ) : (
                    <Icons.moon className="w-4 h-4 stroke-[1.75px]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ml-2 w-14">
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(val) => setThemeMode(val as ThemeMode)}
                >
                  {['light', 'dark', 'system'].map((mode) => (
                    <DropdownMenuRadioItem key={mode} value={mode}>
                      {t(mode)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      <TopicDialog
        open={openTopicDialog}
        setOpen={(val) => {
          setEditTopic(undefined);
          setOpenTopicDialog(val);
        }}
        editTopic={editTopic}
        topics={topicsQuery.data || []}
      />
      <DeleteTopicDialog
        open={openDeleteTopicDialog}
        setOpen={(val) => {
          setDeleteTopic(undefined);
          setOpenDeleteTopicDialog(val);
        }}
        topic={deleteTopic}
      />
    </div>
  );
}
