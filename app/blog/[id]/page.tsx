import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil } from 'lucide-react';
import { auth } from '@/auth';
import { getBlogById } from '@/data/blogs';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { DeleteBlogButton } from '../delete-blog-button';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/');
  }
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }
  const blog = await getBlogById(numericId);
  if (!blog) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <Link
          href="/top"
          className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← 一覧に戻る
        </Link>
        <article className="rounded-lg border border-border bg-background px-6 py-8 sm:px-10">
          <header className="mb-6 flex flex-col gap-3 border-b border-border pb-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {blog.title}
              </h1>
              {blog.userId === session.user.id && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    nativeButton={false}
                    aria-label="編集"
                    render={<Link href={`/blog/${blog.id}/edit?from=detail`} />}
                  >
                    <Pencil />
                  </Button>
                  <DeleteBlogButton id={blog.id} title={blog.title} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                @{blog.authorName ?? '不明'}
              </span>
              <span>が{blog.createdAt.toLocaleDateString('ja-JP')}に投稿</span>
            </div>
          </header>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.body}</ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  );
}
