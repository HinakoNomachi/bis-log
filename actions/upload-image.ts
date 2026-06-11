'use server';

import { headers } from 'next/headers';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase-storage';

const BUCKET = 'pictures';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type UploadImageResult =
  | { ok: true; markdown: string; path: string }
  | { ok: false; error: string };

export async function uploadBlogImage(
  formData: FormData
): Promise<UploadImageResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, error: 'ログインが必要です' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'ファイルを選択してください' };
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return { ok: false, error: '対応していない画像形式です' };
  }

  // const path = `posts/${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.log(error, error.message);
    return { ok: false, error: `アップロードに失敗しました: ${error.message}` };
  }

  return {
    ok: true,
    path,
    markdown: `![](/api/blog-image/${path})`,
  };
}
