'use server';

import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { db } from '@/db';
import { blogTagsTable, blogsTable, tagsTable, user } from '@/db/schema';

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, ch => `\\${ch}`);
}

function likeContains(value: string) {
  return `%${escapeLike(value)}%`;
}

function parseKeywords(q?: string): string[] {
  return (q ?? '')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function parseTagNames(tags?: string[]): string[] {
  return (tags ?? []).map(t => t.trim()).filter(t => t.length > 0);
}

function matchesKeyword(keyword: string): SQL {
  const pattern = likeContains(keyword);
  return or(ilike(blogsTable.title, pattern), ilike(blogsTable.body, pattern))!;
}

function blogHasTag(tagName: string): SQL {
  return exists(
    db
      .select({ one: sql`1` })
      .from(blogTagsTable)
      .innerJoin(tagsTable, eq(blogTagsTable.tagId, tagsTable.id))
      .where(
        and(
          eq(blogTagsTable.blogId, blogsTable.id),
          eq(tagsTable.name, tagName)
        )
      )
  );
}

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

export type ListBlogsParams = {
  q?: string;
  tags?: string[];
};

export async function listBlogs(params: ListBlogsParams = {}) {
  const keywords = parseKeywords(params.q);
  const tagNames = parseTagNames(params.tags);

  const conditions: SQL[] = [
    ...keywords.map(matchesKeyword),
    ...tagNames.map(blogHasTag),
  ];

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogsTable.createdAt));

  const tagsMap = await tagsByBlogIds(rows.map(r => r.id));
  return rows.map(row => ({ ...row, tags: tagsMap.get(row.id) ?? [] }));
}

export async function listAllTags(): Promise<string[]> {
  const rows = await db
    .select({ name: tagsTable.name })
    .from(tagsTable)
    .orderBy(asc(tagsTable.name));
  return rows.map(r => r.name);
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
