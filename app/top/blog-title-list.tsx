import Link from 'next/link';
import { listBlogs } from '@/data/blogs';

export async function BlogTitleList() {
  const rows = await listBlogs();
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">まだブログがありません</p>
    );
  }
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {rows.map(row => (
        <li key={row.id} className="flex flex-col gap-0.5">
          <Link
            href={`/blog/${row.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {row.authorName ?? '不明'} ・{' '}
            {row.createdAt.toLocaleDateString('ja-JP')}
          </span>
        </li>
      ))}
    </ul>
  );
}
