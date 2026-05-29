'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
} from 'nuqs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const qParser = parseAsString.withDefault('').withOptions({ shallow: false });
const tagsParser = parseAsArrayOf(parseAsString)
  .withDefault([])
  .withOptions({ shallow: false });

type BlogSearchProps = {
  allTags: string[];
};

export function BlogSearch({ allTags }: BlogSearchProps) {
  const [q, setQ] = useQueryState('q', qParser);
  const [tags, setTags] = useQueryState('tags', tagsParser);

  const [draftQ, setDraftQ] = useState(q);

  const chipContainerRef = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = chipContainerRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [allTags]);

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    setTags(next.length > 0 ? next : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftQ.trim();
    setQ(trimmed.length > 0 ? trimmed : null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={draftQ}
          onChange={e => setDraftQ(e.target.value)}
          placeholder="タイトル・本文を検索（スペース区切りでAND）"
          className="h-10 pr-9 pl-9 focus-visible:border-[var(--qiita-green)] focus-visible:ring-0"
          aria-label="記事を検索"
        />
        {draftQ.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setDraftQ('');
              setQ(null);
            }}
            aria-label="入力をクリア"
            className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mt-2 flex items-start gap-2">
          <span className="mt-1 shrink-0 text-xs font-medium text-muted-foreground">
            タグ
          </span>
          <ul
            ref={chipContainerRef}
            className={cn(
              'flex flex-1 gap-1.5',
              expanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'
            )}
          >
            {allTags.map(tag => {
              const selected = tags.includes(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={selected}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border-[var(--qiita-green)] bg-[var(--qiita-green)] text-white'
                        : 'border-border bg-muted text-foreground hover:bg-muted/70'
                    )}
                  >
                    {tag}
                    {selected && <X className="size-3" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {(overflows || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="shrink-0 self-start text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {expanded ? '折りたたむ' : 'もっと見る'}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
