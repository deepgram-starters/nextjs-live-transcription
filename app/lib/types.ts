import { JSONValue } from "ai";

export interface Metadata {
  createdAt?: Date;
  content: string;
  role: "tts" | "llm" | "stt";
  name?: string;
  data?: JSONValue;
}
