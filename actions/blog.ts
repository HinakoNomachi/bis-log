'use server';

import { headers } from 'next/headers';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/dom';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { blogsTable } from '@/db/schema';
import { blogFormSchema } from './blog-schema';

export async function createBlog(
  _prev: SubmissionResult<string[]> | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, { schema: blogFormSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return submission.reply({ formErrors: ['ログインが必要です'] });
  }
  await db.insert(blogsTable).values({
    title: submission.value.title,
    body: submission.value.body,
    userId: session.user.id,
  });
  revalidatePath('/top');
  redirect('/top');
}
