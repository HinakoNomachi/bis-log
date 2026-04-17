import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(255),
});
