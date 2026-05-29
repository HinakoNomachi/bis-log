import { Suspense } from 'react';
import { BlogTitleList } from './blog-title-list';
import { BlogSearch } from './blog-search';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteHeader } from '@/components/site-header';
import { listAllTags } from '@/data/blogs';

function BlogListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

function parseTags(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  const raw = Array.isArray(value) ? value.join(',') : value;
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function parseQ(value: string | string[] | undefined): string {
  if (value === undefined) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

export default async function TopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = parseQ(params.q);
  const tags = parseTags(params.tags);
  const allTags = await listAllTags();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="mb-5 text-xl font-bold text-foreground">記事一覧</h1>
        <BlogSearch allTags={allTags} />
        <Suspense
          key={`${q}|${tags.join(',')}`}
          fallback={<BlogListSkeleton />}
        >
          <BlogTitleList search={{ q, tags }} />
        </Suspense>
      </main>
    </>
  );
}
