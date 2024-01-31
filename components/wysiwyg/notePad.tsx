"use client"; // this registers <Editor> as a Client Component

//import react stuff
import { useState, useEffect } from "react";

//import next stuff
import { useTheme } from "next-themes";

//import convex stuff
import type { Id } from "@/convex/_generated/dataModel";

//import BlockNote stuff
import { BlockNoteEditor, Block } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";

import "@blocknote/core/style.css";

type SentenceData = {
  sentence: string;
  speaker: number | null;
  is_final?: boolean;
  speech_final?: boolean;
  start_Time?: number;
  formattedStartTime?: string;
  end_Time?: number;
  formattedEndTime?: string;
  tokenCount?: number;
};

type MeetingSummary = {
  _id: string; // or number, depending on how you want to identify summaries
  aiSummary: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
};

interface FinalizedSentence {
  speaker: number;
  transcript: string;
  start: number;
  end: number;
  meetingID: Id<"meetings">;
}

interface SpeakerDetail {
  speakerNumber: number;
  firstName: string;
  lastName: string;
  meetingID: Id<"meetings">;
}

type NotePadProps = {
  finalizedSentences: FinalizedSentence[];
  meetingSummaries: MeetingSummary[];
};

export default function Page({
  finalizedSentences,
  meetingSummaries,
}: {
  finalizedSentences: FinalizedSentence[];
  meetingSummaries: MeetingSummary[];
}) {
  const { resolvedTheme } = useTheme();

  const [blocks, setBlocks] = useState<Block<any, any, any>[] | null>(null);
  const [markdown, setMarkdown] = useState<string>("");

  // Creates a new editor instance.
  const editor: BlockNoteEditor = useBlockNote({
    editable: true,
    // Listens for when the editor's contents change.
    onEditorContentChange: (editor) =>
      // Converts the editor's contents to an array of Block objects.
      setBlocks(editor.topLevelBlocks as Block<any, any, any>[]),
  });

  useEffect(() => {
    // Convert meeting summaries to Markdown and update the state
    const summariesMarkdown = meetingSummaries
      .map((summary) => summary.aiSummary)
      .join("\n\n");
    setMarkdown(summariesMarkdown);
  }, [meetingSummaries]);

  useEffect(() => {
    if (editor && markdown) {
      // Convert Markdown to blocks and update the editor's content
      const updateEditorContent = async () => {
        const newBlocks: Block<any, any, any>[] =
          await editor.tryParseMarkdownToBlocks(markdown);
        //@ts-ignore
        editor.replaceBlocks(editor.topLevelBlocks, newBlocks);
      };
      updateEditorContent();
    }
  }, [editor, markdown]);

  useEffect(() => {
    // Transform SentenceData to ParagraphBlock
    //@ts-ignore
    const partialBlocks: PartialBlock[] = meetingSummaries.map(
      //@ts-ignore
      (meetingSummary): PartialBlock => ({
        id: meetingSummary._id, // Generate an ID if not available
        type: "paragraph",
        props: {
          backgroundColor: "default", // Set your default styles here
          textColor: "default",
          textAlignment: "left",
        },
        content: [
          {
            type: "text",
            text: meetingSummary.aiSummary,
            styles: {}, // Add any styles if necessary
          },
        ],
        // Note: No need to include 'children' if it's always an empty array
      })
    );

    // Clear existing blocks
    editor.removeBlocks(editor.topLevelBlocks);

    // Insert new blocks
    editor.insertBlocks(
      partialBlocks,
      editor.topLevelBlocks[0] || "root", // Reference block for insertion
      "after" // Placement relative to the reference block
    );
  }, [meetingSummaries, editor]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
