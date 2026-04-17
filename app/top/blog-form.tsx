'use client';

import { useActionState } from 'react';
import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { createBlog } from '@/app/actions/blog';
import { blogFormSchema } from '@/app/actions/blog-schema';

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
      <div className="flex flex-col gap-1">
        <label
          htmlFor={fields.title.id}
          className="text-sm font-medium text-neutral-700"
        >
          タイトル
        </label>
        <input
          className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
          {...getInputProps(fields.title, { type: 'text' })}
        />
        {fields.title.errors?.map(e => (
          <p key={e} className="text-sm text-red-600">
            {e}
          </p>
        ))}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {isPending ? '送信中…' : '登録'}
      </button>
    </form>
  );
}
