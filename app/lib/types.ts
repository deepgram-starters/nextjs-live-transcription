import { Message } from "ai";

export interface MessageMetadata extends Partial<Message> {
  start?: number;
  response?: number;
  end?: number;
  ttsModel?: string;
}

export interface AudioPacket {
  id: string;
  blob: Blob;
  latency: number;
  networkLatency: number;
  played: boolean;
  model: string;
}
