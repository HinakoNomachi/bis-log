'use server';

import { headers } from 'next/headers';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, inArray } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { blogTagsTable, blogsTable, tagsTable } from '@/db/schema';
import { blogFormSchema } from './blog-schema';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function syncBlogTags(tx: Tx, blogId: number, tagNames: string[]) {
  await tx.delete(blogTagsTable).where(eq(blogTagsTable.blogId, blogId));
  if (tagNames.length === 0) return;
  await tx
    .insert(tagsTable)
    .values(tagNames.map(name => ({ name })))
    .onConflictDoNothing({ target: tagsTable.name });
  const tagRows = await tx
    .select({ id: tagsTable.id })
    .from(tagsTable)
    .where(inArray(tagsTable.name, tagNames));
  await tx
    .insert(blogTagsTable)
    .values(tagRows.map(t => ({ blogId, tagId: t.id })));
}

export async function createBlog(
  _prev: SubmissionResult<string[]> | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, { schema: blogFormSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  let createdId: number | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return submission.reply({ formErrors: ['ログインが必要です'] });
    }
    createdId = await db.transaction(async tx => {
      const [inserted] = await tx
        .insert(blogsTable)
        .values({
          title: submission.value.title,
          body: submission.value.body,
          userId: session.user.id,
        })
        .returning({ id: blogsTable.id });
      await syncBlogTags(tx, inserted.id, submission.value.tags);
      return inserted.id;
    });
  } catch (error) {
    console.error('createBlog failed:', error);
    return submission.reply({
      formErrors: ['登録に失敗しました。時間をおいて再度お試しください'],
    });
  }
  revalidatePath('/top');
  if (createdId !== undefined) {
    revalidatePath(`/blog/${createdId}`);
  }
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
    const updated = await db.transaction(async tx => {
      const result = await tx
        .update(blogsTable)
        .set({
          title: submission.value.title,
          body: submission.value.body,
        })
        .where(
          and(eq(blogsTable.id, id), eq(blogsTable.userId, session.user.id))
        )
        .returning({ id: blogsTable.id });
      if (result.length === 0) return false;
      await syncBlogTags(tx, id, submission.value.tags);
      return true;
    });
    if (!updated) {
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

export type DeleteBlogError = { error: string };

export async function deleteBlog(
  id: number
): Promise<DeleteBlogError | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: 'ログインが必要です' };
  }
  try {
    const result = await db
      .delete(blogsTable)
      .where(
        and(eq(blogsTable.id, id), eq(blogsTable.userId, session.user.id))
      )
      .returning({ id: blogsTable.id });
    if (result.length === 0) {
      return { error: '削除権限がないか、対象が見つかりませんでした' };
    }
  } catch (error) {
    console.error('deleteBlog failed:', error);
    return { error: '削除に失敗しました。時間をおいて再度お試しください' };
  }
  revalidatePath('/top');
  redirect('/top');
}
