'use client';

import { useState, useTransition } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deleteBlog } from '@/actions/blog';
import { Button } from '@/components/ui/button';

type DeleteBlogButtonProps = {
  id: number;
  title: string;
};

export function DeleteBlogButton({ id, title }: DeleteBlogButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteBlog(id);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <AlertDialog.Root
      onOpenChange={open => {
        if (!open) setError(null);
      }}
    >
      <AlertDialog.Trigger
        render={
          <Button
            variant="destructive-outline"
            size="icon-sm"
            aria-label="削除"
          >
            <Trash2 />
          </Button>
        }
      />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 flex w-full max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-lg transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              削除しますか?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              「{title}」を削除します。この操作は取り消せません。
            </AlertDialog.Description>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button variant="outline" size="sm" disabled={isPending}>
                  キャンセル
                </Button>
              }
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? '削除中…' : '削除'}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
