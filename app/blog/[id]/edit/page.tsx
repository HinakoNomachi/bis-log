import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { updateBlog } from '@/actions/blog';
import { getBlogById } from '@/data/blogs';
import { SiteHeader } from '@/components/site-header';
import { BlogForm } from '../../blog-form';

type FromPageType = 'list' | 'detail';

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: FromPageType }>;
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
  if (blog.userId !== session.user.id) {
    redirect(`/blog/${numericId}`);
  }

  const { from } = await searchParams;
  const backToList = from === 'list';
  const backHref = backToList ? '/top' : `/blog/${numericId}`;
  const backLabel = backToList ? '一覧に戻る' : '詳細に戻る';

  const action = updateBlog.bind(null, numericId);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-4">
        <Link
          href={backHref}
          className="mb-3 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← {backLabel}
        </Link>
        <BlogForm
          action={action}
          defaultValue={{ title: blog.title, body: blog.body }}
          submitLabel="更新する"
          pendingLabel="更新中…"
        />
      </main>
    </>
  );
}
