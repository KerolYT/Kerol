import { ICameraVideoTrack, IMicrophoneAudioTrack, UID } from "agora-rtc-sdk-ng";

export interface IAgoraUser {
  uid: UID;
  videoTrack?: ICameraVideoTrack;
  audioTrack?: IMicrophoneAudioTrack;
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