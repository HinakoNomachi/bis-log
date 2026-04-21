'use client';

import { authClient } from '@/libs/auth-client';

export function GitHubLogin() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p className="text-neutral-500">読み込み中…</p>;
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-neutral-700">
          ログイン中: <span className="font-medium">{session.user.name}</span>
          {session.user.email ? (
            <span className="text-neutral-500">（{session.user.email}）</span>
          ) : null}
        </p>
        <button
          type="button"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
          onClick={() => authClient.signOut()}
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-neutral-800"
      onClick={() =>
        authClient.signIn.social({
          provider: 'github',
          callbackURL: '/top',
        })
      }
    >
      GitHub でログイン
    </button>
  );
}
