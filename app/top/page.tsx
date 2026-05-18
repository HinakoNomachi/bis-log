import { Suspense } from 'react';
import { BlogTitleList } from './blog-title-list';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteHeader } from '@/components/site-header';

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

export default function TopPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="mb-5 text-xl font-bold text-foreground">記事一覧</h1>
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogTitleList />
        </Suspense>
      </main>
    </>
  );
}
