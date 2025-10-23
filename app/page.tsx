'use client';

import { useState, useEffect } from 'react';
import SearchCombo from '@/components/SearchCombo';
import PathViewer from '@/components/PathViewer';
// import HandshakeTimeline from '@/components/HandshakeTimeline'; // Removed per user request
import LoadingWordRing from '@/components/LoadingWordRing';
import GoogleAd from '@/components/GoogleAd';
import type { Suggestion } from '@/lib/wikidata';
import { getRandomPair } from '@/lib/randomCelebrities';

const LOADING_MESSAGES = [
  "Discovering connections across the globe...",
  "Tracing pathways through time and space...",
  "Exploring political summits and conferences...",
  "Searching through sports events and ceremonies...",
  "Following the trail of collaborative projects...",
  "Scanning charity galas and fundraisers...",
  "Checking international award shows...",
  "Investigating business conferences and panels...",
  "Mapping connections across all industries...",
  "Reviewing talk show appearances and interviews...",
  "Exploring scientific symposiums and lectures...",
  "Finding shared humanitarian missions...",
  "Tracking global summit meetings...",
  "Uncovering cultural exchange programs...",
  "Analyzing music festivals and concerts...",
  "Searching through historical gatherings...",
  "Following diplomatic encounters worldwide...",
  "Discovering activist collaborations...",
  "Connecting dots across entertainment, politics, and beyond...",
  "Exploring the web of famous encounters...",
];

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
  // const [animationKey, setAnimationKey] = useState(0); // Removed with animation
  const [showForm, setShowForm] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Rotate loading messages every 2 seconds while loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0); // Reset when not loading
    }
  }, [loading]);

  const handleRandomConnection = () => {
    const [celeb1, celeb2] = getRandomPair();
    setFromCeleb({
      qid: celeb1.qid,
      name: celeb1.name,
      description: celeb1.description,
    });
    setToCeleb({
      qid: celeb2.qid,
      name: celeb2.name,
      description: celeb2.description,
    });
    // Auto-trigger search after setting celebs
    setTimeout(() => {
      handleLinkWithCelebs({
        qid: celeb1.qid,
        name: celeb1.name,
        description: celeb1.description,
      }, {
        qid: celeb2.qid,
        name: celeb2.name,
        description: celeb2.description,
      });
    }, 100);
  };

  const handleLinkWithCelebs = async (from: Suggestion, to: Suggestion) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowForm(false); // Hide form when searching
    setShowResults(true);

    try {
      const res = await fetch('/api/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate link');
      }

      const data = await res.json();
      setResult(data);

      // Show form again if no connections found
      if (!data.edges || data.edges.length === 0) {
        setShowForm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowForm(true); // Show form on error
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!fromCeleb || !toCeleb) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowForm(false); // Hide form when searching
    setShowResults(true);

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
      // setAnimationKey((prev) => prev + 1); // Removed with animation

      // Show form again if no connections found
      if (!data.edges || data.edges.length === 0) {
        setShowForm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowForm(true); // Show form on error
    } finally {
      setLoading(false);
    }
  };

  const canLink = fromCeleb && toCeleb && !loading;

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Sparkle effects */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-block relative">
            {/* Glow effect behind title */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 blur-3xl opacity-30 animate-pulse"></div>
            <h1 className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 relative animate-gradient">
              CelebLink
            </h1>
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-gradient"></div>
          </div>
          <p className="text-muted text-xl sm:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            A fun way to connect celebrities through their shared moments and meetings
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={handleRandomConnection}
              disabled={loading}
              className="group px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Random Connection
            </button>
          </div>
        </div>

        {/* Search inputs */}
        {showForm && (
          <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-glow-lg space-y-8 animate-slide-in">
            <SearchCombo
              label="From Celebrity"
              value={fromCeleb}
              onSelect={setFromCeleb}
            />

            <div className="flex justify-center my-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
                <div className="relative w-14 h-14 flex items-center justify-center rounded-full glass border-2 border-accent/30">
                  <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>

            <SearchCombo
              label="To Celebrity"
              value={toCeleb}
              onSelect={setToCeleb}
            />

            <div className="flex justify-center pt-4">
              <button
                onClick={handleLink}
                disabled={!canLink}
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg disabled:transform-none disabled:hover:scale-100 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <LoadingWordRing />
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Find Connection</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="glass-strong rounded-3xl p-12 sm:p-16 shadow-glow flex flex-col items-center justify-center animate-scale-in space-y-4">
            <LoadingWordRing />
            <p className="text-muted text-lg text-center transition-all duration-500 ease-in-out">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/5 text-center animate-scale-in">
            <div className="flex items-center justify-center gap-3 text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowResults(!showResults)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                {showResults ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Minimize
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Connection
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setResult(null);
                  setShowResults(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Another
              </button>
            </div>

            {showResults && (
              <>
                {/* Path viewer */}
                <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-glow">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-text">
                      Connection Path
                    </h2>
                  </div>
                  <PathViewer nodes={result.nodes} edges={result.edges} />
                </div>

                {/* Animation below - REMOVED per user request */}
                {/* {result.edges.length > 0 && (
                  <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-glow">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-text">
                        Visual Timeline
                      </h2>
                    </div>
                    <HandshakeTimeline
                      key={animationKey}
                      nodes={result.nodes}
                      edges={result.edges}
                      autoPlay={true}
                    />
                  </div>
                )} */}
              </>
            )}
          </div>
        )}

        {/* Google Ad - Only show after results */}
        {result && result.edges.length > 0 && (
          <div className="flex justify-center pt-8">
            <GoogleAd
              slot="1234567890"
              format="horizontal"
              className="max-w-3xl"
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted/70 text-sm pt-12 space-y-4">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Powered by Wikidata and Wikimedia Commons
          </p>

          {/* Subtle footer ad */}
          <div className="flex justify-center opacity-70 hover:opacity-100 transition-opacity">
            <GoogleAd
              slot="0987654321"
              format="auto"
              className="max-w-2xl"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
