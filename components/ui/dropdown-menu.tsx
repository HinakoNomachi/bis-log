'use client';

import * as React from 'react';
import { Menu } from '@base-ui/react/menu';

import { cn } from '@/lib/utils';

function DropdownMenu(props: Menu.Root.Props) {
  return <Menu.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ className, ...props }: Menu.Trigger.Props) {
  return (
    <Menu.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...positionerProps
}: Menu.Positioner.Props) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        sideOffset={sideOffset}
        className="z-[60]"
        {...positionerProps}
      >
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'min-w-[6rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md',
            'data-[starting-style]:animate-in data-[ending-style]:animate-out',
            'data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0',
            'data-[ending-style]:zoom-out-95 data-[starting-style]:zoom-in-95',
            className
          )}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

function DropdownMenuItem({ className, ...props }: Menu.Item.Props) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
