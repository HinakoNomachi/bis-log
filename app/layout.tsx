import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: 'var(--qiita-bg)' }}
      >
        {children}
      </body>
    </html>
  );
}
