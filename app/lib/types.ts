import { Message } from "ai";

export interface MessageMetadata extends Partial<Message> {
  start?: number;
  response?: number;
  end?: number;
  ttsModel?: string;
}
