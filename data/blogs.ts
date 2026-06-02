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

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, ch => `\\${ch}`);
}

export type ListBlogsParams = {
  q?: string;
  tags?: string[];
};

export async function listBlogs(params: ListBlogsParams = {}) {
  const keywords = (params.q ?? '')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const tagFilter = (params.tags ?? []).filter(t => t.trim().length > 0);

  const whereParts: SQL[] = [];

  // Each keyword must match title OR body (AND across keywords).
  for (const kw of keywords) {
    const pattern = `%${escapeLike(kw)}%`;
    const cond = or(
      ilike(blogsTable.title, pattern),
      ilike(blogsTable.body, pattern)
    );
    if (cond) whereParts.push(cond);
  }

  // Blog must have ALL specified tags (AND across tag filters).
  for (const tagName of tagFilter) {
    whereParts.push(
      exists(
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
      )
    );
  }

  // Tier for ordering: title hit > tag hit > body hit.
  // No keyword: every row is tier 3 so date alone decides order.
  let tierExpr: SQL<number>;
  if (keywords.length > 0) {
    const titleMatch = or(
      ...keywords.map(kw => ilike(blogsTable.title, `%${escapeLike(kw)}%`))
    );
    const tagMatch = exists(
      db
        .select({ one: sql`1` })
        .from(blogTagsTable)
        .innerJoin(tagsTable, eq(blogTagsTable.tagId, tagsTable.id))
        .where(
          and(
            eq(blogTagsTable.blogId, blogsTable.id),
            or(...keywords.map(kw => ilike(tagsTable.name, `%${escapeLike(kw)}%`)))
          )
        )
    );
    tierExpr = sql<number>`CASE
      WHEN ${titleMatch} THEN 1
      WHEN ${tagMatch} THEN 2
      ELSE 3
    END`;
  } else {
    tierExpr = sql<number>`3`;
  }

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
    .where(whereParts.length > 0 ? and(...whereParts) : undefined)
    .orderBy(asc(tierExpr), desc(blogsTable.createdAt));

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
