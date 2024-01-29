"use client";

// import react stuff
import { useState } from "react"; // Import useState

// import nextjs stuff
import Link from "next/link";

// import convex stuff for db
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// import shadcnui stuff
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

//import custom stuff
import MeetingCard from "@/components/meetings/meeting-card";

export default function ListOfMeetings({
  onMeetingSelect, //   PageProps,
}: {
  onMeetingSelect: (meetingId: Id<"meetings">) => void;
}) {
  const createMeeting = useMutation(api.meetings.createMeeting);
  const meetings = useQuery(api.meetings.getMeetingsForUser);

  return (
    <div className="flex flex-col h-full">
      <Button
        onClick={async () => {
          const response = await createMeeting({ title: "My Meeting" });
        }}
      >
        Create Meeting
      </Button>
      <div>My Meetings</div>
      <ul>
        {meetings?.map((meeting) => (
          <li key={meeting._id}>
            <Link href={`/mymeetings/${meeting._id}`}>{meeting._id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
