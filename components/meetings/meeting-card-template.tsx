//import react stuff
import React from "react";

//import nextjs stuff
import Link from "next/link";

//import shadcnui stuff
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

//import icon stuff
import { Dot, CalendarIcon, Timer } from "lucide-react";

// DATA TO WORK WITH:
const meetings = [
  {
    id: "1",
    title: "BAF Weekly Meeting",
    dateAndTime: "Wed 12/27/23 @ 12:09 PM",
    aging: "2 months ago",
    duration: "00:27:10",
    summary:
      "Discussed the pending status of the dual disclosure initiative, existing procedural compliance issues, particularly with remote account openings, and strategies for addressing gaps in current processes.",
    sectondarySpeakersCount: "2",
    primarySpeakers: [
      {
        id: "1",
        firstName: "Jenifer",
        lastName: "Smith",
        initials: "JS",
        participation: "0:12:25",
      },
      {
        id: "2",
        firstName: "Scott",
        lastName: "Sparks",
        initials: "SS",
        participation: "0:10:25",
      },
      {
        id: "3",
        firstName: "John",
        lastName: "Doe",
        initials: "JD",
        participation: "0:08:13",
      },
      {
        id: "4",
        firstName: "Joe",
        lastName: "Tayloe",
        initials: "JT",
        participation: "0:05:13",
      },
    ],
    primaryTopics: [
      {
        id: "1",
        topic: "Dual Disclosure",
        startTime: "0:00:00",
        endTime: "0:05:23",
        duration: "0:05:23",
      },
      {
        id: "2",
        topic: "Office Clean Sweep Activity",
        startTime: "0:05:23",
        endTime: "0:12:34",
        duration: "0:12:34",
      },
      {
        id: "3",
        topic: "Recognition",
        startTime: "0:12:34",
        endTime: "0:20:47",
        duration: "0:08:47",
      },
      {
        id: "4",
        topic: "Upcoming Updates",
        startTime: "0:20:47",
        endTime: "0:29:12",
        duration: "0:09:12",
      },
    ],
  },
];

//@ts-ignore
export default function MeetingCard({ meeting }) {
  return (
    <Link href={`/mymeetings/${meeting._id}`} passHref>
      <div>
        {meetings.map((meeting) => (
          <button
            key={meeting.id}
            className="flex flex-col gap-4 w-full items-start rounded-lg border border-border/80 p-3 text-left text-sm transition-all hover:primary"
          >
            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="font-semibold text-lg">{meeting.title}</div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {meeting.aging}
                </div>
              </div>
              <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 justify-between">
                <div className=" flex items-center font-medium text-xs ">
                  <CalendarIcon
                    className="mr-1.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1}
                  />
                  {meeting.dateAndTime}
                </div>
                <div className=" flex items-center font-medium text-xs ">
                  <Timer
                    className="mr-1.5 h-5 w-5 flex-shrink-0 "
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1}
                  />
                  {meeting.duration}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {meeting.primarySpeakers.map((speaker) => (
                <div key={speaker.id} className="flex flex-row">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{speaker.initials}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col lg:flex-row ml-4 items-center">
                          <p className="">{speaker.firstName}</p>
                          <p className="">{speaker.lastName}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{`+${meeting.sectondarySpeakersCount}`}</AvatarFallback>
              </Avatar>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xs">
                  More Details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="line-clamp-2 text-sm text-muted-foreground">
                    {meeting.summary}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {meeting.primaryTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center">
                        <Dot className="mr-2" /> {topic.topic}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </button>
        ))}
      </div>
    </Link>
  );
}
