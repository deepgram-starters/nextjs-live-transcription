"use client";

//import react stuff
import { useState, Suspense, useEffect } from "react"; // Import useEffect

import { format } from "date-fns";

//import nextjs stuff
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

//import convex stuff
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

//import shadcnui stuff
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//import icon stuff
import { PenLine, CalendarIcon, SparklesIcon } from "lucide-react";

// import custom stuff
import Microphone from "@/components/microphone";
import TranscriptDisplay from "@/components/microphone/transcript";
import Chat from "@/components/chat/chat";
import NoteContainer from "@/components/wysiwyg/noteContainer";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";

//import custom stuff
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const NoteContainerNoSSR = dynamic(
  () => import("@/components/wysiwyg/noteContainer"),
  {
    ssr: false,
  }
);

type Meeting = {
  title: string;
  userId: string;
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

export default function Page({
  params,
}: {
  params: { meetingID: Id<"meetings"> };
}) {
  const meetingDetails = useQuery(api.meetings.getMeetingByID, {
    meetingID: params.meetingID!,
  }) as Meeting[] | undefined;

  // Lifted state
  const [finalizedSentences, setFinalizedSentences] = useState<
    FinalizedSentence[]
  >([]);
  const [speakerDetails, setSpeakerDetails] = useState<SpeakerDetail[]>([]);
  // Inside the component
  const [caption, setCaption] = useState<string | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // State for managing the selected tab for smaller screens to just 1 component
  const [selectedTab, setSelectedTab] = useState<string>("Transcript");
  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  // New state for managing selected content on larger screens
  const [selectedContentLargeScreen, setSelectedContentLargeScreen] =
    useState<string>("Transcript");

  const updateMeetingTitle = useMutation(api.meetings.updateMeetingTitle);
  const handleTitleChange = async (newTitle: string) => {
    try {
      await updateMeetingTitle({ meetingID: params.meetingID, newTitle });
      // Optionally, refresh the meeting details or show a success message
    } catch (error) {
      console.error("Failed to update meeting title:", error);
      // Optionally, show an error message
    }
  };

  // State to track the selected OpenAI model
  const [selectedModel, setSelectedModel] = useState("3.5");

  // Handler to toggle the OpenAI model
  const toggleModel = () => {
    setSelectedModel(selectedModel === "3.5" ? "4.0" : "3.5");
  };

  const retrieveSummary = useAction(api.meetingSummary.retrieveMeetingSummary);
  const summaries = useQuery(api.meetingSummary.getMeetingSummaryForUser, {
    meetingID: params.meetingID,
  });

  // Use useEffect to log when summaries are fetched
  useEffect(() => {
    if (summaries) {
      // console.log("Meeting Summaries (client):", summaries);
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
        meetingID: params.meetingID,
        aiModel: selectedModel,
        finalizedSentences: cleanedFinalizedSentences,
        speakerDetails: cleanedSpeakerDetails,
      });
      // Handle the summary here, e.g., display it in the UI or store it in state
    } catch (error) {
      console.error("Failed to generate meeting summary:", error);
      // Optionally, show an error message
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] mx-5">
      <Breadcrumbs className="mt-2">
        <BreadcrumbItem href="/mymeetings">My Meetings</BreadcrumbItem>
        <BreadcrumbItem>{meetingDetails?.[0]?.title}</BreadcrumbItem>
      </Breadcrumbs>
      <div className="group flex flex-row items-center mt-2">
        <Input
          type="text"
          placeholder="Untitled Meeting"
          value={meetingDetails?.[0]?.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-3xl font-bold leading-none border-none focus:ring-0"
        />
        <div className="ml-4" />
        <Microphone
          meetingID={params.meetingID}
          finalizedSentences={finalizedSentences}
          setFinalizedSentences={setFinalizedSentences}
          speakerDetails={speakerDetails}
          setSpeakerDetails={setSpeakerDetails}
          setCaption={setCaption}
        />
      </div>
      <div className="flex justify-between items-center text-sm md:mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Tabs
          defaultValue="Transcript"
          className="mt-2 md:hidden"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="Transcript">Transcript</TabsTrigger>
            <TabsTrigger value="Notes">Notes</TabsTrigger>
            <TabsTrigger value="Chat">Chat</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Separator orientation="horizontal" className="mt-2 " />
      <div className=" flex-grow flex flex-row mt-3 h-[calc(100vh-255px)]">
        {/* Conditional rendering based on the selectedTab */}
        <div className="relative flex flex-col flex-grow">
          <Tabs
            defaultValue="Transcript"
            className="hidden md:block"
            // onValueChange=
          >
            <TabsList id="tabs-list-large-screen" className="absolute right-0">
              <TabsTrigger value="Transcript">Transcript</TabsTrigger>
              <TabsTrigger value="Notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="Transcript" className="mt-12">
              <TranscriptDisplay
                speakerDetails={speakerDetails}
                setSpeakerDetails={setSpeakerDetails} // Pass this prop to update the state
                finalizedSentences={finalizedSentences}
                caption={caption}
              />
            </TabsContent>
            <TabsContent value="Notes" className="flex flex-col">
              <Suspense fallback={<div>Loading...</div>}>
                <NoteContainerNoSSR
                  meetingID={params.meetingID}
                  finalizedSentences={finalizedSentences}
                  speakerDetails={speakerDetails}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
          <div
            className={` ${
              selectedTab === "Transcript" ? "md:hidden" : "hidden"
            }`}
          >
            <TranscriptDisplay
              speakerDetails={speakerDetails}
              setSpeakerDetails={setSpeakerDetails} // Pass this prop to update the state
              finalizedSentences={finalizedSentences}
              caption={caption}
            />
          </div>
          <div
            className={` ${selectedTab === "Notes" ? "md:hidden" : "hidden"}`}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <NoteContainerNoSSR
                meetingID={params.meetingID}
                finalizedSentences={finalizedSentences}
                speakerDetails={speakerDetails}
              />
            </Suspense>
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="mx-4 h-full hidden md:block"
        ></Separator>
        <div
          className={`md:w-1/2 md:max-w-[448px] min-w-[448px] ${
            selectedTab === "Chat" ? "" : "hidden md:block"
          }`}
        >
          <Chat
            meetingID={params.meetingID}
            finalizedSentences={finalizedSentences}
            speakerDetails={speakerDetails}
          />
        </div>
      </div>
    </div>
  );
}
