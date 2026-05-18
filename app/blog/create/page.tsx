import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createBlog } from '@/actions/blog';
import { SiteHeader } from '@/components/site-header';
import { BlogForm } from '../blog-form';

export default async function CreateBlogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/');
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-4">
        <Link
          href="/top"
          className="mb-3 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← 一覧に戻る
        </Link>
        <BlogForm action={createBlog} submitLabel="投稿する" pendingLabel="投稿中…" />
      </main>
    </>
  );
}
