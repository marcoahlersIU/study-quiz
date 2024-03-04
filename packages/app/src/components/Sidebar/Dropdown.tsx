import { useNavigate } from 'react-router-dom';

import { useLogoutMutation, useUser } from '@/api/user';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icons,
} from '@/components';

export function Dropdown() {
  const userQuery = useUser();
  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-full relative flex items-center justify-center gap-3 px-2"
        >
          <div className="flex w-full items-center">
            <Icons.graduationCap className="w-4 h-4 mr-2 stroke-[1.75px]" />
            <div className="max-w-[8rem] truncate">
              <span className="text-xs font-bold">Study-Quiz</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userQuery.data?.first_name} {userQuery.data?.last_name}
            </p>

            <p className="truncate text-xs leading-none text-muted-foreground">
              {userQuery.data?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            logoutMutation.mutate();
            navigate('/auth/login');
          }}
        >
          <Icons.logout className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
