import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TextareaAutoResize = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const textarea = React.useRef<HTMLTextAreaElement | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function resizeTextarea() {
    if (textarea?.current) {
      textarea.current.style.height = 'auto';
      textarea.current.style.height = textarea.current.scrollHeight + 'px';
    }
  }

  React.useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

  React.useEffect(() => {
    if (textarea?.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === textarea.current) {
            resizeTextarea();
          }
        }
      });

      resizeObserver.observe(textarea.current);

      return () => {
        if (textarea.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          resizeObserver.unobserve(textarea.current);
        }
      };
    }
  }, []);

  return (
    <Textarea
      {...props}
      ref={textarea}
      onInput={(val) => {
        resizeTextarea();
        if (props.onInput) {
          props.onInput(val);
        }
      }}
    />
  );
});
TextareaAutoResize.displayName = 'TextareaAutoResize';

export { Textarea, TextareaAutoResize };
