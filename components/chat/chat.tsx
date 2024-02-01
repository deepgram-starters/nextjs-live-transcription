"use client";

//import react stuff
import { useState, useEffect } from "react";

//import nextjs stuff
import Link from "next/link";
import Image from "next/image";

//import clerk stuff
import { useUser } from "@clerk/nextjs";

//import convex stuff
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

//import icon stuff
import { User, Bot, CornerRightUp, Coins, Paperclip } from "lucide-react";

//import shadcnui stuff
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

//import custom stuff
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FinalizedSentence {
  speaker: number;
  transcript: string;
  start: number;
  end: number;
  meetingID: Id<"meetings">;
}

export interface SpeakerDetail {
  speakerNumber: number;
  firstName: string;
  lastName: string;
  meetingID: Id<"meetings">;
}

export default function ChatCompletion({
  meetingID,
  finalizedSentences,
  speakerDetails,
}: {
  meetingID: Id<"meetings">;
  finalizedSentences: FinalizedSentence[];
  speakerDetails: SpeakerDetail[];
}) {
  const { user } = useUser();
  // Assuming the profile image URL is stored in `user.profileImageUrl`
  const profileImageUrl = user?.imageUrl;

  const messages = useQuery(api.chat.getMessagesForUser, {
    meetingID: meetingID!,
  });

  // Define chatHistory state and its setter function here
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Maintain chat history in state
  useEffect(() => {
    if (messages) {
      const history: ChatMessage[] = messages.flatMap((message) => {
        const entries: ChatMessage[] = [];
        if (message.userMessage) {
          entries.push({
            role: "user",
            content: message.userMessage,
          });
        }
        if (message.aiResponse) {
          entries.push({
            role: "assistant",
            content: message.aiResponse,
          });
        }
        return entries;
      });
      setChatHistory(history);
    }
  }, [messages]);

  const sendMessage = useAction(api.chat.sendMessage);

  // State to track the selected OpenAI model
  const [selectedModel, setSelectedModel] = useState("3.5");

  // Handler to toggle the OpenAI model
  const toggleModel = () => {
    setSelectedModel(selectedModel === "3.5" ? "4.0" : "3.5");
  };

  const [includeTranscript, setIncludeTranscript] = useState(true);
  const toggleTranscriptInclusion = () => {
    setIncludeTranscript((currentValue) => !currentValue);
  };

  return (
    // <div className="flex flex-col h-full w-[448px]">
    <div className="flex h-full">
      <ScrollArea className="h-[calc(100vh-305px)]">
        <div className="">
          {messages?.map((message) => {
            return (
              <div key={message._id} className="flex flex-col">
                <div className="flex flex-row my-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={profileImageUrl} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg border mx-4 p-4 outline-gray-500">
                    {message.userMessage}
                  </div>
                </div>
                <div className="flex flex-row my-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src="" />
                    <AvatarFallback
                      className={clsx({
                        "bg-emerald-600": message.aiModel === "gpt-3.5-turbo",
                        "bg-purple-500":
                          message.aiModel === "gpt-4-0125-preview",
                      })}
                    >
                      <Image
                        src="/openai-logomark.svg"
                        alt="Bot"
                        width={20}
                        height={20}
                        className="openai-logo"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg border mx-4 p-4 outline-gray-500">
                    {message.aiResponse}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 p-2 w-[calc(100%-40px)] md:w-[calc(50%-20px)] md:max-w-[448px] min-w-[448px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const message = formData.get("message") as string;
            if (message.trim() !== "") {
              // Trim unnecessary attributes from speakerDetails
              const trimmedSpeakerDetails = speakerDetails.map(
                ({ speakerNumber, firstName, lastName }) => ({
                  speakerNumber,
                  firstName,
                  lastName,
                })
              );
              // Include the updatedChatHistory in the sendMessage call
              await sendMessage({
                message,
                meetingID,
                aiModel: selectedModel,
                chatHistory,
                ...(includeTranscript && {
                  finalizedSentences,
                  speakerDetails: trimmedSpeakerDetails,
                }),
              });
            }
            form.reset();
          }}
        >
          <Button
            variant="default"
            onClick={toggleModel}
            type="button"
            className={twMerge(
              clsx(
                "absolute bottom-[16px] left-4 h-7 p-2 rounded-full text-xs transition-colors duration-500 ease-in-out",
                {
                  "bg-emerald-600 hover:bg-emerald-500 text-white":
                    selectedModel === "3.5",
                  "bg-purple-600 hover:bg-purple-500 text-white":
                    selectedModel === "4.0",
                }
              )
            )}
          >
            @{`GPT-${selectedModel}`}
          </Button>
          <Input
            name="message"
            style={{
              maxHeight: "200px",
              height: "44px",
              overflowY: "hidden",
            }}
            className="m-0 
                resize-none 
                pr-10 
                pl-24
                md:py-3.5 
                md:pr-12"
            placeholder="Ask a question..."
          />
          <Button
            variant="secondary"
            size="icon"
            type="submit"
            className="absolute 
            bottom-[14px]
                          w-8
                          h-8
                          right-[15px]"
          >
            <CornerRightUp size={16} />
          </Button>
          <div className="absolute bottom-[3.5rem] left-2 space-x-3 text-muted-foreground items-center flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={includeTranscript ? "default" : "secondary"}
                    className="rounded-full h-7 w-40 text-xs"
                    onClick={toggleTranscriptInclusion}
                  >
                    <Paperclip size={15} className="mr-1" />
                    {includeTranscript
                      ? "Transcript Included"
                      : "Transcript Excluded"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-[350px] m-2">
                    <div className="grid grid-cols-2 text-left">
                      {/* Column Headers */}
                      <div className="font-bold col-span-1 mb-2 mx-2">
                        Include Transcript
                      </div>
                      <div className="font-bold col-span-1 mb-2 mx-2">
                        Exclude Transcript
                      </div>
                      {/* Full-width Separator */}
                      <div className="col-span-2">
                        <hr className="w-full" /> {/* This is your separator */}
                      </div>
                      {/* Pro Row */}
                      <div className="col-span-1 my-4 mx-2">
                        Higher cost per question.
                      </div>
                      <div className="col-span-1 my-4 mx-2">
                        Less cost per question.
                      </div>
                      {/* Con Row */}
                      <div className="col-span-1 my-4 mx-2">
                        AI can answer specific questions about the meeting.
                      </div>
                      <div className="col-span-1 my-4 mx-2">
                        AI has less context, may affect relevance of answer.
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </div>
    </div>
  );
}
