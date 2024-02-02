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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

//import icone stuff
import {
  ArrowDownAZ,
  ArrowUpZA,
  Star,
  Trash2,
  RotateCcw,
  AlertOctagon,
  CalendarPlus,
  Circle,
} from "lucide-react";

//import custom stuff
import MeetingCard from "@/components/meetings/meeting-card";

type Meeting = Doc<"meetings">;

export default function ListOfMeetings({} // onMeetingSelect, //   PageProps,
: {
  // onMeetingSelect: (meetingId: Id<"meetings">) => void;
}) {
  const createMeeting = useMutation(api.meetings.createMeeting);
  const meetings = useQuery(api.meetings.getMeetingsForUser);
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<"CreatedDate" | "Duration" | "Title">(
    "CreatedDate"
  );
  const [showFavorites, setShowFavorites] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Function to handle meeting selection
  const onMeetingSelect = (meetingId: Id<"meetings">) => {
    router.push(`/mymeetings/${meetingId}`); // Navigate to the meeting detail page
  };

  // Function to toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
  };

  const toggleDelete = useMutation(api.meetings.updateMeetingDetails);
  const handleDeleteSelected = async () => {
    // Iterate over all selected meetings
    for (const meetingId of selectedMeetings) {
      await toggleDelete({
        meetingID: meetingId,
        updates: { isDeleted: true },
      });
    }
    // Optionally, clear the selection or fetch updated meetings list after deletion
    setSelectedMeetings([]);
    // If you're keeping a local copy of meetings, you might want to update it here
  };

  // Sort meetings based on sortOrder state
  const sortedMeetings = meetings?.sort((a: Meeting, b: Meeting) => {
    switch (sortBy) {
      case "CreatedDate":
        return sortOrder === "ASC"
          ? a._creationTime - b._creationTime
          : b._creationTime - a._creationTime;
      case "Duration":
        return sortOrder === "ASC"
          ? a.duration - b.duration
          : b.duration - a.duration;
      case "Title":
        return sortOrder === "ASC"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const sortedAndFilteredMeetings = sortedMeetings?.filter(
    (meeting) =>
      (!showFavorites || meeting.isFavorite) && // Keeps favorite filter logic
      (showDeleted ? meeting.isDeleted : !meeting.isDeleted) // Adjusted delete filter logic
  );

  const [selectedMeetings, setSelectedMeetings] = useState<Id<"meetings">[]>(
    []
  );
  const toggleMeetingSelection = (meetingId: Id<"meetings">) => {
    setSelectedMeetings((currentSelected) => {
      if (currentSelected.includes(meetingId)) {
        // If already selected, remove it
        return currentSelected.filter((id) => id !== meetingId);
      } else {
        // Otherwise, add it to the selection
        return [...currentSelected, meetingId];
      }
    });
  };

  const handleRecoverSelected = async () => {
    for (const meetingId of selectedMeetings) {
      await toggleDelete({
        meetingID: meetingId,
        updates: { isDeleted: false },
      });
    }
    // Optionally, clear the selection or fetch updated meetings list after recovery
    // setSelectedMeetings([]);
    // If you're keeping a local copy of meetings, you might want to update it here
  };

  // At the top where other hooks are imported
  const deleteMeetingAndRelatedRecords = useMutation(
    api.meetings.deleteMeetingAndRelatedRecords
  );

  // Function to handle "Delete Forever" action
  const handleDeleteForeverSelected = async () => {
    for (const meetingId of selectedMeetings) {
      await deleteMeetingAndRelatedRecords({ meetingId });
    }
    // Optionally, clear the selection or fetch updated meetings list after deletion
    setSelectedMeetings([]);
    // If you're keeping a local copy of meetings, you might want to update it here
  };

  // Function to toggle the selection of all meetings
  const toggleSelectAllMeetings = () => {
    // Check if all meetings are currently selected
    const areAllMeetingsSelected = sortedAndFilteredMeetings?.every((meeting) =>
      selectedMeetings.includes(meeting._id)
    );

    if (areAllMeetingsSelected) {
      // If all meetings are selected, clear the selection
      setSelectedMeetings([]);
    } else {
      // Otherwise, select all meetings
      const allMeetingIds =
        sortedAndFilteredMeetings?.map((meeting) => meeting._id) || [];
      setSelectedMeetings(allMeetingIds);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between mb-2">
          <div className="flex flex-row items-center space-x-2">
            <Toggle
              className="space-x-2"
              pressed={showFavorites}
              onPressedChange={setShowFavorites}
              aria-label="Toggle favorites"
            >
              {showFavorites ? (
                <Star className="h-4 w-4" fill="white" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              <span className="text-sm">Favorites</span>
            </Toggle>
            <Toggle
              className="space-x-2" // Add your styling here
              pressed={showDeleted}
              onPressedChange={setShowDeleted}
              aria-label="Toggle deleted"
            >
              {showDeleted ? (
                <Trash2 className="h-4 w-4" fill="white" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="text-sm">
                {showDeleted ? "Hide Deleted" : "Show Deleted"}
              </span>
            </Toggle>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Select
              defaultValue={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "CreatedDate" | "Duration" | "Title")
              }
            >
              {" "}
              <SelectTrigger className="">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CreatedDate">
                  Sort by{" "}
                  <Badge variant="default" className="mx-2">
                    Created Date
                  </Badge>
                </SelectItem>
                <SelectItem value="Duration">
                  Sort by{" "}
                  <Badge variant="default" className="mx-2">
                    Duration
                  </Badge>
                </SelectItem>
                <SelectItem value="Title">
                  Sort by{" "}
                  <Badge variant="default" className="mx-2">
                    Title
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              {sortOrder === "DESC" ? <ArrowUpZA /> : <ArrowDownAZ />}
            </Button>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="flex flex-row justify-end space-x-2">
          {/* Conditionally render the delete button */}
          {selectedMeetings.length > 0 && (
            <Toggle
              variant="default"
              className="mb-2"
              pressed={sortedAndFilteredMeetings?.every((meeting) =>
                selectedMeetings.includes(meeting._id)
              )}
              onPressedChange={toggleSelectAllMeetings}
              aria-label="Select all meetings"
            >
              Select All
            </Toggle>
          )}

          {selectedMeetings.length > 0 && !showDeleted && (
            <Button
              variant="destructive"
              size="sm"
              className="mb-2 w-fit"
              onClick={handleDeleteSelected}
            >
              <div className="flex flex-row space-x-2 items-center">
                <Trash2 className="h-4 w-4" /> <p className="text-sm">Delete</p>
              </div>
            </Button>
          )}
          {/* Conditionally render the delete forever and recover button */}
          {selectedMeetings.length > 0 && showDeleted && (
            <div className="flex flex-row space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="mb-2 w-fit"
                onClick={handleRecoverSelected}
              >
                <div className="flex flex-row space-x-2 items-center">
                  <p className="text-sm">Recover</p>
                  <RotateCcw className="h-4 w-4" />{" "}
                </div>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="mb-2 w-fit"
                onClick={handleDeleteForeverSelected} // Attach the handler here
              >
                <div className="flex flex-row space-x-2 items-center">
                  <p className="text-sm">Delete Forever</p>
                  <AlertOctagon className="h-4 w-4" />{" "}
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
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
            <div className="flex flex-col items-center space-y-5">
              <CalendarPlus className="h-10 w-10" />
              <h1>New Meeting</h1>
            </div>
          </div>
        </li>
        {sortedAndFilteredMeetings?.map((meeting) => (
          <li key={meeting._id}>
            <div
              className="cursor-pointer"
              onClick={() => onMeetingSelect(meeting._id)}
            >
              <MeetingCard
                meeting={meeting}
                isSelected={selectedMeetings.includes(meeting._id)}
                onToggleSelected={() => toggleMeetingSelection(meeting._id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
