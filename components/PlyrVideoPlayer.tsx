'use client';

import React, { useEffect, useRef } from 'react';
import 'plyr-react/plyr.css';

interface PlyrVideoPlayerProps {
  url: string;
  title?: string;
}

export default function PlyrVideoPlayer({ url }: PlyrVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const getYouTubeId = (urlStr: string) => {
    if (!urlStr) return '';
    try {
      if (urlStr.includes('youtu.be/')) {
        return urlStr.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      if (urlStr.includes('youtube.com/watch')) {
        const urlObj = new URL(urlStr);
        return urlObj.searchParams.get('v') || '';
      }
      if (urlStr.includes('youtube.com/embed/')) {
        return urlStr.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  };

  const videoId = getYouTubeId(url);

  useEffect(() => {
    if (!containerRef.current || !videoId) return;

    let playerInstance: any = null;

    // Dynamically import Plyr library on client side only to avoid SSR issues
    import('plyr').then(({ default: Plyr }) => {
      if (!containerRef.current) return;

      try {
        playerInstance = new Plyr(containerRef.current, {
          autoplay: false,
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'fullscreen',
          ],
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
          },
        });
        playerRef.current = playerInstance;
      } catch (e) {
        // Safe catch for player initialization race condition
      }
    });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Safe catch on cleanup
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  if (!videoId) return null;

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950 flex items-center justify-center">
      <div
        key={videoId}
        ref={containerRef}
        data-plyr-provider="youtube"
        data-plyr-embed-id={videoId}
        className="w-full h-full"
      />
    </div>
  );
}
