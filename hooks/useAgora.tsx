import { useState, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID,
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { IAgoraUser, ConnectionConfig } from '../types';

export const useAgora = () => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraUser[]>([]);
  const [joinState, setJoinState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localAudioLevel, setLocalAudioLevel] = useState<number>(0);

  const client = useRef<IAgoraRTCClient | null>(null);

  const initializeClient = () => {
    if (!client.current) {
      client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return client.current;
  };

  const leave = useCallback(async () => {
    // 1. Close local tracks immediately
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setJoinState(false);
    setLocalAudioLevel(0);

    // 2. Leave channel
    if (client.current) {
      client.current.removeAllListeners();
      await client.current.leave();
      client.current = null;
    }
  }, [localAudioTrack, localVideoTrack]);

  const join = useCallback(async (config: ConnectionConfig) => {
    const rtcClient = initializeClient();
    
    // Safety: Ensure clean state before joining
    rtcClient.removeAllListeners();
    
    setLoading(true);
    setError(null);

    // Timeout Promise: 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timed out. Please check your network or permissions.")), 10000);
    });

    const joinProcess = async () => {
        try {
            rtcClient.on('user-published', handleUserPublished);
            rtcClient.on('user-unpublished', handleUserUnpublished);
            rtcClient.on('user-left', handleUserLeft);
            
            // Enable volume indicator: 200ms interval, smoothness 3
            rtcClient.enableAudioVolumeIndicator();
            rtcClient.on('volume-indicator', handleVolumeIndicator);

            await rtcClient.join(config.appId, config.channel, config.token, null);

            // Create tracks *after* joining successfully
            // Note: This prompts the user for permissions.
            const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setLocalAudioTrack(microphoneTrack);
            setLocalVideoTrack(cameraTrack);
            
            await rtcClient.publish([microphoneTrack, cameraTrack]);
            setJoinState(true);
            
        } catch (err: any) {
             // If anything fails in the process, we must cleanup
             if (client.current) {
                 await client.current.leave().catch(() => {});
             }
             throw err;
        }
    };

    try {
      // Race the join process against the timeout
      await Promise.race([joinProcess(), timeoutPromise]);

    } catch (err: any) {
      console.error("Failed to join:", err);
      let message = err.message || "Failed to join channel";
      
      // Specific Error Handling for User Clarity
      if (message.includes("dynamic use static key")) {
        message = "Security Mode Enabled: Token required.";
      } else if (message.includes("invalid vendor key")) {
        message = "Invalid App ID.";
      } else if (message.includes("CAN_NOT_GET_GATEWAY_SERVER")) {
         message = "Network Error: Firewall or connection issue.";
      } else if (message.includes("Permission denied")) {
        message = "Mic/Camera permission denied.";
      } else if (message.includes("timed out")) {
         message = "Connection timed out. Retry?";
      }
      
      setError(message);
      // Clean up client on error
      if (client.current) {
         client.current.removeAllListeners();
         client.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [leave]); 

  const handleVolumeIndicator = (volumes: { level: number; uid: UID }[]) => {
    volumes.forEach((volume) => {
      if (volume.uid === 0 || (client.current && volume.uid === client.current.uid)) {
        setLocalAudioLevel(volume.level);
      } else {
        setRemoteUsers(prev => prev.map(u => 
          u.uid === volume.uid ? { ...u, audioLevel: volume.level } : u
        ));
      }
    });
  };

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (!client.current) return;
    await client.current.subscribe(user, mediaType);

    setRemoteUsers(prev => {
      const existingUserIndex = prev.findIndex(u => u.uid === user.uid);
      
      // Create a base user object
      const updatedUser: IAgoraUser = {
        uid: user.uid,
        hasAudio: user.hasAudio,
        hasVideo: user.hasVideo,
        audioTrack: user.audioTrack,
        videoTrack: user.videoTrack as ICameraVideoTrack,
        audioLevel: 0
      };

      if (existingUserIndex !== -1) {
        const newUsers = [...prev];
        const prevUser = newUsers[existingUserIndex];
        
        newUsers[existingUserIndex] = { 
          ...prevUser,
          // Only update tracks if the published media type corresponds
          videoTrack: mediaType === 'video' ? user.videoTrack as ICameraVideoTrack : prevUser.videoTrack,
          audioTrack: mediaType === 'audio' ? user.audioTrack : prevUser.audioTrack,
          hasAudio: mediaType === 'audio' ? true : prevUser.hasAudio,
          hasVideo: mediaType === 'video' ? true : prevUser.hasVideo
        };
        return newUsers;
      } else {
        return [...prev, updatedUser];
      }
    });

    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    setRemoteUsers(prev => prev.map(u => {
      if (u.uid === user.uid) {
        return {
          ...u,
          hasVideo: mediaType === 'video' ? false : u.hasVideo,
          hasAudio: mediaType === 'audio' ? false : u.hasAudio,
        };
      }
      return u;
    }));
  };
  
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  return {
    join,
    leave,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    joinState,
    loading,
    error,
    localAudioLevel
  };
};