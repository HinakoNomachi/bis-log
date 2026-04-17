'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/libs/auth-client';

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
      onClick={async () => {
        await authClient.signOut();
        router.push('/');
      }}
    >
      ログアウト
    </button>
  );
}
