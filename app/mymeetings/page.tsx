"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import Microphone from "@/components/microphone";

export default function Home() {
  const tasks = useQuery(api.tasks.get);

  return (
    <main className="flex flex-col h-full w-full">
      <div className="">
        <Microphone />
      </div>
      {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
    </main>
  );
}
