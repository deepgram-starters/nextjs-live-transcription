type LLMRequestMetadata = {
  sent: boolean;
  sentTimestamp: Date | null;
  replied: boolean;
  replyTimestamp: Date | null;
};

type LLMMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  name?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
  tool_call_id?: string;
};

export type { LLMRequestMetadata, LLMMessage };
