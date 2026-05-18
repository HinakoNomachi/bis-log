import Link from 'next/link';
import { LogoutButton } from '@/app/top/logout-button';

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4">
        <Link
          href="/top"
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--qiita-green)' }}
        >
          bis-log
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/blog/create"
            className="inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--qiita-green)' }}
          >
            投稿する
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
