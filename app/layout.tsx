import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'CelebLink - Connect Any Two Celebrities',
  description:
    'A fun way to connect celebrities through their shared moments and meetings. Discover connections across entertainment, politics, sports, and more!',
  keywords: ['celebrities', 'connections', 'photos', 'social network', 'entertainment', 'politics', 'sports'],
  icons: {
    icon: '/favicon.svg',
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2217932579992453"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
