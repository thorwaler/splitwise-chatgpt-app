import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Splitwise ChatGPT App',
  description: 'Manage your Splitwise expenses through ChatGPT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
