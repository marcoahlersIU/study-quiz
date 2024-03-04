import { ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { cn, getValidChildren } from '@/lib/utils';

export type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'span'>;

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  /* The visual separator between each breadcrumb item */
  separator?: React.ReactNode;
  /**
   * If `true`, adds a separator between each breadcrumb item.
   * @default true
   */
  addSeparator?: boolean;
}

export interface BreadcrumbItemProps extends BreadcrumbProps {
  /**
   * If `true`, indicates that the breadcrumb item is active, adds
   * `aria-current=page` and renders a `span`
   */
  isCurrentPage?: boolean;
  isLastChild?: boolean;
}

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<'a'>,
    Pick<BreadcrumbItemProps, 'isCurrentPage'> {
  to: string;
}

export const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <span
        className={cn('mx-1 opacity-50', className)}
        role="presentation"
        {...props}
        ref={forwardedRef}
      />
    );
  },
);

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, isCurrentPage, ...props }, forwardedRef) => {
    const Comp = (isCurrentPage ? 'span' : Link) as 'a';

    return (
      <Comp
        className={cn(
          'text-xs font-medium underline-offset-4 aria-[current]:opacity-60 [&:not([aria-current])]:hover:underline',
          className,
        )}
        aria-current={isCurrentPage ? 'page' : undefined}
        {...props}
        ref={forwardedRef}
      />
    );
  },
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      children,
      className,
      separator = <ChevronRight className="h-4 w-4" />,
      addSeparator = true,
      ...props
    },
    forwardedRef,
  ) => {
    const validChildren = getValidChildren(children);
    const clones = validChildren.map((child, index) => {
      return React.cloneElement(child, {
        addSeparator,
        separator,
        isLastChild: validChildren.length === index + 1,
      });
    });

    return (
      <nav
        className={cn('relative break-words', className)}
        aria-label="breadcrumb"
        {...props}
        ref={forwardedRef}
      >
        <ol className="flex items-center">{clones}</ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    { children, className, isCurrentPage, isLastChild, separator, addSeparator, ...props },
    forwardedRef,
  ) => {
    const validChildren = getValidChildren(children);
    const clones = validChildren.map((child) => {
      if (child.type === BreadcrumbLink) {
        return React.cloneElement(child, { isCurrentPage });
      }

      if (child.type === BreadcrumbSeparator) {
        return React.cloneElement(child, {
          children: separator || child.props.children,
        });
      }

      return child;
    });

    return (
      <li className={cn('inline-flex items-center', className)} {...props} ref={forwardedRef}>
        {clones}
        {!isLastChild && addSeparator && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
      </li>
    );
  },
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
