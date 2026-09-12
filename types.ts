
export enum AppTab {
  CHAT = 'chat',
  IMAGES = 'images',
  VIDEOS = 'videos',
  LIVE = 'live',
  VISION_NODE = 'vision_node',
  ASSETS = 'assets',
  OVERLORD = 'overlord',
  NEXUS = 'nexus',
  SENTINEL = 'sentinel'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: Array<{ uri: string; title: string }>;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  timestamp: number;
}

export interface TranscriptionItem {
  role: 'user' | 'model';
  text: string;
}

export interface BinaryFrameData {
  sequence: number;
  variableX: number;
  variableY: number;
  variableZ: number;
  rawHex?: string;
  packetSizeBytes: number;
  timestamp: string;
}

export interface MatrixSetterState {
  sequence: number;
  x: number;
  y: number;
  z: number;
  streamRateHz: number;
  activePreset?: string;
  autoIncrement: boolean;
}
