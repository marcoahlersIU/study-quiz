import { Dispatch, SetStateAction, createContext } from 'react';

export const MenuSidebarContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: true,
  setOpen: () => {},
});
