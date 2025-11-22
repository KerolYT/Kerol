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

    let createdAudioTrack: IMicrophoneAudioTrack | null = null;
    let createdVideoTrack: ICameraVideoTrack | null = null;

    try {
      // 1. Request permissions and create tracks.
      // Resilient logic: Try both -> Fallback to Audio Only -> Fail
      try {
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: "music_standard" }, // Correct Audio config
          { encoderConfig: "720p_1" }          // Video config
        );
        createdAudioTrack = tracks[0];
        createdVideoTrack = tracks[1];
      } catch (firstError: any) {
        console.warn("Failed to create mic/camera tracks simultaneously:", firstError);
        
        // Fallback: Try just audio (Voice call mode)
        try {
          createdAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" });
          // If we get here, mic works, but camera failed. That's okay.
        } catch (audioError: any) {
          // If even audio fails, we can't really call.
          throw new Error("Permission denied: Could not access Microphone. " + audioError.message);
        }
      }

      if (!createdAudioTrack && !createdVideoTrack) {
         throw new Error("Could not create any media tracks.");
      }

      // 2. Timeout Promise for Network Operations only: 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Connection timed out. Check network/firewall.")), 15000);
      });

      const joinProcess = async () => {
          rtcClient.on('user-published', handleUserPublished);
          rtcClient.on('user-unpublished', handleUserUnpublished);
          rtcClient.on('user-left', handleUserLeft);
          
          // Enable volume indicator: 200ms interval, smoothness 3
          rtcClient.enableAudioVolumeIndicator();
          rtcClient.on('volume-indicator', handleVolumeIndicator);

          // Handle potential empty string for token
          const token = config.token || null;
          await rtcClient.join(config.appId, config.channel, token, null);

          // Publish tracks we created
          const tracksToPublish = [];
          if (createdAudioTrack) tracksToPublish.push(createdAudioTrack);
          if (createdVideoTrack) tracksToPublish.push(createdVideoTrack);
          
          if (tracksToPublish.length > 0) {
             await rtcClient.publish(tracksToPublish);
          }
      };

      // Race the network join process against the timeout
      await Promise.race([joinProcess(), timeoutPromise]);

      // 3. Update State on Success
      setLocalAudioTrack(createdAudioTrack);
      setLocalVideoTrack(createdVideoTrack);
      setJoinState(true);

    } catch (err: any) {
      // If anything fails, cleanup tracks we might have created
      if (createdAudioTrack) {
        createdAudioTrack.stop();
        createdAudioTrack.close();
      }
      if (createdVideoTrack) {
        createdVideoTrack.stop();
        createdVideoTrack.close();
      }

      // Clean up client
      if (client.current) {
         client.current.removeAllListeners();
         await client.current.leave().catch(() => {});
         client.current = null;
      }

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
        message = "Mic/Camera permission denied. Check browser settings.";
      } else if (message.includes("timed out")) {
         message = "Connection timed out. Retry?";
      }
      
      setError(message);
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