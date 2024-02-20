"use client";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/themes/prism-okaidia.css"; // Import PrismJS theme globally

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

//import shadcnui stuff
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

//import icon stuff
import {
  User,
  Bot,
  CornerRightUp,
  Coins,
  Paperclip,
  Copy,
  Clipboard,
  CheckCircle,
} from "lucide-react";

//import spinner stuff
import PulseLoader from "react-spinners/PulseLoader";

//import custom stuff
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import MessageActions from "@/components/chat/message-actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Message {
  _id: Id<"messages">; // System field
  _creationTime: Date; // System field
  aiModel: string;
  aiResponse: string;
  completionTokens: number; // float64 in Convex schema maps to number in TypeScript
  meetingID: string; // Assuming v.id("meetings") returns a string identifier
  promptTokens: number;
  userId: string;
  userMessage: string;
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
  const profileImageUrl = user?.imageUrl;
  const [isAiResponding, setIsAiResponding] = useState(false);

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
  const [inputMessage, setInputMessage] = useState("");

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

  useEffect(() => {
    // Call Prism to highlight all code blocks
    Prism.highlightAll();
  }, [messages]);

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

  const handleRedo = (messageId: string) => {
    // Implement the redo functionality
  };

  const handleThumbsDown = (messageId: string) => {
    // Implement the thumbs down functionality
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
                    <ReactMarkdown
                      remarkPlugins={[gfm as any]}
                      rehypePlugins={[raw as any]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <pre style={{ overflowX: "auto" }}>
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.userMessage}
                    </ReactMarkdown>
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
                  <div className="flex flex-col">
                    <div className="relative rounded-lg border mx-4 p-4 outline-gray-500 max-w-sm">
                      <ReactMarkdown
                        remarkPlugins={[gfm as any]}
                        rehypePlugins={[raw as any]}
                        components={{
                          // Customizing heading elements
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold my-2"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-semibold my-2"
                              {...props}
                            />
                          ),
                          // Already customized h1 and h2 in the previous example
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-semibold my-1"
                              {...props}
                            />
                          ),
                          h4: ({ node, ...props }) => (
                            <h4
                              className="text-md font-medium my-1"
                              {...props}
                            />
                          ),
                          h5: ({ node, ...props }) => (
                            <h5
                              className="text-sm font-medium my-1"
                              {...props}
                            />
                          ),
                          h6: ({ node, ...props }) => (
                            <h6
                              className="text-xs font-medium my-1"
                              {...props}
                            />
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
                          // Continue with the previously customized components
                          a: ({ node, ...props }) => (
                            <a
                              className="text-blue-500 hover:text-blue-700 underline"
                              {...props}
                            />
                          ),

                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            if (!inline && match) {
                              const language = match[1];
                              const code = children.toString();
                              const html = highlightCode(code, language);
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
                                        dangerouslySetInnerHTML={{
                                          __html: html,
                                        }}
                                        {...props}
                                      />
                                    </pre>

                                    <ScrollBar
                                      orientation="horizontal"
                                      className=""
                                    />
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
                        {message.aiResponse}
                      </ReactMarkdown>
                    </div>
                    <div className="m-2 ml-4">
                      <MessageActions
                        messageId={message._id}
                        messageText={message.aiResponse}
                        onCopy={handleCopy}
                        onRedo={handleRedo}
                        onThumbsDown={handleThumbsDown}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 p-2 w-[calc(100%-40px)] md:w-[calc(50%-20px)] md:max-w-[448px] sm:min-w-[448px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsAiResponding(true);
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const message = formData.get("message") as string;

            // Clear the input field immediately after submission
            setInputMessage(""); // Assuming you're using this state to control the input value
            form.reset(); // Or keep this if you're not controlling the input with React state

            if (message.trim() !== "") {
              // Trim unnecessary attributes from speakerDetails
              const trimmedSpeakerDetails = speakerDetails.map(
                ({ speakerNumber, firstName, lastName }) => ({
                  speakerNumber,
                  firstName,
                  lastName,
                })
              );

              // Trim unnecessary attributes from finalizedSentences
              const trimmedFinalizedSentences = finalizedSentences.map(
                ({ end, meetingID, speaker, start, transcript }) => ({
                  end,
                  meetingID,
                  speaker,
                  start,
                  transcript,
                })
              );

              // Include the updatedChatHistory in the sendMessage call
              await sendMessage({
                message,
                meetingID,
                aiModel: selectedModel,
                chatHistory,
                ...(includeTranscript && {
                  finalizedSentences: trimmedFinalizedSentences,
                  speakerDetails: trimmedSpeakerDetails,
                }),
              });
              setIsAiResponding(false);
            }
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
            className="absolute 
            bottom-[14px]
                          w-8
                          h-8
                          right-[15px]"
            type="submit"
            disabled={isAiResponding} // Disable button while AI is responding
          >
            {isAiResponding ? (
              <PulseLoader color="#FFFFFF" loading={isAiResponding} size={5} />
            ) : (
              <CornerRightUp size={16} />
            )}
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
