'use server';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { comments, user } from '@/db/schema';

export async function listCommentsByBlogId(blogId: number) {
  return db
    .select({
      id: comments.id,
      body: comments.body,
      userId: comments.userId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorName: user.name,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.blogId, blogId))
    .orderBy(desc(comments.createdAt));
}
