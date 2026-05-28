'use client';

import { useActionState } from 'react';
import {
  useForm,
  getFormProps,
  getTextareaProps,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { commentFormSchema } from '@/actions/comment-schema';
import { createComment } from '@/actions/comment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type CommentFormProps = {
  blogId: number;
};

export function CommentForm({ blogId }: CommentFormProps) {
  const action = createComment.bind(null, blogId);
  const [lastResult, formAction, isPending] = useActionState(action, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: commentFormSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <form
      {...getFormProps(form)}
      action={formAction}
      className="flex flex-col gap-2"
    >
      {form.errors && form.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-destructive/10 px-3 py-2"
        >
          {form.errors.map(e => (
            <p key={e} className="text-sm text-destructive">
              {e}
            </p>
          ))}
        </div>
      )}
      <Textarea
        {...getTextareaProps(fields.body)}
        placeholder="コメントを入力…"
        rows={4}
      />
      {fields.body.errors?.map(e => (
        <p key={e} className="text-sm text-destructive">
          {e}
        </p>
      ))}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? '送信中…' : '投稿する'}
        </Button>
      </div>
    </form>
  );
}
