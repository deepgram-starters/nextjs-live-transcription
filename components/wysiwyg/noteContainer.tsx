"use client";
import NotePad from "@/components/wysiwyg/notePad";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Sparkles, ListEnd, ListRestart } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";

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
  finalizedSentences?: SentenceData[]; // This property is optional
  speakers?: SpeakerData[]; // This property is optional
};

type MeetingSummary = {
  id: string; // or number, depending on how you want to identify summaries
  message: string;
  tokens: number;
  model: string;
  promptCost: number;
  completionCost: number;
  totalCost: number;
};

type SpeakerData = {
  id: number;
  firstName: string;
  lastName: string;
};

export default function NoteContainer({
  finalizedSentences,
  speakers, // selectedModel,
}: {
  finalizedSentences: SentenceData[];
  speakers: SpeakerData[];

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

  const handleSubmitSummary = async () => {
    // Prepare the body content with the finalized sentences
    const bodyContent: BodyContent = {
      message: [], // Assuming no other messages are needed for the summary
      selectedModel: selectedModel,
      finalizedSentences: finalizedSentences,
      speakers: speakers,
    };

    try {
      // Send the request to the new summary route
      const response = await fetch("/api/meeting-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const summaryData: MeetingSummary = await response.json();
      // Add a unique identifier to the summaryData, e.g., a timestamp or UUID
      summaryData.id = new Date().toISOString();

      setMeetingSummaries((prevSummaries) => {
        // If replace mode is active, replace the summaries, otherwise append
        return isReplaceMode ? [summaryData] : [...prevSummaries, summaryData];
      });
    } catch (error) {
      console.error("Failed to send summary request: ", error);
      // Handle any errors here
    }
  };

  return (
    <div className="flex flex-col space-y-3 mt-3">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex flex-row space-x-2 items-center">
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
            @{`GPT-${selectedModel}`} {/* Display the selected model */}
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmitSummary}
            className="h-9"
          >
            Generate Summary
            <Sparkles
              className="relative bottom-1 inline-block ml-1 h-7"
              size={16}
            />
          </Button>
          <TooltipProvider>
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
          </TooltipProvider>
        </div>
      </div>
      <NotePad
        finalizedSentences={finalizedSentences}
        meetingSummaries={meetingSummaries}
      />
    </div>
  );
}
