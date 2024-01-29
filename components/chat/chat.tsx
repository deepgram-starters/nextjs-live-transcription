"use client";

//import react stuff
import { useState } from "react";

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

//import custom stuff
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function ChatCompletion({
  //   finalizedSentences,
  //   speakers,
  meetingID,
}: {
  //   finalizedSentences: SentenceData[];
  //   speakers: SpeakerData[];
  meetingID: Id<"meetings">;
}) {
  const messages = useQuery(api.chat.getMessagesForUser, {
    meetingID: meetingID!,
  });

  const sendMessage = useAction(api.chat.sendMessage);

  // State to track the selected OpenAI model
  const [selectedModel, setSelectedModel] = useState("3.5");

  // Handler to toggle the OpenAI model
  const toggleModel = () => {
    setSelectedModel(selectedModel === "3.5" ? "4.0" : "3.5");
  };

  return (
    <div className="flex flex-col h-full w-[448px]">
      <ScrollArea className="h-[calc(100vh-125px)]">
        <div className="">
          {messages?.map((message) => {
            return (
              <div key={message._id} className="flex flex-col">
                <div className="p-4 my-2 mx-4 rounded-lg border outline-gray-500">
                  {message.userMessage}
                </div>
                <div className="p-4 my-2 mx-4  rounded-lg border outline-gray-500">
                  {message.aiResponse}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 p-2 w-[448px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const message = formData.get("message") as string;
            if (message.trim() !== "") {
              await sendMessage({ message, meetingID });
            }
            form.reset();
          }}
        >
          <Button
            variant="default"
            onClick={toggleModel}
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
          {/* <Button type="submit" className="">
          send
        </Button> */}
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
        </form>
      </div>
    </div>
  );
}
