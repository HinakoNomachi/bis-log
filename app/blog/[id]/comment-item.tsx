'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm, getFormProps, getTextareaProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { Pencil } from 'lucide-react';
import { commentFormSchema } from '@/actions/comment-schema';
import { updateComment } from '@/actions/comment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DeleteCommentButton } from './delete-comment-button';
import type { CommentPublic } from './comment-list';

type CommentItemProps = {
  comment: CommentPublic;
  blogId: number;
  isAuthor: boolean;
};

export function CommentItem({ comment, blogId, isAuthor }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const isEdited =
    comment.updatedAt.getTime() !== comment.createdAt.getTime();

  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            @{comment.authorName ?? '不明'}
          </span>
          <span>{comment.createdAt.toLocaleString('ja-JP')}</span>
          {isEdited && <span>(編集済み)</span>}
        </div>
        {isAuthor && !editing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="編集"
              onClick={() => setEditing(true)}
            >
              <Pencil />
            </Button>
            <DeleteCommentButton commentId={comment.id} blogId={blogId} />
          </div>
        )}
      </div>
      {editing ? (
        <EditForm
          comment={comment}
          blogId={blogId}
          onDone={() => setEditing(false)}
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap text-foreground">
          {comment.body}
        </p>
      )}
    </div>
  );
}

type EditFormProps = {
  comment: CommentPublic;
  blogId: number;
  onDone: () => void;
};

function EditForm({ comment, blogId, onDone }: EditFormProps) {
  const action = updateComment.bind(null, comment.id, blogId);
  const [lastResult, formAction, isPending] = useActionState(action, undefined);
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { body: comment.body },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: commentFormSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  useEffect(() => {
    if (!isPending && lastResult?.status === 'success') {
      onDone();
    }
  }, [lastResult, isPending, onDone]);

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
      <Textarea {...getTextareaProps(fields.body)} rows={4} />
      {fields.body.errors?.map(e => (
        <p key={e} className="text-sm text-destructive">
          {e}
        </p>
      ))}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDone}
          disabled={isPending}
        >
          キャンセル
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? '更新中…' : '更新'}
        </Button>
      </div>
    </form>
  );
}
