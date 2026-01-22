import type { Metadata } from 'next';
import ConnectionClient from './ConnectionClient';

interface PageProps {
  params: Promise<{
    from: string;
    to: string;
  }>;
}

// Convert slug to readable name (e.g., "leonardo-dicaprio" -> "Leonardo Dicaprio")
function slugToName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { from, to } = await params;
  const fromName = slugToName(from);
  const toName = slugToName(to);

  const title = `${fromName} and ${toName} Connection | How Are They Linked?`;
  const description = `Discover how ${fromName} and ${toName} are connected. See the chain of relationships, shared moments, and photos linking these two celebrities together.`;

  return {
    title,
    description,
    keywords: [
      fromName,
      toName,
      `${fromName} ${toName}`,
      `${fromName} and ${toName}`,
      `${fromName} ${toName} connection`,
      `${fromName} ${toName} relationship`,
      `${fromName} ${toName} linked`,
      `${fromName} knows ${toName}`,
      `${toName} knows ${fromName}`,
      'celebrity connection',
      'celebrity relationship',
      'six degrees of separation',
    ],
    openGraph: {
      title,
      description,
      url: `https://celebslinks.com/connection/${from}/${to}`,
      siteName: 'CelebLink',
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://celebslinks.com/connection/${from}/${to}`,
    },
  };
}

export default async function SharedConnectionPage({ params }: PageProps) {
  const { from, to } = await params;
  const fromName = slugToName(from);
  const toName = slugToName(to);

  return <ConnectionClient fromName={fromName} toName={toName} />;
}
