# 機能一覧

本書はブログ機能の全機能を一覧化したものです。各機能の詳細設計は `04_feature-design-*.md` を参照してください。

## 機能ID一覧

| 機能ID | 機能名 | 概要 | 関連画面 | 関連サーバーアクション | 詳細設計書 |
| --- | --- | --- | --- | --- | --- |
| FN-BLOG-01 | ブログ新規登録 | タイトルと本文を入力し新規記事を作成する | SCR-BLOG-01 | `createBlog` | [04_feature-design-create-blog.md](04_feature-design-create-blog.md) |
| FN-BLOG-02 | ブログ詳細表示 | 指定IDの記事をMarkdownレンダリングで表示する | SCR-BLOG-02 | （`getBlogById`：データ取得） | [04_feature-design-detail-blog.md](04_feature-design-detail-blog.md) |
| FN-BLOG-03 | ブログ編集 | 自身が投稿した記事のタイトル/本文を更新する | SCR-BLOG-03 | `updateBlog` | [04_feature-design-edit-blog.md](04_feature-design-edit-blog.md) |
| FN-BLOG-04 | ブログ削除 | 自身が投稿した記事を確認ダイアログ経由で削除する | SCR-BLOG-02（から実行） | `deleteBlog` | [04_feature-design-delete-blog.md](04_feature-design-delete-blog.md) |

## 機能カテゴリ別整理

### 投稿系（書き込み）
- FN-BLOG-01 ブログ新規登録
- FN-BLOG-03 ブログ編集
- FN-BLOG-04 ブログ削除

### 参照系（読み込み）
- FN-BLOG-02 ブログ詳細表示

## 機能横断仕様

### 認証
全機能でログイン必須。`auth.api.getSession({ headers })` を用いてセッションを取得し、未ログインの場合は次のように扱う。
- ページ表示時: `/` へリダイレクト
- サーバーアクション実行時:
  - `createBlog` / `updateBlog`: フォームエラー「ログインが必要です」を返却
  - `deleteBlog`: `Error('ログインが必要です')` を throw

### 認可
- 編集（FN-BLOG-03）/ 削除（FN-BLOG-04）は **投稿者本人のみ** 可能
- ページ表示時: 編集画面では投稿者でない場合 `/blog/{id}` へリダイレクト、詳細画面では編集/削除ボタン自体を非表示
- サーバーアクション側でも `where(eq(userId), eq(id))` で二重チェック → 0件の場合エラー返却

### バリデーション（共通スキーマ）
`actions/blog-schema.ts`

| 項目 | 型 | 必須 | 最小 | 最大 | 必須エラー文言 |
| --- | --- | --- | --- | --- | --- |
| title | string | ○ | 1 | 255 | タイトルを入力してください |
| body | string | ○ | 1 | 10000 | 本文を入力してください |

- クライアント側（`@conform-to/react` + `@conform-to/zod/v4`）でリアルタイム検証
- サーバー側（`parseWithZod`）で再検証 — 信頼境界はサーバー側

### キャッシュ再検証
更新系アクションでは `revalidatePath` を呼び出して関連ページのキャッシュを破棄する。

| アクション | 再検証パス |
| --- | --- |
| `createBlog` | `/top` |
| `updateBlog(id)` | `/top`, `/blog/{id}` |
| `deleteBlog(id)` | `/top` |

### データモデル（`db/schema.ts` 抜粋）

`blogs` テーブル

| カラム | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| id | integer | PK, `generatedAlwaysAsIdentity` | サロゲートキー |
| title | varchar(255) | NOT NULL | |
| body | text | NOT NULL | Markdown原文 |
| user_id | text | NOT NULL, FK→user.id ON DELETE CASCADE | 投稿者 |
| created_at | timestamp | NOT NULL, default now() | |
| updated_at | timestamp | NOT NULL, default now(), `$onUpdate` | |

インデックス: `blogs_userId_idx` on `user_id`

### 共通UIコンポーネント
- `components/ui/*`: Button / Input / Label / Textarea / Card
- `@base-ui/react/alert-dialog`: 削除確認ダイアログ
- `lucide-react`: アイコン（`Pencil`, `Trash2`）
- `react-markdown` + `remark-gfm`: 詳細画面の本文レンダリング
