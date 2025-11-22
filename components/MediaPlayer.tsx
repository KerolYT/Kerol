import React, { useRef, useEffect } from 'react';
import { ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

interface MediaPlayerProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | undefined;
  audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | undefined;
  uid: string | number;
  isLocal?: boolean;
  audioLevel?: number;
  hasAudio: boolean;
  hasVideo: boolean;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  videoTrack, 
  uid, 
  isLocal, 
  audioLevel = 0,
  hasAudio,
  hasVideo
}) => {
  const container = useRef<HTMLDivElement>(null);
  
  const isSpeaking = audioLevel > 5;

  useEffect(() => {
    if (!container.current) return;
    
    if (videoTrack) {
      videoTrack.play(container.current);
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden bg-black group ring-2 transition-all duration-200 ${isSpeaking ? 'ring-discord-green' : 'ring-transparent'}`}>
      
      {/* Video Layer */}
      {hasVideo && videoTrack ? (
         <div 
            ref={container} 
            className="w-full h-full object-cover"
            style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }} 
         ></div>
      ) : (
         // Fallback Avatar
         <div className="absolute inset-0 flex items-center justify-center bg-[#202225]">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold text-white shadow-md transition-all duration-200 ${isSpeaking ? 'ring-4 ring-discord-green bg-discord-accent' : 'bg-discord-server'}`}>
               {String(uid).slice(0, 1).toUpperCase() || "U"}
            </div>
         </div>
      )}

      {/* Name Tag Overlay (Bottom Left) */}
      <div className="absolute bottom-2 left-2 max-w-[80%]">
         <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1.5 shadow-sm select-none">
            {/* Status Icon */}
            {!hasAudio ? (
               <svg className="w-3.5 h-3.5 text-discord-red" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 2.76 2.24 5 5 5 .52 0 1.03-.11 1.5-.29l2.24 2.24L19 16.73 4.27 3zM12 19c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46l-1.77-1.77c-.29.11-.58.19-.87.23z"/></svg>
            ) : (
               <svg className={`w-3.5 h-3.5 ${isSpeaking ? 'text-discord-green' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
            <span className="truncate">{isLocal ? "You" : `User ${uid}`}</span>
         </div>
      </div>
      
      {/* Connection Quality / Mute Indicator (Top Right) */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {!hasVideo && (
          <div className="bg-black/60 text-white p-1 rounded text-[10px] font-bold uppercase tracking-wider px-1.5">
            Video Off
          </div>
        )}
      </div>

    </div>
  );
};

export default MediaPlayer;