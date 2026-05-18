'use client';

import { useActionState, useState } from 'react';
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from '@conform-to/react';
import type { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogFormSchema } from '@/actions/blog-schema';

type BlogFormAction = (
  prev: SubmissionResult<string[]> | undefined,
  formData: FormData
) => Promise<SubmissionResult<string[]>>;

type BlogFormProps = {
  action: BlogFormAction;
  defaultValue?: { title: string; body: string };
  submitLabel?: string;
  pendingLabel?: string;
};

export function BlogForm({
  action: serverAction,
  defaultValue = { title: '', body: '' },
  submitLabel = '投稿する',
  pendingLabel = '送信中…',
}: BlogFormProps) {
  const [lastResult, action, isPending] = useActionState(
    serverAction,
    undefined
  );
  const [form, fields] = useForm({
    lastResult,
    defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: blogFormSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  const [body, setBody] = useState(defaultValue.body);

  return (
    <form {...getFormProps(form)} action={action} className="flex flex-col gap-4">
      {form.errors && form.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-destructive/10 px-4 py-2"
        >
          {form.errors.map(e => (
            <p key={e} className="text-sm text-destructive">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-background px-4 py-3 sm:px-6">
        <input
          {...getInputProps(fields.title, { type: 'text' })}
          placeholder="タイトル"
          className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
        />
        {fields.title.errors?.map(e => (
          <p key={e} className="mt-1 text-sm text-destructive">
            {e}
          </p>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-2">
        <div className="border-b border-border md:border-r md:border-b-0">
          <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
            本文
          </div>
          <textarea
            {...getTextareaProps(fields.body)}
            onInput={e => setBody((e.target as HTMLTextAreaElement).value)}
            placeholder="プログラミング知識をMarkdown記法で書いて共有しよう"
            className="block min-h-[60vh] w-full resize-none bg-background px-4 py-4 font-mono text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {fields.body.errors?.map(e => (
            <p key={e} className="px-4 pb-2 text-sm text-destructive">
              {e}
            </p>
          ))}
        </div>

        <div>
          <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
            プレビュー
          </div>
          <div className="min-h-[60vh] bg-background px-4 py-4">
            {body.trim().length === 0 ? (
              <p className="text-sm text-muted-foreground/60">
                ここにプレビューが表示されます
              </p>
            ) : (
              <article className="prose prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-md px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--qiita-green)' }}
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
