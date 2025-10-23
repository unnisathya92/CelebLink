import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CelebLink Connection';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { from: string; to: string } }) {
  const fromName = decodeURIComponent(params.from)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const toName = decodeURIComponent(params.to)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(99, 102, 241, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(139, 92, 246, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Logo/Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            CelebLink
          </div>
        </div>

        {/* Connection Display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            padding: '60px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 24,
            border: '2px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: '#f1f5f9',
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            {fromName}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 4,
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontSize: 32,
                color: '#94a3b8',
              }}
            >
              connected to
            </div>
            <div
              style={{
                width: 60,
                height: 4,
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                borderRadius: 2,
              }}
            />
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: '#f1f5f9',
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            {toName}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: '#94a3b8',
          }}
        >
          Discover the connection at celebslinks.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
