'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  initialTime?: number;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({ url, initialTime = 0, onEnded, onTimeUpdate }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialTimeRef = useRef(initialTime);

  useEffect(() => {
    initialTimeRef.current = initialTime;
  }, [initialTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    let cancelled = false;

    setLoading(true);
    setError(null);

    const applyInitialTime = () => {
      const seekTo = initialTimeRef.current;
      if (seekTo > 0) {
        video.currentTime = seekTo;
      }
    };

    const setup = async () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          if (cancelled) return;
          setLoading(false);
          applyInitialTime();
        });
        video.addEventListener('error', () => {
          if (cancelled) return;
          setError('Không thể tải luồng video này.');
          setLoading(false);
        });
        return;
      }

      const HlsModule = await import('hls.js');
      if (cancelled) return;

      const HlsClass = HlsModule.default;
      if (!HlsClass.isSupported()) {
        setError('Trình duyệt không hỗ trợ phát luồng HLS m3u8.');
        setLoading(false);
        return;
      }

      hls = new HlsClass({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        startLevel: -1,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        setLoading(false);
        applyInitialTime();
      });

      hls.on(HlsClass.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case HlsClass.ErrorTypes.NETWORK_ERROR:
              setError('Lỗi kết nối mạng, đang thử lại...');
              hls?.startLoad();
              break;
            case HlsClass.ErrorTypes.MEDIA_ERROR:
              setError('Lỗi giải mã đa phương tiện, đang khôi phục...');
              hls?.recoverMediaError();
              break;
            default:
              setError('Gặp sự cố không mong muốn khi phát luồng.');
              hls?.destroy();
              break;
          }
        }
      });
    };

    setup();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [url]);

  return (
    <div className="relative group w-full h-full bg-black mx-auto">
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
          <Loader2 className="animate-spin text-accent-gold" size={60} />
          <p className="text-sm font-medium text-white/90 animate-pulse">Đang tải luồng video...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-10 text-center gap-6">
          <AlertCircle className="text-accent-gold" size={64} />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white">Sự cố phát video</h3>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors hover:bg-white/20 border border-white/20"
          >
            Tải lại trang
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        controls
        playsInline
        preload="metadata"
        style={{ accentColor: '#E3A73F' }}
        onEnded={onEnded}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          if (onTimeUpdate) {
            onTimeUpdate(video.currentTime, video.duration);
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
