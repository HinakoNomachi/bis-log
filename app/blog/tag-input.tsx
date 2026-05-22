'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { X } from 'lucide-react';
import { MAX_TAGS, MAX_TAG_LENGTH } from '@/actions/blog-schema';
import { searchTags } from '@/data/tags';

type TagInputProps = {
  name: string;
  defaultValue?: string[];
  errors?: string[];
};

export function TagInput({ name, defaultValue = [], errors }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const listboxId = useId();
  const requestIdRef = useRef(0);

  useEffect(() => {
    const query = draft.trim();
    if (!query) return;
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      const result = await searchTags(query, tags);
      if (requestId !== requestIdRef.current) return;
      setSuggestions(result);
      setActiveIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [draft, tags]);

  const commit = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.includes(value)) {
      setDraft('');
      return;
    }
    setTags([...tags, value]);
    setDraft('');
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const remove = (target: string) => {
    setTags(tags.filter(t => t !== target));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i =>
          i <= 0 ? suggestions.length - 1 : i - 1
        );
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        commit(suggestions[activeIndex]);
      } else {
        commit(draft);
      }
      return;
    }
    if (e.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const showSuggestions = open && suggestions.length > 0;

  return (
    <div>
      <input type="hidden" name={name} value={tags.join(',')} />
      <div className="relative">
        <label
          htmlFor={inputId}
          className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        >
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`タグ「${tag}」を削除`}
                className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            type="text"
            value={draft}
            maxLength={MAX_TAG_LENGTH}
            onChange={e => {
              const value = e.target.value;
              setDraft(value);
              setOpen(true);
              if (!value.trim()) {
                setSuggestions([]);
                setActiveIndex(-1);
              }
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              commit(draft);
              setOpen(false);
            }}
            placeholder={
              tags.length === 0 ? 'タグを入力してEnter / カンマで確定' : ''
            }
            disabled={tags.length >= MAX_TAGS}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </label>
        {showSuggestions && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute top-full left-0 z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-md"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={e => {
                  e.preventDefault();
                  commit(suggestion);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-3 py-1.5 text-sm ${
                  index === activeIndex
                    ? 'bg-muted text-foreground'
                    : 'text-foreground'
                }`}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {tags.length}/{MAX_TAGS}
      </p>
      {errors?.map(e => (
        <p key={e} className="mt-1 text-sm text-destructive">
          {e}
        </p>
      ))}
    </div>
  );
}
