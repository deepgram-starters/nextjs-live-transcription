import { Message } from "ai";

export interface MessageMetadata extends Partial<Message> {
  start: number;
  response: number;
  end: number;
}

export interface AudioPacket {
  id: string;
  blob: Blob;
  latency: number;
  played: boolean;
}
