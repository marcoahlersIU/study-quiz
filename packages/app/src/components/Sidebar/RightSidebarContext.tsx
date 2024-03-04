import React from 'react';

export const RightSidebarContext = React.createContext<React.RefObject<HTMLDivElement> | null>(
  null,
);
