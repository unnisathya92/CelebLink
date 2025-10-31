'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export default function GoogleAd({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isInitialized = useRef(false);

  // Don't load ads in development
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Skip ad loading in development
    if (!isProduction) {
      return;
    }

    // Prevent double initialization
    if (isInitialized.current) return;

    // Wait for the container to be properly sized
    const timer = setTimeout(() => {
      try {
        // Check if the ad container has proper width
        if (adRef.current && adRef.current.offsetWidth > 0) {
          console.log(`AdSense: Initializing ad slot ${slot}`);
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isInitialized.current = true;

          // Check for ad errors after a delay
          setTimeout(() => {
            if (adRef.current) {
              const hasAd = adRef.current.querySelector('ins[data-ad-status]');
              const status = hasAd?.getAttribute('data-ad-status');
              if (status === 'unfilled') {
                console.info(`AdSense: Slot ${slot} - No ads available right now (unfilled). This is normal.`);
              } else if (!hasAd) {
                console.warn(`AdSense: Slot ${slot} - Ad failed to load.`);
                console.warn('Most likely reason: Site is still under review ("Getting ready" status)');
                console.warn('Check: https://www.google.com/adsense → Sites');
                console.warn('Once status changes to "Ready", ads will start showing.');
              } else {
                console.log(`AdSense: Slot ${slot} loaded successfully (status: ${status})`);
              }
            }
          }, 2000);
        } else {
          console.log('AdSense: Container not ready, skipping ad load');
        }
      } catch (err) {
        console.error(`AdSense error for slot ${slot}:`, err);
      }
    }, 100); // Small delay to let DOM settle

    return () => clearTimeout(timer);
  }, [slot]);

  // Show placeholder in development
  if (!isProduction) {
    return (
      <div className={`google-ad-container ${className}`} style={{ minWidth: '300px', minHeight: '50px' }}>
        <div className="text-center text-gray-400 text-xs py-4 border border-dashed border-gray-600 rounded">
          [Ad Placeholder - Ads only load in production]
        </div>
      </div>
    );
  }

  return (
    <div className={`google-ad-container ${className}`} style={{ minWidth: '300px', minHeight: '50px' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '50px' }}
        data-ad-client="ca-pub-2217932579992453"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
}
