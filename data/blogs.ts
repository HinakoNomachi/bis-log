'use server';

import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { blogTagsTable, blogsTable, tagsTable, user } from '@/db/schema';

async function tagsByBlogIds(blogIds: number[]) {
  const map = new Map<number, string[]>();
  if (blogIds.length === 0) return map;
  const rows = await db
    .select({ blogId: blogTagsTable.blogId, name: tagsTable.name })
    .from(blogTagsTable)
    .innerJoin(tagsTable, eq(blogTagsTable.tagId, tagsTable.id))
    .where(inArray(blogTagsTable.blogId, blogIds))
    .orderBy(asc(tagsTable.name));
  for (const row of rows) {
    const list = map.get(row.blogId) ?? [];
    list.push(row.name);
    map.set(row.blogId, list);
  }
  return map;
}

export async function listBlogs() {
  const rows = await db
    .select({
      id: blogsTable.id,
      title: blogsTable.title,
      userId: blogsTable.userId,
      createdAt: blogsTable.createdAt,
      authorName: user.name,
    })
    .from(blogsTable)
    .leftJoin(user, eq(blogsTable.userId, user.id))
    .orderBy(desc(blogsTable.createdAt));
  const tagsMap = await tagsByBlogIds(rows.map(r => r.id));
  return rows.map(row => ({ ...row, tags: tagsMap.get(row.id) ?? [] }));
}

export async function getBlogById(id: number) {
  const rows = await db
    .select({
      id: blogsTable.id,
      title: blogsTable.title,
      body: blogsTable.body,
      userId: blogsTable.userId,
      createdAt: blogsTable.createdAt,
      authorName: user.name,
    })
    .from(blogsTable)
    .leftJoin(user, eq(blogsTable.userId, user.id))
    .where(eq(blogsTable.id, id))
    .limit(1);
  const blog = rows[0];
  if (!blog) return null;
  const tagsMap = await tagsByBlogIds([blog.id]);
  return { ...blog, tags: tagsMap.get(blog.id) ?? [] };
}
