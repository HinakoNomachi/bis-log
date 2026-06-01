import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase-storage';

const BUCKET = 'pictures';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/blog-image/[...path]'>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { path } = await ctx.params;
  const objectPath = path.join('/');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(objectPath);

  if (error || !data) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(data, {
    headers: {
      'Content-Type': data.type || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
