import { Suspense } from 'react';
import { BlogTitleList } from '@/app/data/blog-title-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogForm } from './blog-form';
import { LogoutButton } from './logout-button';

function BlogListSkeleton() {
  return (
    <div
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <Skeleton className="h-4 w-3/5 max-w-[14rem]" />
      <Skeleton className="h-4 w-4/5 max-w-[18rem]" />
      <Skeleton className="h-4 w-2/5 max-w-[10rem]" />
    </div>
  );
}

export default function TopPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">ブログ</h1>
        <LogoutButton />
      </header>
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <CardTitle>新規登録</CardTitle>
          <CardDescription>ブログのタイトルを登録します</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <BlogForm />
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Suspense fallback={<BlogListSkeleton />}>
            <BlogTitleList />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
