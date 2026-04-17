'use server';

import { db } from '@/db';
import { blogsTable } from '@/db/schema';

export async function getBlogTitles() {
  return db.select({ id: blogsTable.id, title: blogsTable.title }).from(blogsTable);
}
