import React, { useState } from 'react';
import { useAgora } from './hooks/useAgora';
import JoinForm from './components/JoinForm';
import MediaPlayer from './components/MediaPlayer';
import Controls from './components/Controls';
import { ConnectionConfig } from './types';

/* --- UI Components for Layout --- */

const ServerIcon: React.FC<{ active?: boolean; img?: string; label?: string; color?: string }> = ({ active, img, label, color }) => (
  <div className="group relative flex items-center justify-center w-[72px] mb-2 cursor-pointer">
    {/* Active Indicator */}
    <div className={`absolute left-0 bg-white rounded-r-full transition-all duration-200 ${active ? 'h-10 w-1 top-3' : 'h-2 w-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100'}`}></div>
    
    <div className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] ${active ? 'rounded-[16px]' : ''} transition-all duration-200 overflow-hidden flex items-center justify-center text-white font-bold text-sm relative ${color ? '' : 'bg-discord-server hover:bg-discord-accent'}`} style={{ backgroundColor: color }}>
      {img ? <img src={img} alt="Server" className="w-full h-full object-cover" /> : label}
    </div>
  </div>
);

const ChannelItem: React.FC<{ name: string; active?: boolean; type?: 'text' | 'voice' }> = ({ name, active, type = 'text' }) => (
  <div className={`flex items-center px-2 py-1.5 mx-2 rounded mb-0.5 cursor-pointer group ${active ? 'bg-discord-active text-white' : 'text-discord-text-muted hover:bg-discord-active/50 hover:text-discord-text-normal'}`}>
    <span className="mr-1.5 text-gray-400">
      {type === 'voice' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z" transform="rotate(90 12 12) scale(0.8)"/><path d="M0 0h24v24H0z" fill="none"/></svg>
        // Using a simple hash for text
      )}
    </span> 
    <span className={`font-medium ${active ? 'text-white' : ''}`}>{type === 'text' && '#'} {name}</span>
  </div>
);

const App: React.FC = () => {
  const {
    localAudioTrack,
    localVideoTrack,
    leave,
    join,
    joinState,
    remoteUsers,
    loading,
    error,
    localAudioLevel
  } = useAgora();

  const [activeChannelName, setActiveChannelName] = useState("General");

  const handleJoin = (config: ConnectionConfig) => {
    setActiveChannelName(config.channel);
    join(config);
  };

  if (!joinState) {
    return <JoinForm onJoin={handleJoin} isLoading={loading} error={error} />;
  }

  const allUsers = [
    { 
      uid: 'local', 
      videoTrack: localVideoTrack || undefined, 
      audioTrack: localAudioTrack || undefined, 
      isLocal: true,
      audioLevel: localAudioLevel,
      hasVideo: !!localVideoTrack,
      hasAudio: !!localAudioTrack
    },
    ...remoteUsers.map(u => ({ ...u, isLocal: false }))
  ];

  return (
    <div className="flex h-screen w-screen bg-discord-base text-discord-text-normal font-sans overflow-hidden">
      
      {/* 1. Server Rail (Leftmost) */}
      <nav className="w-[72px] bg-discord-server py-3 flex flex-col items-center shrink-0 overflow-y-auto no-scrollbar z-20">
        <ServerIcon label="DM" color="#5865F2" />
        <div className="w-8 h-[2px] bg-discord-sidebar rounded-lg mb-2"></div>
        <ServerIcon active label="MC" color="#313338" />
        <ServerIcon label="Gaming" img="https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=100&h=100&fit=crop" />
        <ServerIcon label="Music" img="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" />
        
        <div className="mt-auto flex flex-col gap-2">
           <div className="w-12 h-12 rounded-[24px] bg-discord-sidebar hover:bg-discord-green text-discord-green hover:text-white transition-all flex items-center justify-center cursor-pointer">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
           </div>
        </div>
      </nav>

      {/* 2. Channel Sidebar */}
      <div className="w-60 bg-discord-sidebar flex flex-col shrink-0 hidden md:flex rounded-tl-xl mt-0 z-10">
        {/* Server Header */}
        <header className="h-12 border-b border-black/20 flex items-center justify-between px-4 hover:bg-white/5 cursor-pointer transition-colors shadow-sm">
          <h1 className="font-bold text-white truncate">Mierdicord</h1>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </header>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          
          {/* Category: Text */}
          <div className="px-2 mb-4">
            <div className="flex items-center justify-between px-2 mb-1 text-xs font-bold text-discord-text-muted uppercase hover:text-discord-text-normal cursor-pointer">
              <span>Information</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <ChannelItem name="welcome" />
            <ChannelItem name="announcements" />
            <ChannelItem name="rules" />
          </div>

          {/* Category: Voice */}
          <div className="px-2">
            <div className="flex items-center justify-between px-2 mb-1 text-xs font-bold text-discord-text-muted uppercase hover:text-discord-text-normal cursor-pointer">
              <span>Voice Channels</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <ChannelItem name={activeChannelName} active type="voice" />
            <ChannelItem name="Gaming Lounge" type="voice" />
            <ChannelItem name="Music" type="voice" />
          </div>
        </div>

        {/* User Mini-Profile (Bottom) */}
        <div className="h-[52px] bg-[#232428] px-2 flex items-center justify-between">
          <div className="flex items-center gap-2 hover:bg-white/5 p-1 rounded cursor-pointer">
             <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white font-bold text-xs">You</div>
             <div className="text-xs">
                <div className="text-white font-bold">You</div>
                <div className="text-discord-text-muted">Online</div>
             </div>
          </div>
          <div className="flex items-center">
             <button className="p-2 hover:bg-white/10 rounded"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>
             <button className="p-2 hover:bg-white/10 rounded"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.11.2-.06.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.11-.22.06-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6-3.6-1.62 3.6-3.6 3.6z"/></svg></button>
          </div>
        </div>
      </div>

      {/* 3. Main Stage (Video Area) */}
      <main className="flex-1 flex flex-col bg-discord-base relative min-w-0">
        {/* Header */}
        <header className="h-12 border-b border-black/20 flex items-center px-4 shrink-0">
           <div className="flex items-center gap-2 text-discord-text-normal font-bold text-base">
              <svg className="w-6 h-6 text-discord-text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <span>{activeChannelName}</span>
           </div>
        </header>

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col relative">
          <div 
            className="w-full h-full grid gap-3 transition-all duration-500 ease-in-out"
            style={{
               display: 'grid',
               gridTemplateColumns: allUsers.length <= 1 ? '1fr' : 
                                    allUsers.length <= 4 ? 'repeat(2, 1fr)' : 
                                    'repeat(auto-fit, minmax(300px, 1fr))',
               gridAutoRows: allUsers.length <= 2 ? '1fr' : 'auto',
               alignContent: 'center',
               justifyContent: 'center',
               maxHeight: 'calc(100vh - 140px)' // Leave room for controls
            }}
          >
            {allUsers.map((user) => (
              <div 
                 key={user.uid} 
                 className={`relative w-full h-full ${allUsers.length === 1 ? 'max-w-5xl mx-auto aspect-video max-h-full' : 'aspect-video'}`}
              >
                <MediaPlayer 
                  videoTrack={user.videoTrack} 
                  audioTrack={user.audioTrack}
                  uid={user.uid}
                  isLocal={user.isLocal}
                  audioLevel={user.audioLevel}
                  hasAudio={user.hasAudio}
                  hasVideo={user.hasVideo}
                />
              </div>
            ))}
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
             <Controls 
               localAudioTrack={localAudioTrack} 
               localVideoTrack={localVideoTrack} 
               leave={leave} 
             />
          </div>
        </div>
      </main>

      {/* 4. Member List (Right Sidebar) */}
      <aside className="w-60 bg-discord-sidebar hidden lg:flex flex-col shrink-0 border-l border-black/10">
        <header className="h-12 flex items-center px-4 font-bold text-xs text-discord-text-muted uppercase tracking-wide">
           Members — {allUsers.length}
        </header>
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
           {allUsers.map(user => (
              <div key={user.uid} className="flex items-center gap-3 p-2 rounded hover:bg-[#35373C] cursor-pointer group">
                 <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.isLocal ? 'bg-discord-accent' : 'bg-discord-server'}`}>
                       {user.isLocal ? 'ME' : String(user.uid).slice(0,1)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-discord-sidebar rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <div className={`text-sm font-medium ${user.isLocal ? 'text-white' : 'text-discord-text-normal group-hover:text-white'}`}>
                       {user.isLocal ? 'You' : `User ${user.uid}`}
                    </div>
                    <div className="text-xs text-discord-text-muted">
                       {user.hasAudio ? 'Speaking' : 'Muted'}
                    </div>
                 </div>
              </div>
           ))}
           
           {/* Mock Offline Members */}
           <div className="mt-6 mb-2 font-bold text-xs text-discord-text-muted uppercase tracking-wide px-1">Offline — 3</div>
           {['Jane Doe', 'Moderator Bot', 'Admin'].map(name => (
              <div key={name} className="flex items-center gap-3 p-2 rounded hover:bg-[#35373C] cursor-pointer group opacity-50">
                 <div className="w-8 h-8 rounded-full bg-discord-server flex items-center justify-center text-white text-xs font-bold">
                    {name[0]}
                 </div>
                 <div className="text-sm font-medium text-discord-text-muted">
                    {name}
                 </div>
              </div>
           ))}
        </div>
      </aside>

    </div>
  );
};

export default App;