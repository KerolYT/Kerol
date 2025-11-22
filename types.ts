import { ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack, UID } from "agora-rtc-sdk-ng";

export interface IAgoraUser {
  uid: UID;
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack;
  audioTrack?: IMicrophoneAudioTrack | IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
  audioLevel?: number; // 0 to 100
}

export interface ConnectionConfig {
  appId: string;
  channel: string;
  token: string | null;
}

export type CallState = 'idle' | 'connecting' | 'connected' | 'error';