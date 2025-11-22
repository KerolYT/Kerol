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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#313338] relative overflow-hidden">
      {/* Background Pattern (Subtle) */}
      <div className="absolute inset-0 bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png')] bg-no-repeat bg-center opacity-[0.02] pointer-events-none transform scale-150"></div>

      <div className={`relative w-full max-w-[480px] bg-[#313338] p-8 rounded-[5px] sm:shadow-2xl sm:bg-[#313338] sm:rounded-lg transition-all ${error ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-[#B5BAC1] text-base">We're so excited to see you again!</p>
          <h3 className="text-discord-accent font-black uppercase tracking-widest mt-4 text-xs opacity-80">Mierdicord</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-2">
              Channel Name <span className="text-discord-red">*</span>
            </label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:ring-0 focus:bg-[#1E1F22] outline-none h-[40px] font-medium transition-colors"
              required
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
              className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:ring-0 focus:bg-[#1E1F22] outline-none h-[40px] font-mono text-sm"
              required
            />
          </div>

          <div>
             {!showToken ? (
                <button 
                  type="button" 
                  onClick={() => setShowToken(true)}
                  className="text-xs text-[#00A8FC] hover:underline font-medium"
                >
                  Do you have a security token?
                </button>
             ) : (
               <div className="animate-fadeIn mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide">
                      Token
                    </label>
                    <button type="button" onClick={() => setShowToken(false)} className="text-[10px] text-[#B5BAC1] hover:text-white">Hide</button>
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#1E1F22] border-none rounded-[3px] p-2.5 text-white focus:ring-0 focus:bg-[#1E1F22] outline-none h-[40px] font-mono text-sm"
                  />
               </div>
             )}
          </div>

          {error && (
             <div className="text-xs text-discord-red mt-2 font-medium uppercase">
                {error}
             </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2.5 rounded-[3px] transition-colors mt-6 h-[44px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
          </button>

          <div className="text-xs text-[#949BA4] mt-4 flex gap-1">
             Need an account? <span className="text-[#00A8FC] hover:underline cursor-pointer">Register</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;