import type { Id } from "@/convex/_generated/dataModel";

export type SearchResult = {
  id: Id<"finalizedSentences">;
  meetingID: Id<"meetings">;
  score: number;
  searchInput?: string;
};
