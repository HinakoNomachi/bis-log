'use server';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { blogsTable, user } from '@/db/schema';

export async function listBlogs() {
  return db
    .select({
      id: blogsTable.id,
      title: blogsTable.title,
      createdAt: blogsTable.createdAt,
      authorName: user.name,
    })
    .from(blogsTable)
    .leftJoin(user, eq(blogsTable.userId, user.id))
    .orderBy(desc(blogsTable.createdAt));
}

export async function getBlogById(id: number) {
  const rows = await db
    .select({
      id: blogsTable.id,
      title: blogsTable.title,
      body: blogsTable.body,
      createdAt: blogsTable.createdAt,
      authorName: user.name,
    })
    .from(blogsTable)
    .leftJoin(user, eq(blogsTable.userId, user.id))
    .where(eq(blogsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}
