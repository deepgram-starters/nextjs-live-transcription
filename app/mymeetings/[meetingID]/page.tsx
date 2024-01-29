"use client";

//import nextjs stuff
import { useRouter, usePathname, useSearchParams } from "next/navigation";

//import convex stuff
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

//import shadcnui stuff
import { Separator } from "@/components/ui/separator";

// import custom stuff
import Microphone from "@/components/microphone";
import Chat from "@/components/chat/chat";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";

type Meeting = {
  title: string;
  userId: string;
};

export default function Page({
  params,
}: {
  params: { meetingID: Id<"meetings"> };
}) {
  const meetingDetails = useQuery(api.meetings.getMeetingByID, {
    meetingID: params.meetingID!,
  }) as Meeting[] | undefined;

  console.log("meetingDetails", meetingDetails);

  return (
    <div className="flex flex-col border h-[calc(100vh-4rem)]">
      <Breadcrumbs className="">
        <BreadcrumbItem href="/mymeetings">My Meetings</BreadcrumbItem>
        <BreadcrumbItem>{meetingDetails?.[0]?.title}</BreadcrumbItem>
      </Breadcrumbs>
      <div className="flex-grow flex flex-row">
        <div className="border flex-grow">
          <Microphone />
        </div>
        <Separator orientation="vertical" className="mx-4 h-full"></Separator>
        <div className="border max-w-md">
          {params.meetingID && <Chat meetingID={params.meetingID} />}
        </div>
      </div>
    </div>
  );
}
