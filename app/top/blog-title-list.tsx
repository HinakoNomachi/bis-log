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
      <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
        まだブログがありません
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(row => (
        <li
          key={row.id}
          className="rounded-lg border border-border bg-background px-5 py-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/blog/${row.id}`}
              className="group flex flex-1 flex-col gap-1.5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  @{row.authorName ?? '不明'}
                </span>
                <span>が{row.createdAt.toLocaleDateString('ja-JP')}に投稿</span>
              </div>
              <h2 className="text-base font-bold text-foreground group-hover:underline">
                {row.title}
              </h2>
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
