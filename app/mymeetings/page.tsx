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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//import icone stuff
import {
  Star,
  Trash2,
  ArrowUpZA,
  ArrowDownAZ,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

//import custom stuff
import Microphone from "@/components/microphone";
import Chat from "@/components/chat/chat";
import ListOfMeetings from "@/components/meetings/list-of-meetings";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";

export default function MyMeetings() {
  // Hardcoded meeting ID for testing, cast to the expected type

  return (
    <main className="flex flex-col h-full mx-10 space-y-2">
      <Breadcrumbs className="">
        <BreadcrumbItem href="/mymeetings">All Meetings</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-row h-full">
        <div className="flex flex-col w-full">
          <ListOfMeetings />
        </div>
      </div>
    </main>
  );
}
