import { listCommentsByBlogId } from '@/data/comments';
import { CommentItem } from './comment-item';

type Comment = Awaited<ReturnType<typeof listCommentsByBlogId>>[number];
export type CommentPublic = Omit<Comment, 'userId'>;

type CommentListProps = {
  comments: Comment[];
  blogId: number;
  currentUserId: string;
};

export function toCommentPublic(row: Comment): CommentPublic {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _userId, ...rest } = row;
  return rest;
}

export function CommentList({
  comments,
  blogId,
  currentUserId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだコメントはありません。
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {comments.map(c => (
        <li key={c.id}>
          <CommentItem
            comment={toCommentPublic(c)}
            blogId={blogId}
            isAuthor={c.userId === currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
