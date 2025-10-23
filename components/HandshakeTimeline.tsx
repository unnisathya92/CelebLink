'use client';

import { useState, useEffect } from 'react';

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

interface HandshakeTimelineProps {
  nodes: Person[];
  edges: Edge[];
  autoPlay?: boolean;
}

export default function HandshakeTimeline({
  nodes,
  edges,
  autoPlay = true,
}: HandshakeTimelineProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (autoPlay && edges.length > 0) {
      // Animate lines appearing one by one
      const timer = setTimeout(() => {
        edges.forEach((_, index) => {
          setTimeout(() => {
            setVisibleLines((prev) => [...prev, index]);
          }, index * 800); // 800ms delay between each line
        });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Show all lines immediately if not autoPlay
      setVisibleLines(edges.map((_, i) => i));
    }
  }, [autoPlay, edges.length]);

  const handleImgError = (index: number) => {
    setImgErrors((prev) => new Set([...prev, index]));
  };

  const getNodeByQid = (qid: string): Person | undefined => {
    return nodes.find((node) => node.qid === qid);
  };

  if (edges.length === 0) {
    return (
      <div className="text-center text-muted py-8">
        <p>No connection path found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {edges.map((edge, index) => {
        const fromNode = getNodeByQid(edge.from);
        const toNode = getNodeByQid(edge.to);
        const isVisible = visibleLines.includes(index);
        const hasPhoto = edge.photo.url && !imgErrors.has(index);

        if (!fromNode || !toNode) return null;

        return (
          <div
            key={index}
            className={`transition-all duration-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="glass rounded-2xl p-6 border border-border hover:border-accent/30 transition-all">
              <div className="flex items-center gap-4 flex-wrap">
                {/* From Celebrity */}
                <div className="flex items-center gap-3 min-w-[150px]">
                  {fromNode.img ? (
                    <img
                      src={fromNode.img}
                      alt={fromNode.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-accent/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-accent">
                        {fromNode.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-semibold text-text">{fromNode.name}</span>
                </div>

                {/* Arrow */}
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

                {/* To Celebrity */}
                <div className="flex items-center gap-3 min-w-[150px]">
                  {toNode.img ? (
                    <img
                      src={toNode.img}
                      alt={toNode.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-accent/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-accent">
                        {toNode.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-semibold text-text">{toNode.name}</span>
                </div>

                {/* Arrow */}
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

                {/* Meeting Photo and Location */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  {hasPhoto ? (
                    <div className="relative overflow-hidden rounded-xl w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex-shrink-0">
                      <img
                        src={edge.photo.url}
                        alt={edge.photo.caption}
                        className="w-full h-full object-cover"
                        onError={() => handleImgError(index)}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-accent/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="text-sm text-muted line-clamp-2">
                      {edge.photo.caption}
                    </div>
                    {edge.photo.location && (
                      <div className="flex items-center gap-1 text-xs text-accent mt-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{edge.photo.location}</span>
                      </div>
                    )}
                    {edge.photo.date && (
                      <div className="flex items-center gap-1 text-xs text-muted/70 mt-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{edge.photo.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
