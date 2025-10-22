'use client';

import { useState } from 'react';
import SearchCombo from '@/components/SearchCombo';
import PathViewer from '@/components/PathViewer';
import HandshakeTimeline from '@/components/HandshakeTimeline';
import type { Suggestion } from '@/lib/wikidata';

interface Person {
  qid: string;
  name: string;
  img?: string;
  gender?: 'male' | 'female';
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

export default function Home() {
  const [fromCeleb, setFromCeleb] = useState<Suggestion | null>(null);
  const [toCeleb, setToCeleb] = useState<Suggestion | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const handleLink = async () => {
    if (!fromCeleb || !toCeleb) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromCeleb, to: toCeleb }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate link');
      }

      const data = await res.json();
      setResult(data);
      setAnimationKey((prev) => prev + 1); // Force animation replay
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canLink = fromCeleb && toCeleb && !loading;

  return (
    <main className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-[860px] mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-text">CelebLink</h1>
          <p className="text-muted text-lg">
            Discover how any two celebrities are connected through photos
          </p>
        </div>

        {/* Search inputs */}
        <div className="space-y-6">
          <SearchCombo
            label="From Celebrity"
            value={fromCeleb}
            onSelect={setFromCeleb}
          />
          <SearchCombo
            label="To Celebrity"
            value={toCeleb}
            onSelect={setToCeleb}
          />

          <div className="flex justify-center">
            <button
              onClick={handleLink}
              disabled={!canLink}
              className="px-8 py-4 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding Connection...
                </span>
              ) : (
                'Find Link'
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Path viewer */}
            <div>
              <h2 className="text-2xl font-bold text-text mb-4">
                Connection Path
              </h2>
              <PathViewer nodes={result.nodes} edges={result.edges} />
            </div>

            {/* Animation */}
            {result.edges.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-4">
                  Animation Timeline
                </h2>
                <HandshakeTimeline
                  key={animationKey}
                  nodes={result.nodes}
                  edges={result.edges}
                  autoPlay={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted text-sm pt-8 border-t border-border">
          <p>
            Data from Wikidata and Wikimedia Commons.
            {!process.env.NEXT_PUBLIC_HAS_OPENAI_KEY && (
              <span className="block mt-2 text-yellow-500">
                Running in demo mode with mock data. Add OPENAI_API_KEY to
                enable real connections.
              </span>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
