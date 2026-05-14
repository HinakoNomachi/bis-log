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

export default async function EditBlogPage({
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
  if (blog.userId !== session.user.id) {
    redirect(`/blog/${numericId}`);
  }

  const action = updateBlog.bind(null, numericId);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
      <Link
        href={`/blog/${numericId}`}
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← 詳細に戻る
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
