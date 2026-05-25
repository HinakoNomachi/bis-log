# 機能一覧（コメント機能）

本書はコメント機能の全機能を一覧化したものです。各機能の詳細設計は `04_feature-design-*.md` を参照してください。

コメント機能はブログ詳細画面（SCR-BLOG-02）上で完結する機能群であり、独立した画面は持ちません。

## 機能ID一覧

| 機能ID | 機能名 | 概要 | 関連画面 | 関連サーバーアクション | 詳細設計書 |
| --- | --- | --- | --- | --- | --- |
| FN-CMT-01 | コメント登録 | ブログ詳細画面で本文を入力し、対象ブログにコメントを投稿する | SCR-BLOG-02 | `createComment` | [04_feature-design-create-comment.md](../04.%20画面設計書/04_feature-design-create-comment.md) |
| FN-CMT-02 | コメント編集 | 自身が投稿したコメントの本文を、一覧上でインラインに更新する | SCR-BLOG-02 | `updateComment` | [04_feature-design-edit-comment.md](../04.%20画面設計書/04_feature-design-edit-comment.md) |
| FN-CMT-03 | コメント削除 | 自身が投稿したコメントを確認ダイアログ経由で削除する（物理削除） | SCR-BLOG-02 | `deleteComment` | [04_feature-design-delete-comment.md](../04.%20画面設計書/04_feature-design-delete-comment.md) |

## 機能カテゴリ別整理

### 投稿系（書き込み）
- FN-CMT-01 コメント登録
- FN-CMT-02 コメント編集
- FN-CMT-03 コメント削除

### 参照系（読み込み）
- ブログ詳細画面（SCR-BLOG-02）の一部としてコメント一覧を表示する。独立した機能IDは設けず、`data/comments.ts` `listCommentsByBlogId` で取得する。

## 機能横断仕様

### 認証
全機能でログイン必須。`auth.api.getSession({ headers })` でセッションを取得し、未ログインの場合は次のように扱う。
- ページ表示時: SCR-BLOG-02 側の既存ガードで `/` へリダイレクト
- サーバーアクション実行時:
  - `createComment` / `updateComment`: フォームエラー「ログインが必要です」を返却
  - `deleteComment`: `Error('ログインが必要です')` を throw

### 認可
- 編集（FN-CMT-02）/ 削除（FN-CMT-03）は **コメント投稿者本人のみ** 可能
- 表示時: 編集アイコン／削除ボタン自体を投稿者以外には非表示
- サーバーアクション側でも `where(eq(id), eq(userId))` で二重チェック → 0件の場合エラー返却

### バリデーション（共通スキーマ）
`actions/comment-schema.ts`

| 項目 | 型 | 必須 | 最小 | 最大 | 必須エラー文言 |
| --- | --- | --- | --- | --- | --- |
| body | string | ○ | 1 | 1000 | コメントを入力してください |

- 登録（FN-CMT-01）と編集（FN-CMT-02）で同一スキーマを使用
- クライアント側（`@conform-to/react` + `@conform-to/zod/v4`）でリアルタイム検証
- サーバー側（`parseWithZod`）で再検証 — 信頼境界はサーバー側

### キャッシュ再検証
更新系アクションでは `revalidatePath` を呼び出して詳細ページのキャッシュを破棄する。

| アクション | 再検証パス | 遷移 |
| --- | --- | --- |
| `createComment(blogId)` | `/blog/{blogId}` | 同画面に留まる（リダイレクトなし） |
| `updateComment(commentId)` | `/blog/{blogId}` | 同画面に留まる |
| `deleteComment(commentId)` | `/blog/{blogId}` | 同画面に留まる |

※ ブログ機能の `createBlog`/`updateBlog`/`deleteBlog` は完了時にリダイレクトするが、コメントは詳細画面上で完結するためリダイレクトしない。

### データモデル（`db/schema.ts` 追加分）

`comments` テーブル

| カラム | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| id | integer | PK, `generatedAlwaysAsIdentity` | サロゲートキー |
| blog_id | integer | NOT NULL, FK→blogs.id ON DELETE CASCADE | 対象ブログ |
| user_id | text | NOT NULL, FK→user.id ON DELETE CASCADE | 投稿者 |
| body | text | NOT NULL | プレーンテキスト |
| created_at | timestamp | NOT NULL, default now() | |
| updated_at | timestamp | NOT NULL, default now(), `$onUpdate` | 編集時に自動更新 |

インデックス:
- `comments_blogId_idx` on `blog_id`
- `comments_userId_idx` on `user_id`

リレーション:
- `blogsTable ↔ many(comments)`
- `user ↔ many(comments)`
- `commentsTable → one(blog)`, `one(author)`

### 削除方式
**物理削除**を採用する。ブログ削除（FN-BLOG-04）が物理削除であることとの整合、および CASCADE 設計（ブログ削除時にコメントも自然に削除）との整合のため。

### 並び順
コメント一覧は `created_at` の **降順（新しい順）** で表示する。編集（`updated_at` 更新）によって順序は変わらない。

### 本文の扱い
- プレーンテキストとして保存・表示（Markdown レンダリングなし）
- 改行は表示時に保持する（`white-space: pre-wrap` 相当）

### 共通UIコンポーネント
- `components/ui/textarea.tsx`: 本文入力欄
- `components/ui/button.tsx`: 送信／編集／削除ボタン
- `@base-ui/react/alert-dialog`: 削除確認ダイアログ（ブログ削除と同型）
- `lucide-react`: アイコン（`Pencil`, `Trash2`）
