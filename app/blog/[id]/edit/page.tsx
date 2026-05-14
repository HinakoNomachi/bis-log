import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { updateBlog } from '@/actions/blog';
import { getBlogById } from '@/data/blogs';
import { BlogForm } from '../../blog-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
      <Link
        href={backHref}
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← {backLabel}
      </Link>
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <CardTitle>編集</CardTitle>
          <CardDescription>ブログを更新します</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <BlogForm
            action={action}
            defaultValue={{ title: blog.title, body: blog.body }}
            submitLabel="更新"
            pendingLabel="更新中…"
          />
        </CardContent>
      </Card>
    </main>
  );
}
