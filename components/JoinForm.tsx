import React, { useState, useEffect } from 'react';
import { ConnectionConfig } from '../types';

interface JoinFormProps {
  onJoin: (config: ConnectionConfig) => void;
  isLoading: boolean;
  error: string | null;
}

const JoinForm: React.FC<JoinFormProps> = ({ onJoin, isLoading, error }) => {
  const [appId, setAppId] = useState('f3af516da02a4b0f8683c9e82bc94f3f');
  const [channel, setChannel] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (error && (error.includes('Token') || error.includes('Secure Mode'))) {
      setShowToken(true);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim() || !channel.trim()) return;
    
    onJoin({ 
      appId: appId.trim(), 
      channel: channel.trim(), 
      token: token.trim() || null 
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-discord-base/90 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-[480px] bg-discord-sidebar rounded-lg shadow-2xl p-8 border border-[#202225]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-discord-accent rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg transform rotate-3">
             <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.15z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-discord-text-header">Welcome Back!</h2>
          <p className="text-discord-text-muted mt-2">We're so excited to see you again!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase tracking-wide mb-2">
              Channel Name <span className="text-discord-red">*</span>
            </label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#1e1f22] border-none rounded p-2.5 text-discord-text-normal focus:ring-2 focus:ring-discord-accent outline-none transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase tracking-wide mb-2">
              App ID
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full bg-[#1e1f22] border-none rounded p-2.5 text-discord-text-normal focus:ring-2 focus:ring-discord-accent outline-none transition-all font-mono text-sm"
              required
            />
          </div>

          {/* Advanced / Token */}
          <div>
             {!showToken ? (
                <button 
                  type="button" 
                  onClick={() => setShowToken(true)}
                  className="text-xs text-discord-accent hover:underline font-medium"
                >
                  I have a security token
                </button>
             ) : (
               <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-discord-text-muted uppercase tracking-wide">
                      Token
                    </label>
                    <button type="button" onClick={() => setShowToken(false)} className="text-[10px] text-discord-text-muted hover:text-white">Hide</button>
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#1e1f22] border-none rounded p-2.5 text-discord-text-normal focus:ring-2 focus:ring-discord-accent outline-none transition-all font-mono text-sm"
                  />
               </div>
             )}
          </div>

          {error && (
             <div className="text-xs text-discord-red mt-2 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {error}
             </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-discord-accent hover:bg-[#4752c4] text-white font-medium py-2.5 rounded transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Connecting...' : 'Join Channel'}
          </button>

          <div className="text-xs text-discord-text-muted mt-4">
             By entering, you agree to be cool.
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;