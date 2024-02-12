"use client";

import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/themes/prism-okaidia.css"; // Import PrismJS theme globally

//import react stuff
import { useState, useEffect } from "react";

//import tailwind stuff
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

//import convex stuff
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

//import shadcnui stuff
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

//import icon stuff
import {
  Sparkles,
  ListEnd,
  ListRestart,
  CheckCircle,
  Clipboard,
  Mail,
} from "lucide-react";

//import custom stuff
import NotePad from "@/components/wysiwyg/notePad";
// import "@blocknote/react/style.css";

type ChatMessageData = {
  //   id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  model?: string;
  promptCost?: number;
  completionCost?: number;
  totalCost?: number;
};

type BodyContent = {
  message?: ChatMessageData[];
  selectedModel: string;
  finalizedSentences?: FinalizedSentence[]; // This property is optional
  speakers?: SpeakerDetail[]; // This property is optional
};

type MeetingSummary = {
  _id: string; // or number, depending on how you want to identify summaries
  aiSummary: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
};

type SpeakerData = {
  id: number;
  firstName: string;
  lastName: string;
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

type MeetingDetails = {
  title: string;
  date: string; // Assuming ISO format for simplicity
  duration: string;
  participants: string[];
};

export default function NoteContainer({
  meetingID,
  finalizedSentences,
  speakerDetails, // selectedModel,
  language,
}: {
  meetingID: Id<"meetings">;
  language: string;
  finalizedSentences: FinalizedSentence[];
  speakerDetails: SpeakerDetail[];

  // selectedModel: string;
}) {
  //   const [finalizedSentences, setFinalizedSentences] = useState<SentenceData[]>(
  //     initialFinalizedSentences
  //   );

  const [meetingSummaries, setMeetingSummaries] = useState<MeetingSummary[]>(
    []
  );

  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const handleToggleMode = () => {
    setIsReplaceMode(!isReplaceMode);
  };

  const [selectedModel, setSelectedModel] = useState("3.5");
  const toggleModel = () => {
    setSelectedModel(selectedModel === "3.5" ? "4.0" : "3.5");
  };

  // ALERT: Disabling this button since convex is saying we are at over a GB compared to other functions makes no sense
  const retrieveSummary = useAction(api.meetingSummary.retrieveMeetingSummary);
  const summaries = useQuery(api.meetingSummary.getMeetingSummaryForUser, {
    meetingID: meetingID!,
  });

  // ALERT: Dissabling since convex says we are running way over limits
  // Use useEffect to log when summaries are fetched
  useEffect(() => {
    if (summaries) {
      // we need to setSummaries to the last index in the array
      setMeetingSummaries(summaries);
    }
  }, [summaries]);

  const handleGenerateSummary = async () => {
    try {
      // Clean finalizedSentences as before
      const cleanedFinalizedSentences = finalizedSentences.map(
        ({ speaker, transcript, start, end, meetingID }) => ({
          speaker,
          transcript,
          start,
          end,
          meetingID,
        })
      );

      // Now also clean speakerDetails to remove any fields not expected by the validator
      const cleanedSpeakerDetails = speakerDetails.map(
        ({ firstName, lastName, speakerNumber }) => ({
          firstName,
          lastName,
          speakerNumber,
        })
      );

      // ALERT: Disabling this button since convex is saying we are at over a GB compared to other functions makes no sense
      // Call the action with the necessary arguments, including the cleaned data
      const summary = await retrieveSummary({
        message: "Please generate a summary for this meeting." + language,
        meetingID: meetingID,
        aiModel: selectedModel,
        finalizedSentences: cleanedFinalizedSentences,
        speakerDetails: cleanedSpeakerDetails,
      });

      // console.log("Summary:", summary);
    } catch (error) {
      console.error("Failed to generate meeting summary:", error);
      // Optionally, show an error message
    }
  };

  useEffect(() => {
    // Call Prism to highlight all code blocks
    Prism.highlightAll();
  }, [meetingSummaries]);

  const highlightCode = (code: string, language: string): string => {
    if (Prism.languages[language]) {
      return Prism.highlight(code, Prism.languages[language], language);
    }
    return code;
  };

  // State to track copy success
  const [hasCopied, setHasCopied] = useState(false);

  // Modified highlightCode function or wherever you're handling the copy action
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log("Code copied to clipboard");
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 5000); // Reset after 5 seconds
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Add this function to handle copying the meeting summary to the clipboard
  const copySummaryToClipboard = async () => {
    const summaryText = meetingSummaries
      .map((summary) => summary.aiSummary)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(summaryText);
      console.log("Summary copied to clipboard");
      // Optionally, update state or show a notification to the user indicating success
    } catch (err) {
      console.error("Failed to copy summary: ", err);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="flex flex-col space-y-3 ">
      <div className="flex flex-row items-center">
        <div className="flex flex-row space-x-2 items-center">
          {/* ALERT: Disabling this button since convex is saying we are at over a GB compared to other functions makes no sense */}
          <Button
            variant="default"
            onClick={toggleModel}
            className={twMerge(
              clsx(
                "h-7 p-2 rounded-full text-xs transition-colors duration-500 ease-in-out",
                {
                  "bg-emerald-600 hover:bg-emerald-500 text-white":
                    selectedModel === "3.5",
                  "bg-purple-600 hover:bg-purple-500 text-white":
                    selectedModel === "4.0",
                }
              )
            )} // Apply conditional classes inline
          >
            @{`GPT-${selectedModel}`}
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateSummary}
            className="h-9"
          >
            Regenerate Summary
            <Sparkles
              className="relative bottom-1 inline-block ml-1 h-7"
              size={16}
            />
          </Button>
          {/* 2/10 Disable Append or Replace summary as its not needed */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {" "}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9"
                  onClick={handleToggleMode}
                >
                  {isReplaceMode ? (
                    <ListRestart className="h-6" />
                  ) : (
                    <ListEnd className="h-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="">Replace or Append Response</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>
      <Button
        variant="ghost"
        className="absolute right-0 top-10 space-x-2 z-50"
        onClick={copySummaryToClipboard}
      >
        <span>Copy</span> <Clipboard />
      </Button>
      <ScrollArea className="h-[calc(100vh-260px)] md:h-[calc(100vh-305px)]">
        {/* //insert div with meeting summary */}
        <div className="">
          {meetingSummaries.length > 0 ? (
            meetingSummaries.map((summary, index) => (
              <div key={index} className="p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Meeting Summary</h3>
                <ReactMarkdown
                  remarkPlugins={[gfm as any]}
                  rehypePlugins={[raw as any]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold my-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-semibold my-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold my-1" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="text-md font-medium my-1" {...props} />
                    ),
                    h5: ({ node, ...props }) => (
                      <h5 className="text-sm font-medium my-1" {...props} />
                    ),
                    h6: ({ node, ...props }) => (
                      <h6 className="text-xs font-medium my-1" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="my-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="pl-5 border-l-2 border-muted-foreground my-3"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 my-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 my-2" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-500 hover:text-blue-700 underline"
                        {...props}
                      />
                    ),
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      if (!inline && match) {
                        const language = match[1];
                        const code = children.toString();
                        const html = highlightCode(code, language); // Ensure you have a function to handle code highlighting
                        return (
                          <div className="flex flex-col my-2 px-2 bg-secondary hover:bg-secondary/80 rounded-lg">
                            <div className="flex flex-row items-center justify-between border-b text-muted-foreground">
                              <span className="text-xs">
                                {language.toUpperCase()}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => handleCopy(code)}
                              >
                                {hasCopied ? (
                                  <CheckCircle size={16} />
                                ) : (
                                  <Clipboard size={16} />
                                )}
                              </Button>
                            </div>
                            <ScrollArea className="">
                              <pre style={{ overflowX: "auto" }}>
                                <code
                                  className={`language-${language}`}
                                  dangerouslySetInnerHTML={{ __html: html }}
                                  {...props}
                                />
                              </pre>
                            </ScrollArea>
                          </div>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {summary.aiSummary}
                </ReactMarkdown>
              </div>
            ))
          ) : (
            <p>No summaries available.</p>
          )}
        </div>
        {/* Dissabling BlockNote and just going to display markdown */}
        {/* <NotePad
          finalizedSentences={finalizedSentences}
          meetingSummaries={
            meetingSummaries.length > 0
              ? [meetingSummaries[meetingSummaries.length - 1]]
              : []
          }
        /> */}
      </ScrollArea>
    </div>
  );
}
