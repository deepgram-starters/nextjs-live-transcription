"use client";

//import react stuff
import { useQuery } from "convex/react";
import { useState } from "react";

//import nextjs stuff
import Link from "next/link";

//import convex stuff
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

//import shadcnui stuff
import { Separator } from "@/components/ui/separator";

//import custom stuff
import Microphone from "@/components/microphone";
import Chat from "@/components/chat/chat";
import ListOfMeetings from "@/components/meetings/list-of-meetings";

export default function MyMeetings() {
  // Hardcoded meeting ID for testing, cast to the expected type
  const [selectedMeetingID, setSelectedMeetingID] =
    useState<Id<"meetings"> | null>(null);

  return (
    <main className="flex flex-col h-full w-full">
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-1/2">
          <ListOfMeetings onMeetingSelect={setSelectedMeetingID} />
        </div>
      </div>
    </main>
  );
}