import React, { useState } from 'react';
import { IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface ControlsProps {
  localAudioTrack: IMicrophoneAudioTrack | null;
  localVideoTrack: ICameraVideoTrack | null;
  leave: () => void;
}

const ControlButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  label?: string;
  variant?: 'normal' | 'danger';
}> = ({ onClick, isActive, onIcon, offIcon, variant = 'normal' }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
      ${variant === 'danger' 
         ? 'bg-discord-red hover:bg-red-600 text-white' 
         : isActive 
            ? 'bg-discord-sidebar hover:bg-discord-active text-discord-text-normal' 
            : 'bg-white text-black hover:bg-gray-200'}
    `}
    title={variant === 'danger' ? "Disconnect" : ""}
  >
    {isActive ? onIcon : offIcon}
  </button>
);

const Controls: React.FC<ControlsProps> = ({ localAudioTrack, localVideoTrack, leave }) => {
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!trackState.audio);
      setTrackState((ps) => ({ ...ps, audio: !ps.audio }));
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!trackState.video);
      setTrackState((ps) => ({ ...ps, video: !ps.video }));
    }
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-discord-server/90 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl mb-6">
      {/* Mic */}
      <ControlButton 
        onClick={toggleAudio} 
        isActive={trackState.audio} 
        onIcon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        } 
        offIcon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 2.76 2.24 5 5 5 .52 0 1.03-.11 1.5-.29l2.24 2.24L19 16.73 4.27 3zM12 19c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46l-1.77-1.77c-.29.11-.58.19-.87.23z"/></svg>
        } 
      />
      
      {/* Video */}
      <ControlButton 
        onClick={toggleVideo} 
        isActive={trackState.video} 
        onIcon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        } 
        offIcon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9.56 8l-2-2-4.15-4.15L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 9.56 8zM5 16V8h1.27l8 8H5zM21 8l-4 4v-3.5L21 19V8z"/></svg>
        } 
      />

      {/* Share Screen (Mock) */}
      <button className="flex items-center justify-center w-12 h-12 rounded-full bg-discord-sidebar hover:bg-discord-active text-discord-text-normal transition-all">
         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
      </button>

      <div className="w-px h-8 bg-white/10 mx-2"></div>

      <ControlButton
        onClick={leave}
        isActive={false}
        variant="danger"
        onIcon={<></>}
        offIcon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.11.25-4.59.69l2.12 2.12c1.37-1.07 3.3-1.07 4.67 0l2.11-2.12C15.11 9.25 13.6 9 12 9zm4.21-2.79c-2.31-2.31-6.07-2.31-8.38 0l1.39 1.39c1.6-1.27 3.58-1.22 5.23.13l1.76-1.52zM12 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        }
      />
    </div>
  );
};

export default Controls;