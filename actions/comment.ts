'use server';

import { headers } from 'next/headers';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/react';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { comments } from '@/db/schema';
import { commentFormSchema } from './comment-schema';

export async function createComment(
  blogId: number,
  _prev: SubmissionResult<string[]> | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, { schema: commentFormSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return submission.reply({ formErrors: ['ログインが必要です'] });
    }
    await db.insert(comments).values({
      body: submission.value.body,
      blogId,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('createComment failed:', error);
    return submission.reply({
      formErrors: ['投稿に失敗しました。時間をおいて再度お試しください'],
    });
  }
  revalidatePath(`/blog/${blogId}`);
  return submission.reply({ resetForm: true });
}

export async function updateComment(
  commentId: number,
  blogId: number,
  _prev: SubmissionResult<string[]> | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, { schema: commentFormSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return submission.reply({ formErrors: ['ログインが必要です'] });
    }
    const result = await db
      .update(comments)
      .set({ body: submission.value.body })
      .where(
        and(eq(comments.id, commentId), eq(comments.userId, session.user.id))
      )
      .returning({ id: comments.id });
    if (result.length === 0) {
      return submission.reply({
        formErrors: ['更新権限がないか、対象が見つかりませんでした'],
      });
    }
  } catch (error) {
    console.error('updateComment failed:', error);
    return submission.reply({
      formErrors: ['更新に失敗しました。時間をおいて再度お試しください'],
    });
  }
  revalidatePath(`/blog/${blogId}`);
  return submission.reply();
}

export type DeleteCommentError = { error: string };

export async function deleteComment(
  commentId: number,
  blogId: number
): Promise<DeleteCommentError | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: 'ログインが必要です' };
  }
  try {
    const result = await db
      .delete(comments)
      .where(
        and(eq(comments.id, commentId), eq(comments.userId, session.user.id))
      )
      .returning({ id: comments.id });
    if (result.length === 0) {
      return { error: '削除権限がないか、対象が見つかりませんでした' };
    }
  } catch (error) {
    console.error('deleteComment failed:', error);
    return { error: '削除に失敗しました。時間をおいて再度お試しください' };
  }
  revalidatePath(`/blog/${blogId}`);
}
