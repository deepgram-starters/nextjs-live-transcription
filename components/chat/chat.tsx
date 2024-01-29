"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

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

  return (
    <div className="flex flex-col h-full w-full">
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
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const message = formData.get("message") as string;
          await sendMessage({ message, meetingID });
          form.reset();
        }}
      >
        <input
          name="message"
          className="text-black border mx-4 mt-4 p-1"
          placeholder="type your message..."
        />
        <button type="submit" className="border p-1">
          send
        </button>
      </form>
    </div>
  );
}
