'use client';

import { useEffect, useRef, useState } from 'react';

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

const MALE_COLOR = '#3b82f6';
const FEMALE_COLOR = '#ec4899';
const DEFAULT_COLOR = '#9aa4bd';

export default function HandshakeTimeline({
  nodes,
  edges,
  autoPlay = true,
}: HandshakeTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !isAnimating && edges.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => playAnimation(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, edges.length]);

  const getPersonColor = (person: Person) => {
    if (person.gender === 'male') return MALE_COLOR;
    if (person.gender === 'female') return FEMALE_COLOR;
    return DEFAULT_COLOR;
  };

  const playAnimation = async () => {
    if (isAnimating || !svgRef.current || edges.length === 0) return;

    setIsAnimating(true);

    try {
      if (prefersReducedMotion) {
        // Reduced motion: just fade and snap
        await playReducedMotionAnimation();
      } else {
        // Full animation with walking
        await playFullAnimation();
      }
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const playReducedMotionAnimation = async () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Show all figures and evidence cards with fade-in
    for (let i = 0; i < edges.length; i++) {
      const figure = svg.querySelector(`#figure-${i + 1}`);
      const evidence = svg.querySelector(`#evidence-${i}`);

      if (figure) {
        await animate(figure, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          fill: 'forwards',
        });
      }

      if (evidence) {
        await animate(evidence, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          fill: 'forwards',
        });
      }
    }

    // Final zoom
    const firstFigure = svg.querySelector('#figure-0');
    const lastFigure = svg.querySelector(`#figure-${nodes.length - 1}`);
    if (firstFigure && lastFigure) {
      await Promise.all([
        animate(firstFigure, [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], {
          duration: 400,
          fill: 'forwards',
        }),
        animate(lastFigure, [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], {
          duration: 400,
          fill: 'forwards',
        }),
      ]);
    }
  };

  const playFullAnimation = async () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Animate each connection
    for (let i = 0; i < edges.length; i++) {
      const figure = svg.querySelector(`#figure-${i + 1}`);
      const leftArm = svg.querySelector(`#figure-${i + 1}-left-arm`);
      const rightArmPrev = svg.querySelector(`#figure-${i}-right-arm`);
      const evidence = svg.querySelector(`#evidence-${i}`);

      if (!figure) continue;

      // 1. Walk in from right
      await animate(
        figure,
        [
          { transform: 'translateX(100px)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 },
        ],
        { duration: 600, easing: 'ease-out', fill: 'forwards' }
      );

      // 2. Handshake (move arms)
      const handshakePromises = [];
      if (leftArm) {
        handshakePromises.push(
          animate(
            leftArm,
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-45deg)' }],
            { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      }
      if (rightArmPrev) {
        handshakePromises.push(
          animate(
            rightArmPrev,
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(45deg)' }],
            { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      }
      await Promise.all(handshakePromises);

      // 3. Show evidence card
      if (evidence) {
        await animate(evidence, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 400,
          fill: 'forwards',
        });
      }

      // 4. Return arms
      const returnPromises = [];
      if (leftArm) {
        returnPromises.push(
          animate(
            leftArm,
            [{ transform: 'rotate(-45deg)' }, { transform: 'rotate(0deg)' }],
            { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      }
      if (rightArmPrev) {
        returnPromises.push(
          animate(
            rightArmPrev,
            [{ transform: 'rotate(45deg)' }, { transform: 'rotate(0deg)' }],
            { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      }
      await Promise.all(returnPromises);

      // Small pause
      await delay(200);
    }

    // Final: zoom first and last, first places hand on last's shoulder
    const firstFigure = svg.querySelector('#figure-0');
    const lastFigure = svg.querySelector(`#figure-${nodes.length - 1}`);
    const firstLeftArm = svg.querySelector('#figure-0-left-arm');

    if (firstFigure && lastFigure) {
      const promises = [
        animate(
          firstFigure,
          [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
          { duration: 500, fill: 'forwards' }
        ),
        animate(
          lastFigure,
          [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
          { duration: 500, fill: 'forwards' }
        ),
      ];

      if (firstLeftArm) {
        promises.push(
          animate(
            firstLeftArm,
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-30deg)' }],
            { duration: 500, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      }

      await Promise.all(promises);
    }
  };

  // Helper to promisify Web Animations API
  const animate = (
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ): Promise<void> => {
    return new Promise((resolve) => {
      const animation = element.animate(keyframes, options);
      animation.onfinish = () => resolve();
    });
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  if (edges.length === 0) return null;

  const figureSpacing = 150;
  const figureHeight = 120;
  const headRadius = 20;

  return (
    <div className="w-full overflow-x-auto bg-surface rounded-xl p-8 border border-border">
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={playAnimation}
          disabled={isAnimating}
          className="px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
        >
          {isAnimating ? 'Animating...' : 'Play Animation'}
        </button>

        <svg
          ref={svgRef}
          width={Math.max(800, nodes.length * figureSpacing + 100)}
          height={300}
          className="mx-auto"
        >
          {/* Render all stick figures */}
          {nodes.map((node, index) => {
            const x = 100 + index * figureSpacing;
            const y = 150;
            const color = getPersonColor(node);
            const isFirst = index === 0;
            const isLast = index === nodes.length - 1;

            return (
              <g
                key={node.qid}
                id={`figure-${index}`}
                style={{ opacity: isFirst ? 1 : 0 }}
              >
                {/* Head with image */}
                <defs>
                  <clipPath id={`clip-${index}`}>
                    <circle cx={x} cy={y - figureHeight / 2} r={headRadius} />
                  </clipPath>
                </defs>
                {node.img ? (
                  <image
                    href={node.img}
                    x={x - headRadius}
                    y={y - figureHeight / 2 - headRadius}
                    width={headRadius * 2}
                    height={headRadius * 2}
                    clipPath={`url(#clip-${index})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y - figureHeight / 2}
                    r={headRadius}
                    fill={color}
                    opacity="0.5"
                  />
                )}
                <circle
                  cx={x}
                  cy={y - figureHeight / 2}
                  r={headRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                />

                {/* Body */}
                <line
                  x1={x}
                  y1={y - figureHeight / 2 + headRadius}
                  x2={x}
                  y2={y - 10}
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Left arm */}
                <g id={`figure-${index}-left-arm`} style={{ transformOrigin: `${x}px ${y - 50}px` }}>
                  <line
                    x1={x}
                    y1={y - 50}
                    x2={x - 25}
                    y2={y - 30}
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>

                {/* Right arm */}
                <g id={`figure-${index}-right-arm`} style={{ transformOrigin: `${x}px ${y - 50}px` }}>
                  <line
                    x1={x}
                    y1={y - 50}
                    x2={x + 25}
                    y2={y - 30}
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>

                {/* Legs */}
                <line
                  x1={x}
                  y1={y - 10}
                  x2={x - 15}
                  y2={y + 30}
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={x}
                  y1={y - 10}
                  x2={x + 15}
                  y2={y + 30}
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Name label */}
                <text
                  x={x}
                  y={y + 55}
                  textAnchor="middle"
                  fill="#e6e6f0"
                  fontSize="12"
                  fontWeight="500"
                >
                  {node.name}
                </text>
              </g>
            );
          })}

          {/* Evidence cards between figures */}
          {edges.map((edge, index) => {
            const x = 100 + index * figureSpacing + figureSpacing / 2;
            const y = 80;

            return (
              <g key={index} id={`evidence-${index}`} style={{ opacity: 0 }}>
                <rect
                  x={x - 30}
                  y={y - 15}
                  width={60}
                  height={30}
                  fill="#8b5cf6"
                  rx="4"
                  opacity="0.8"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="600"
                  dominantBaseline="middle"
                >
                  Photo
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
