'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/libs/auth-client';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await authClient.signOut();
        router.push('/');
      }}
    >
      ログアウト
    </Button>
  );
}
