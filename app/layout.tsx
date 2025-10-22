import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CelebLink - Connect Any Two Celebrities',
  description:
    'Discover how any two celebrities are connected through verified photos and public appearances.',
  keywords: ['celebrities', 'connections', 'photos', 'social network'],
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
