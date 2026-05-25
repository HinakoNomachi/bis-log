import { z } from 'zod';

export const commentFormSchema = z.object({
  body: z
    .string({ error: 'コメントを入力してください' })
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});
