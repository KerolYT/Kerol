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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#313338]">
      {/* Animated Background with Fallback Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e1f22] to-[#2b2d31]">
         <img 
            src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=2000&auto=format&fit=crop" 
            alt="background" 
            className="w-full h-full object-cover opacity-30 blur-sm animate-pulse mix-blend-overlay transition-opacity duration-1000"
            style={{ animationDuration: '10s' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
         />
         <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 to-[#313338]/90 pointer-events-none"></div>
      </div>
      
      {/* Decorative shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#5865F2] opacity-10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#da373c] opacity-10 blur-[120px]"></div>

      <div className={`relative z-10 w-full max-w-[480px] bg-[#313338] p-8 rounded-[5px] sm:shadow-2xl sm:rounded-lg transition-all duration-300 shadow-xl border border-black/10 ${error ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-[#B5BAC1] text-base">We're so excited to see you again!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-2">
              Channel Name <span className="text-discord-red">*</span>
            </label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00A8FC] h-[40px] font-medium transition-all duration-200 ease-in-out placeholder-[#949BA4]"
              required
              autoFocus
              placeholder="Enter room name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-2">
              App ID
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00A8FC] h-[40px] font-mono text-sm text-opacity-80 transition-all duration-200 ease-in-out"
              required
            />
          </div>

          <div>
             {!showToken ? (
                <button 
                  type="button" 
                  onClick={() => setShowToken(true)}
                  className="text-xs text-[#00A8FC] hover:underline font-medium transition-colors"
                >
                  Do you have a security token?
                </button>
             ) : (
               <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide">
                      Token
                    </label>
                    <button type="button" onClick={() => setShowToken(false)} className="text-[10px] text-[#B5BAC1] hover:text-white transition-colors">Hide</button>
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Optional token..."
                    className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00A8FC] h-[40px] font-mono text-sm transition-all duration-200 ease-in-out"
                  />
               </div>
             )}
          </div>

          {error && (
             <div className="bg-discord-red/10 border border-discord-red/20 p-2.5 rounded flex items-start gap-2 animate-fadeIn mt-2">
                <svg className="w-4 h-4 text-discord-red shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <span className="text-xs text-discord-text-normal font-medium leading-relaxed">{error}</span>
             </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2.5 rounded-[3px] transition-all duration-200 mt-4 h-[44px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:transform active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Connecting...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;