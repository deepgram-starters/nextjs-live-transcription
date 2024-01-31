"use client";

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

//import icon stuff
import { Sparkles, ListEnd, ListRestart } from "lucide-react";

//import custom stuff
import NotePad from "@/components/wysiwyg/notePad";

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

export default function NoteContainer({
  meetingID,
  finalizedSentences,
  speakerDetails, // selectedModel,
}: {
  meetingID: Id<"meetings">;
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

  // const handleSubmitSummary = async () => {
  //   // Prepare the body content with the finalized sentences
  //   const bodyContent: BodyContent = {
  //     message: [], // Assuming no other messages are needed for the summary
  //     selectedModel: selectedModel,
  //     finalizedSentences: finalizedSentences,
  //     speakerDetails: speakersDetails,
  //   };

  //   try {
  //     // Send the request to the new summary route
  //     const response = await fetch("/api/meeting-summary", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(bodyContent),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status}`);
  //     }

  //     const summaryData: MeetingSummary = await response.json();
  //     // Add a unique identifier to the summaryData, e.g., a timestamp or UUID
  //     summaryData.id = new Date().toISOString();

  //     setMeetingSummaries((prevSummaries) => {
  //       // If replace mode is active, replace the summaries, otherwise append
  //       return isReplaceMode ? [summaryData] : [...prevSummaries, summaryData];
  //     });
  //   } catch (error) {
  //     console.error("Failed to send summary request: ", error);
  //     // Handle any errors here
  //   }
  // };

  const retrieveSummary = useAction(api.meetingSummary.retrieveMeetingSummary);
  const summaries = useQuery(api.meetingSummary.getMeetingSummaryForUser, {
    meetingID: meetingID!,
  });

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

      // Call the action with the necessary arguments, including the cleaned data
      const summary = await retrieveSummary({
        message: "Please generate a summary for this meeting.",
        meetingID: meetingID,
        aiModel: selectedModel,
        finalizedSentences: cleanedFinalizedSentences,
        speakerDetails: cleanedSpeakerDetails,
      });

      console.log("Summary:", summary);
    } catch (error) {
      console.error("Failed to generate meeting summary:", error);
      // Optionally, show an error message
    }
  };

  return (
    <div className="flex flex-col space-y-3 ">
      <div className="flex flex-row items-center">
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
            onClick={handleGenerateSummary}
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
        meetingSummaries={
          meetingSummaries.length > 0
            ? [meetingSummaries[meetingSummaries.length - 1]]
            : []
        }
      />
    </div>
  );
}
