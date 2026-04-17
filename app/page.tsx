import { GitHubLogin } from './github-login';

export default function Home() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        ログイン
      </h1>
      <GitHubLogin />
    </main>
  );
}
