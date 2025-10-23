import EvidenceCard from './EvidenceCard';
import ShareButton from './ShareButton';

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
      <div className="text-center py-16">
        <div className="inline-block p-6 rounded-full bg-muted/10 mb-6">
          <svg className="w-16 h-16 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-text text-xl font-semibold mb-3">
          No Connection Found
        </div>
        <div className="text-muted text-base max-w-md mx-auto leading-relaxed">
          These celebrities may not have public photos together. Try different
          selections or check back later as new photos are added to public
          databases.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {onPlay && (
        <div className="flex justify-center">
          <button
            onClick={onPlay}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-glow"
          >
            Play Animation
          </button>
        </div>
      )}

      <div className="space-y-6">
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.qid === edge.from);
          const toNode = nodes.find((n) => n.qid === edge.to);
          const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

          return (
            <div key={index} className={`relative space-y-4 ${staggerClass}`}>
              {/* From person (show only on first edge) */}
              {index === 0 && fromNode && (
                <div className="flex items-center gap-4 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-300">
                  {fromNode.img && (
                    <div className="relative">
                      <img
                        src={fromNode.img}
                        alt={fromNode.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/10"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    </div>
                  )}
                  <span className="text-text font-semibold text-lg">{fromNode.name}</span>
                </div>
              )}

              {/* Connection line */}
              <div className="flex items-center gap-3 pl-7">
                <div className="flex flex-col items-center gap-1 relative">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-transparent via-accent/50 to-accent relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-2 bg-gradient-to-b from-accent to-transparent animate-flow-down"></div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-accent shadow-glow animate-pulse"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-b from-accent to-accent/50 relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-2 bg-gradient-to-b from-accent to-transparent animate-flow-down" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <EvidenceCard photo={edge.photo} />
                </div>
              </div>

              {/* To person */}
              {toNode && (
                <div className="flex items-center gap-4 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-300">
                  {toNode.img && (
                    <div className="relative">
                      <img
                        src={toNode.img}
                        alt={toNode.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/10"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    </div>
                  )}
                  <span className="text-text font-semibold text-lg">{toNode.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Share Button */}
      {nodes.length >= 2 && (
        <ShareButton
          fromName={nodes[0].name}
          toName={nodes[nodes.length - 1].name}
          pathLength={edges.length}
        />
      )}
    </div>
  );
}
