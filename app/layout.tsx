import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://celebslinks.com'),
  title: 'CelebLink - Connect Any Two Celebrities',
  description:
    'A fun way to connect celebrities through their shared moments and meetings. Discover connections across entertainment, politics, sports, and more!',
  keywords: ['celebrities', 'connections', 'photos', 'social network', 'entertainment', 'politics', 'sports'],
  authors: [{ name: 'CelebLink' }],
  creator: 'CelebLink',
  publisher: 'CelebLink',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'CelebLink - Connect Any Two Celebrities',
    description: 'A fun way to connect celebrities through their shared moments and meetings.',
    url: 'https://celebslinks.com',
    siteName: 'CelebLink',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CelebLink - Connect Any Two Celebrities',
    description: 'A fun way to connect celebrities through their shared moments and meetings.',
    site: '@celeblink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here after claiming the site
    // google: 'your-google-verification-code',
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
