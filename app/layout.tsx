import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CelebLink - Connect Any Two Celebrities',
  description:
    'A fun way to connect celebrities through their shared moments and meetings. Discover connections across entertainment, politics, sports, and more!',
  keywords: ['celebrities', 'connections', 'photos', 'social network', 'entertainment', 'politics', 'sports'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'CelebLink - Connect Any Two Celebrities',
    description: 'A fun way to connect celebrities through their shared moments and meetings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CelebLink - Connect Any Two Celebrities',
    description: 'A fun way to connect celebrities through their shared moments and meetings.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
