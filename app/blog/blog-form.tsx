'use client';

import { useActionState } from 'react';
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from '@conform-to/react';
import type { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { blogFormSchema } from '@/actions/blog-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  submitLabel = '登録',
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

  return (
    <form
      {...getFormProps(form)}
      action={action}
      className="flex max-w-md flex-col gap-3"
    >
      {form.errors?.map(e => (
        <p key={e} className="text-sm text-destructive">
          {e}
        </p>
      ))}
      <div className="flex flex-col gap-2">
        <Label htmlFor={fields.title.id}>タイトル</Label>
        <Input {...getInputProps(fields.title, { type: 'text' })} />
        {fields.title.errors?.map(e => (
          <p key={e} className="text-sm text-destructive">
            {e}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={fields.body.id}>本文</Label>
        <Textarea {...getTextareaProps(fields.body)} rows={6} />
        {fields.body.errors?.map(e => (
          <p key={e} className="text-sm text-destructive">
            {e}
          </p>
        ))}
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
