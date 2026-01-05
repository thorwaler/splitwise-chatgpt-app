import type { Metadata } from 'next';
import './globals.css';

// Force dynamic rendering for all pages (needed for OAuth callbacks and search params)
export const dynamic = 'force-dynamic';

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
