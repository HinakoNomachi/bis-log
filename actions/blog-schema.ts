import { z } from 'zod';

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 50;

const tagsField = z
  .string()
  .max(1000)
  .optional()
  .transform(value =>
    Array.from(
      new Set(
        (value ?? '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      )
    )
  )
  .pipe(
    z
      .array(
        z
          .string()
          .max(MAX_TAG_LENGTH, `タグは${MAX_TAG_LENGTH}文字以内で入力してください`)
          .regex(/^[^\s,]+$/, 'タグに空白やカンマは使えません')
      )
      .max(MAX_TAGS, `タグは${MAX_TAGS}個まで登録できます`)
  );

export const blogFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(255),
  body: z.string().min(1, '本文を入力してください').max(10000),
  tags: tagsField,
});
