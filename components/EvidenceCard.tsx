'use client';

import { useState } from 'react';

interface EdgePhoto {
  url: string;
  caption: string;
  date?: string;
  location?: string;
  license?: string;
  source?: string;
}

interface EvidenceCardProps {
  photo: EdgePhoto;
}

export default function EvidenceCard({ photo }: EvidenceCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasPhoto = !imgError && photo.url && !photo.url.includes('example.com');

  return (
    <div className="group glass rounded-2xl p-5 flex gap-5 hover:border-accent/30 transition-all duration-300 hover:shadow-glow">
      {hasPhoto && (
        <div className="flex-shrink-0">
          <div className="relative overflow-hidden rounded-xl w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="text-text font-semibold text-base leading-snug">{photo.caption}</div>
        {(photo.date || photo.location) && (
          <div className="flex items-center gap-2 text-muted text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{[photo.date, photo.location].filter(Boolean).join(' • ')}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-muted/70">
          {photo.license && (
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">
              {photo.license}
            </span>
          )}
          {photo.source && (
            <a
              href={photo.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
