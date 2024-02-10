type LLMRequestMetadata = {
  sent: boolean;
  sentTimestamp: Date | null;
  replied: boolean;
  replyTimestamp: Date | null;
};

export type { LLMRequestMetadata };
