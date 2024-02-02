"use client";

// import react stuff
import { useState } from "react"; // Import useState

// import nextjs stuff
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

// import convex stuff for db
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// import additional librarys
import { formatDistanceToNow } from "date-fns";

// import shadcnui stuff
import { Button } from "@/components/ui/button";

//import custom stuff
import MeetingCard from "@/components/meetings/meeting-card";

export default function ListOfMeetings({} // onMeetingSelect, //   PageProps,
: {
  // onMeetingSelect: (meetingId: Id<"meetings">) => void;
}) {
  const createMeeting = useMutation(api.meetings.createMeeting);
  const meetings = useQuery(api.meetings.getMeetingsForUser);
  const router = useRouter();

  // Function to handle meeting selection
  const onMeetingSelect = (meetingId: Id<"meetings">) => {
    router.push(`/mymeetings/${meetingId}`); // Navigate to the meeting detail page
  };

  return (
    <div className="flex flex-col h-full">
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder card for creating a new meeting */}
        <li
          className="cursor-pointer"
          onClick={async () => {
            const response = await createMeeting({ title: "My Meeting" });
            // Optionally handle the response, e.g., select the new meeting
          }}
        >
          {/* Adjust the div below to match the size of MeetingCard */}
          <div className="border border-muted-foreground bg-white bg-opacity-5 rounded-lg p-4 flex justify-center items-center h-full">
            <span>Create a New Meeting</span>
          </div>
        </li>
        {meetings?.map((meeting) => (
          <li key={meeting._id}>
            <div
              className="cursor-pointer"
              onClick={() => onMeetingSelect(meeting._id)}
            >
              <MeetingCard meeting={meeting} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
