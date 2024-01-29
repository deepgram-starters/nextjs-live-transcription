"use client";

// import convex stuff for db
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// import shadcnui stuff
import { Button } from "@/components/ui/button";

export default function ListOfMeetings({} //   PageProps,
: {
  //   PageProps: PageProps;
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
          <div key={meeting._id} className="flex flex-col">
            <div className="m-4">{meeting.title}</div>
          </div>
        );
      })}
    </div>
  );
}
