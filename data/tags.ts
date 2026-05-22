'use server';

import { and, asc, ilike, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { tagsTable } from '@/db/schema';

const SUGGESTION_LIMIT = 8;

export async function searchTags(
  query: string,
  exclude: string[] = []
): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const escaped = trimmed.replace(/[\\%_]/g, ch => `\\${ch}`);
  const conditions = [ilike(tagsTable.name, `${escaped}%`)];
  if (exclude.length > 0) {
    conditions.push(notInArray(tagsTable.name, exclude));
  }
  const rows = await db
    .select({ name: tagsTable.name })
    .from(tagsTable)
    .where(and(...conditions))
    .orderBy(asc(tagsTable.name))
    .limit(SUGGESTION_LIMIT);
  return rows.map(r => r.name);
}
