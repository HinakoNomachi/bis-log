import { getBlogTitles } from './blog-titles';

export async function BlogTitleList() {
  const rows = await getBlogTitles();
  if (rows.length === 0) {
    return <p className="text-sm text-neutral-500">まだブログがありません</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-neutral-800">
      {rows.map(row => (
        <li key={row.id}>{row.title}</li>
      ))}
    </ul>
  );
}
