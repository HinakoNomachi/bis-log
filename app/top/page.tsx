import { Suspense } from 'react';
import { BlogTitleList } from '@/app/data/blog-title-list';
import { BlogForm } from './blog-form';
import { LogoutButton } from './logout-button';

export default function TopPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">ブログ</h1>
        <LogoutButton />
      </header>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-neutral-600">新規登録</h2>
        <BlogForm />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-neutral-600">一覧</h2>
        <Suspense
          fallback={<p className="text-sm text-neutral-500">読み込み中…</p>}
        >
          <BlogTitleList />
        </Suspense>
      </section>
    </main>
  );
}
