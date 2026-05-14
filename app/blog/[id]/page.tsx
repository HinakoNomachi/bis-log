import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { auth } from '@/auth';
import { getBlogById } from '@/data/blogs';
import { Button } from '@/components/ui/button';

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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Link
        href="/top"
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
      <header className="flex flex-col gap-2 border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {blog.title}
          </h1>
          {blog.userId === session.user.id && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/blog/${blog.id}/edit`} />}
            >
              編集
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {blog.authorName ?? '不明'} ・{' '}
          {blog.createdAt.toLocaleDateString('ja-JP')}
        </p>
      </header>
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.body}</ReactMarkdown>
      </article>
    </main>
  );
}
