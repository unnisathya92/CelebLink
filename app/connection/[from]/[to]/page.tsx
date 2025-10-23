'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PathViewer from '@/components/PathViewer';
import LoadingWordRing from '@/components/LoadingWordRing';
import type { Suggestion } from '@/lib/wikidata';

interface Person {
  qid: string;
  name: string;
  img?: string;
}

interface EdgePhoto {
  url: string;
  caption: string;
  date?: string;
  location?: string;
  license?: string;
  source?: string;
}

interface Edge {
  from: string;
  to: string;
  photo: EdgePhoto;
}

interface LinkResult {
  nodes: Person[];
  edges: Edge[];
}

export default function SharedConnectionPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<LinkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromSlug = params.from as string;
  const toSlug = params.to as string;

  // Convert slug to readable name (e.g., "tom-cruise" -> "Tom Cruise")
  const slugToName = (slug: string) => {
    return decodeURIComponent(slug)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fromName = slugToName(fromSlug);
  const toName = slugToName(toSlug);

  useEffect(() => {
    const searchAndConnect = async () => {
      try {
        // Search for both celebrities
        const [fromRes, toRes] = await Promise.all([
          fetch(`/api/autocomplete?q=${encodeURIComponent(fromName)}`),
          fetch(`/api/autocomplete?q=${encodeURIComponent(toName)}`),
        ]);

        const fromData = await fromRes.json();
        const toData = await toRes.json();

        const fromCeleb: Suggestion = fromData.results?.[0];
        const toCeleb: Suggestion = toData.results?.[0];

        if (!fromCeleb || !toCeleb) {
          setError('Could not find one or both celebrities');
          setLoading(false);
          return;
        }

        // Get connection
        const linkRes = await fetch('/api/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromCeleb, to: toCeleb }),
        });

        const linkData = await linkRes.json();
        setResult(linkData);
      } catch (err) {
        setError('Failed to find connection');
      } finally {
        setLoading(false);
      }
    };

    searchAndConnect();
  }, [fromName, toName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">
            {fromName} → {toName}
          </h1>
          <p className="text-muted">Discover how these celebrities are connected</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-text transition-colors"
          >
            Try Your Own Connection
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingWordRing />
            <p className="mt-8 text-muted text-lg">Finding connection...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && !loading && (
          <PathViewer nodes={result.nodes} edges={result.edges} />
        )}
      </div>
    </div>
  );
}
