import { CommentItem, type Comment } from './comment-item';

type CommentListProps = {
  comments: Comment[];
  blogId: number;
  currentUserId: string;
};

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
            comment={c}
            blogId={blogId}
            isAuthor={c.userId === currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
