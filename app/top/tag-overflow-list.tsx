'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type TagOverflowListProps = {
  tags: string[];
};

export function TagOverflowList({ tags }: TagOverflowListProps) {
  const ref = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <ul
        ref={ref}
        className={cn(
          'flex flex-1 gap-1.5',
          expanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'
        )}
      >
        {tags.map(tag => (
          <li
            key={tag}
            className="inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(v => !v);
          }}
          className="shrink-0 self-start text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {expanded ? '折りたたむ' : 'もっと見る'}
        </button>
      )}
    </div>
  );
}
