import EvidenceCard from './EvidenceCard';

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

interface PathViewerProps {
  nodes: Person[];
  edges: Edge[];
  onPlay?: () => void;
}

export default function PathViewer({ nodes, edges, onPlay }: PathViewerProps) {
  if (edges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text text-lg font-medium mb-2">
          No co-photo path found
        </div>
        <div className="text-muted text-sm">
          These celebrities may not have public photos together. Try different
          selections or check back later as new photos are added to public
          databases.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onPlay && (
        <div className="flex justify-center">
          <button
            onClick={onPlay}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors"
          >
            Play Animation
          </button>
        </div>
      )}

      <div className="space-y-4">
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.qid === edge.from);
          const toNode = nodes.find((n) => n.qid === edge.to);

          return (
            <div key={index} className="space-y-3">
              {/* From person (show only on first edge) */}
              {index === 0 && fromNode && (
                <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-xl border border-border">
                  {fromNode.img && (
                    <img
                      src={fromNode.img}
                      alt={fromNode.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <span className="text-text font-medium">{fromNode.name}</span>
                </div>
              )}

              {/* Evidence card */}
              <div className="pl-8">
                <EvidenceCard photo={edge.photo} />
              </div>

              {/* To person */}
              {toNode && (
                <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-xl border border-border">
                  {toNode.img && (
                    <img
                      src={toNode.img}
                      alt={toNode.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <span className="text-text font-medium">{toNode.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
