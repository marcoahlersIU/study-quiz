import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';

export const RightSidebar = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div>
      <aside className="h-screen" aria-label="Right-Sidebar">
        <div
          id="right-sidebar"
          ref={ref}
          className="flex h-full flex-col overflow-y-auto border-l"
        />
      </aside>
    </div>
  );
});
RightSidebar.displayName = 'RightSidebar';

export const RightSidebarResizeContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name: string;
    defaultwidth?: string;
  }
>((props, ref) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!sidebarRef.current || !isResizing) return;
    const newWidth = `${
      sidebarRef.current.offsetWidth +
      sidebarRef.current.getBoundingClientRect().left -
      event.clientX
    }px`;

    sidebarRef.current.style.width = newWidth;

    localStorage.setItem(props.name, newWidth);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  return (
    <div className="relative" {...props} ref={ref}>
      <div
        className="z-50 h-full absolute w-[6px] ml-[-3px] transition-colors hover:bg-primary hover:cursor-col-resize"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      ></div>
      <div
        ref={sidebarRef}
        className="h-full max-w-[50vw] z-10"
        style={{ width: localStorage.getItem(props.name) || props.defaultwidth || '420px' }}
      >
        {props.children}
      </div>
    </div>
  );
});
RightSidebarResizeContainer.displayName = 'RightSidebarResizeContainer';

export const RightSidebarTitle = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'h-[53px] border-b text-sm flex items-center justify-between px-4 gap-3',
        className,
      )}
      {...props}
    >
      {props.children}
    </div>
  ),
);
RightSidebarTitle.displayName = 'RightSidebarTitle';
