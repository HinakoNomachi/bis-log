import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(255),
  body: z.string().min(1, '本文を入力してください').max(10000),
});
