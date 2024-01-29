"use client";

// import react stuff
import { useState } from "react"; // Import useState

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

      {meetings?.map((meeting) => {
        return (
          <div key={meeting._id} className="flex flex-col my-2">
            <Button
              onClick={() => onMeetingSelect(meeting._id)}
              className="flex flex-col h-full text-left"
              variant="outline"
            >
              <div className="flex flex-col gap-2">
                <p>{meeting.title}</p>
                <p>{meeting._id?.substring(0, 10)}...</p>
                <p>Meeting Details</p>
              </div>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
