import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { BlogForm } from './blog-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function CreateBlogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/');
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
      <Link
        href="/top"
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <CardTitle>新規登録</CardTitle>
          <CardDescription>ブログを投稿します</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <BlogForm />
        </CardContent>
      </Card>
    </main>
  );
}
