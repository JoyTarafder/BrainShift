"use client";

import "plyr-react/plyr.css";
import { useEffect, useRef, useState } from "react";

interface PlyrVideoPlayerProps {
  url: string;
  title?: string;
  userEmail?: string;
}

export default function PlyrVideoPlayer({
  url,
  title,
  userEmail,
}: PlyrVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Dynamic watermark floating state
  const [watermarkPos, setWatermarkPos] = useState({ top: 25, left: 15 });

  useEffect(() => {
    if (!userEmail) return;
    const interval = setInterval(() => {
      const nextTop = Math.floor(Math.random() * 60) + 15;
      const nextLeft = Math.floor(Math.random() * 55) + 10;
      setWatermarkPos({ top: nextTop, left: nextLeft });
    }, 4500);

    return () => clearInterval(interval);
  }, [userEmail]);

  const getYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    try {
      if (urlStr.includes("youtu.be/")) {
        return urlStr.split("youtu.be/")[1]?.split("?")[0] || null;
      }
      if (urlStr.includes("youtube.com/watch")) {
        const urlObj = new URL(urlStr);
        return urlObj.searchParams.get("v") || null;
      }
      if (urlStr.includes("youtube.com/embed/")) {
        return urlStr.split("youtube.com/embed/")[1]?.split("?")[0] || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getGoogleDriveFileId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    try {
      const fileDMatch = urlStr.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        return fileDMatch[1];
      }
      const idParamMatch = urlStr.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        return idParamMatch[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const youtubeId = getYouTubeId(url);
  const driveFileId = getGoogleDriveFileId(url);

  useEffect(() => {
    if (!containerRef.current || !youtubeId) return;

    let playerInstance: any = null;

    // Dynamically import Plyr library on client side only to avoid SSR issues
    import("plyr").then(({ default: Plyr }) => {
      if (!containerRef.current) return;

      try {
        playerInstance = new Plyr(containerRef.current, {
          autoplay: false,
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "captions",
            "settings",
            "pip",
            "fullscreen",
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
  }, [youtubeId]);

  // Floating Watermark JSX element
  const renderWatermark = () => {
    if (!userEmail) return null;
    return (
      <div
        style={{
          top: `${watermarkPos.top}%`,
          left: `${watermarkPos.left}%`,
          transition: "top 3.5s ease-in-out, left 3.5s ease-in-out",
        }}
        className="absolute z-30 pointer-events-none   text-amber-600 font-mono text-[11px] font-bold px-3 py-1 opacity-50 select-none flex items-center gap-1.5"
      >
        {/* <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> */}
        <span>{userEmail}</span>
      </div>
    );
  };

  // 1. Google Drive Video Player
  if (driveFileId) {
    return (
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950 flex items-center justify-center group">
        <iframe
          src={`https://drive.google.com/file/d/${driveFileId}/preview`}
          className="w-full h-full border-0 rounded-3xl min-h-[300px]"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title || "Google Drive Video Player"}
        />
        {/* Dynamic User Email Floating Watermark */}
        {renderWatermark()}

        {/* TutorNova Brand Shield Overlay covering top-right popout icon & blocking clicks */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-0 right-0 z-40 bg-[#0b2545] p-3 pt-2.5 pr-4 rounded-bl-2xl rounded-tr-3xl border-b border-l border-amber-500/40 shadow-2xl flex items-center justify-center cursor-default select-none"
        >
          <img
            src="/images/logo.png"
            alt="TutorNova"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>
      </div>
    );
  }

  // 2. YouTube Plyr Player
  if (youtubeId) {
    return (
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950 flex items-center justify-center group">
        <div
          key={youtubeId}
          ref={containerRef}
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeId}
          className="w-full h-full"
        />
        {/* Dynamic User Email Floating Watermark */}
        {renderWatermark()}

        {/* TutorNova Brand Shield Overlay covering top-right corner */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-0 right-0 z-40 bg-[#0b2545] p-3 pt-2.5 pr-4 rounded-bl-2xl rounded-tr-3xl border-b border-l border-amber-500/40 shadow-2xl flex items-center justify-center cursor-default select-none"
        >
          <img
            src="/images/logo.png"
            alt="TutorNova"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>
      </div>
    );
  }

  // 3. Fallback generic video embed player
  if (!url) return null;

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950 flex items-center justify-center group">
      <iframe
        src={url}
        className="w-full h-full border-0 rounded-3xl min-h-[300px]"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={title || "Video Player"}
      />
      {/* Dynamic User Email Floating Watermark */}
      {renderWatermark()}

      {/* TutorNova Brand Shield Overlay covering top-right corner */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="absolute top-0 right-0 z-40 bg-[#0b2545] p-3 pt-2.5 pr-4 rounded-bl-2xl rounded-tr-3xl border-b border-l border-amber-500/40 shadow-2xl flex items-center justify-center cursor-default select-none"
      >
        <img
          src="/images/logo.png"
          alt="TutorNova"
          className="h-7 sm:h-8 w-auto object-contain"
        />
      </div>
    </div>
  );
}
