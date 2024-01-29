"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Separator } from "@/components/ui/separator";

import Microphone from "@/components/microphone";
import Chat from "@/components/chat/chat";
import ListOfMeetings from "@/components/meetings/list-of-meetings";

export default function MyMeetings() {
  return (
    <main className="flex flex-col h-full w-full">
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-1/2">
          <ListOfMeetings />
        </div>
        <div className="w-1/2">
          <Microphone />
        </div>
        <Separator orientation="vertical" className="mx-4 h-full"></Separator>
        <div className="w-1/2">
          <Chat />
        </div>
      </div>
    </main>
  );
}
