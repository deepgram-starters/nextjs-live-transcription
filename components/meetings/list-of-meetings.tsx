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
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder card for creating a new meeting */}
        <li
          className="cursor-pointer"
          onClick={async () => {
            const response = await createMeeting({ title: "My Meeting" });
            // Optionally handle the response, e.g., select the new meeting
          }}
        >
          {/* Adjust the div below to match the size of MeetingCard */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center items-center h-full">
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
