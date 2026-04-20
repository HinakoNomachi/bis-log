'use server';

import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/dom';
import { revalidatePath } from 'next/cache';
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
  await db.insert(blogsTable).values({ title: submission.value.title });
  revalidatePath('/top');
  return submission.reply({ resetForm: true });
}
