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

// ILIKE のワイルドカード（%, _）をエスケープ
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, ch => `\\${ch}`);
}

function likeContains(value: string) {
  return `%${escapeLike(value)}%`;
}

// q をスペース区切りで分割（UI: キーワード同士は AND）
function parseKeywords(q?: string): string[] {
  return (q ?? '')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// 検索 UI から渡るタグ名（空文字除去）
function parseTagNames(tags?: string[]): string[] {
  return (tags ?? []).map(t => t.trim()).filter(t => t.length > 0);
}

/** WHERE 用: 1キーワードがタイトル or 本文に部分一致 */
function matchesKeyword(keyword: string): SQL {
  const pattern = likeContains(keyword);
  return or(ilike(blogsTable.title, pattern), ilike(blogsTable.body, pattern))!;
}

/** WHERE 用: 記事が指定タグを1つ以上持つ（EXISTS 相関サブクエリ） */
function blogHasTag(tagName: string): SQL {
  return exists(
    db
      // EXISTS では列の中身は不要。行の有無だけ見る
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

/** 一覧表示用: 記事 ID ごとのタグ名配列（絞り込みとは別クエリ・N+1 回避） */
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

  // キーワード・タグの条件を AND で積む（タグ複数 = すべて持つ記事）
  const conditions: SQL[] = [
    ...keywords.map(matchesKeyword),
    ...tagNames.map(blogHasTag),
  ];

  // 1本目: 記事の絞り込み + 著者名。タグ名は含めない
  const rows = await db
    .select({
      id: blogsTable.id,
      title: blogsTable.title,
      userId: blogsTable.userId,
      createdAt: blogsTable.createdAt,
      authorName: user.name,
    })
    .from(blogsTable)
    // 著者名取得用。特定ユーザーで絞る条件ではない
    .leftJoin(user, eq(blogsTable.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogsTable.createdAt));

  // 2本目: 表示用タグを付与（blog-title-list の TagOverflowList 向け）
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
