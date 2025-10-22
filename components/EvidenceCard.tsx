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
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex gap-4">
      <div className="flex-shrink-0">
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-[72px] h-[72px] object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-text font-bold mb-1">{photo.caption}</div>
        {(photo.date || photo.location) && (
          <div className="text-muted text-sm mb-1">
            {[photo.date, photo.location].filter(Boolean).join(' • ')}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
          {photo.license && <span>{photo.license}</span>}
          {photo.source && (
            <>
              {photo.license && <span>•</span>}
              <a
                href={photo.source}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Source
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
