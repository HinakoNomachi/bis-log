'use server';

import { headers } from 'next/headers';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return submission.reply({ formErrors: ['ログインが必要です'] });
    }
    await db.insert(blogsTable).values({
      title: submission.value.title,
      body: submission.value.body,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('createBlog failed:', error);
    return submission.reply({
      formErrors: ['登録に失敗しました。時間をおいて再度お試しください'],
    });
  }
  revalidatePath('/top');
  redirect('/top');
}

export async function updateBlog(
  id: number,
  _prev: SubmissionResult<string[]> | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, { schema: blogFormSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return submission.reply({ formErrors: ['ログインが必要です'] });
    }
    const result = await db
      .update(blogsTable)
      .set({
        title: submission.value.title,
        body: submission.value.body,
      })
      .where(
        and(eq(blogsTable.id, id), eq(blogsTable.userId, session.user.id))
      )
      .returning({ id: blogsTable.id });
    if (result.length === 0) {
      return submission.reply({
        formErrors: ['更新権限がないか、対象が見つかりませんでした'],
      });
    }
  } catch (error) {
    console.error('updateBlog failed:', error);
    return submission.reply({
      formErrors: ['更新に失敗しました。時間をおいて再度お試しください'],
    });
  }
  revalidatePath('/top');
  revalidatePath(`/blog/${id}`);
  redirect(`/blog/${id}`);
}

export async function deleteBlog(id: number): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('ログインが必要です');
  }
  try {
    const result = await db
      .delete(blogsTable)
      .where(
        and(eq(blogsTable.id, id), eq(blogsTable.userId, session.user.id))
      )
      .returning({ id: blogsTable.id });
    if (result.length === 0) {
      throw new Error('削除権限がないか、対象が見つかりませんでした');
    }
  } catch (error) {
    console.error('deleteBlog failed:', error);
    throw error;
  }
  revalidatePath('/top');
  redirect('/top');
}
