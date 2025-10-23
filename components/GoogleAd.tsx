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
  const adRef = useRef<HTMLElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) return;

    // Wait for the container to be properly sized
    const timer = setTimeout(() => {
      try {
        // Check if the ad container has proper width
        if (adRef.current && adRef.current.offsetWidth > 0) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isInitialized.current = true;
        } else {
          console.log('AdSense: Container not ready, skipping ad load');
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }, 100); // Small delay to let DOM settle

    return () => clearTimeout(timer);
  }, []);

  // Don't show ads if client ID is not configured
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  return (
    <div className={`google-ad-container ${className}`} style={{ minWidth: '300px', minHeight: '50px' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '50px' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
}
