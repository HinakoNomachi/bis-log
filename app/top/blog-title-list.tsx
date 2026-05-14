import Link from 'next/link';
import { headers } from 'next/headers';
import { Pencil } from 'lucide-react';
import { auth } from '@/auth';
import { listBlogs } from '@/data/blogs';
import { Button } from '@/components/ui/button';
import { DeleteBlogButton } from '@/app/blog/delete-blog-button';

export async function BlogTitleList() {
  const [rows, session] = await Promise.all([
    listBlogs(),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const currentUserId = session?.user?.id;
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">まだブログがありません</p>
    );
  }
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {rows.map(row => (
        <li key={row.id}>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/blog/${row.id}`}
              className="group flex flex-1 flex-col gap-0.5"
            >
              <span className="font-medium text-foreground group-hover:underline">
                {row.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.authorName ?? '不明'} ・{' '}
                {row.createdAt.toLocaleDateString('ja-JP')}
              </span>
            </Link>
            {row.userId === currentUserId && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  nativeButton={false}
                  aria-label="編集"
                  render={<Link href={`/blog/${row.id}/edit?from=list`} />}
                >
                  <Pencil />
                </Button>
                <DeleteBlogButton id={row.id} title={row.title} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}