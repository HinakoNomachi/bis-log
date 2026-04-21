'use client';

import { useActionState } from 'react';
import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { createBlog } from '@/actions/blog';
import { blogFormSchema } from '@/actions/blog-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BlogForm() {
  const [lastResult, action, isPending] = useActionState(createBlog, undefined);
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { title: '' },
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
      <div className="flex flex-col gap-2">
        <Label htmlFor={fields.title.id}>タイトル</Label>
        <Input {...getInputProps(fields.title, { type: 'text' })} />
        {fields.title.errors?.map(e => (
          <p key={e} className="text-sm text-destructive">
            {e}
          </p>
        ))}
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? '送信中…' : '登録'}
      </Button>
    </form>
  );
}
