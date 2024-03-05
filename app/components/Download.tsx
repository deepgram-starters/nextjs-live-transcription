import { Message } from "ai/react";
import { DownloadIcon } from "./icons/DownloadIcon";
import { useDeepgram, voiceMap } from "../context/Deepgram";
import { useMessageData } from "../context/MessageMetadata";
import { useQueue } from "@uidotdev/usehooks";
import { usePlayQueue } from "../context/PlayQueue";

const DownloadButton = ({ content }: { content: string }) => {
  const file = new Blob([content], { type: "text/plain" });

  return (
    <span className="bg-white/10 rounded-full flex">
      <a
        className={`relative m-px bg-black w-[10.5rem] md:w-10 h-10 rounded-full text-sm p-2.5 group hover:w-[10.5rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap`}
        download="transcript.txt"
        target="_blank"
        rel="noreferrer"
        href={URL.createObjectURL(file)}
      >
        <DownloadIcon className="w-5 h-5" />
        <span className="ml-2.5 text-xs">Download transcript</span>
      </a>
    </span>
  );
};

export const Download = ({ messages }: { messages: Message[] }) => {
  const { ttsOptions } = useDeepgram();
  const { messageData } = useMessageData();
  const { playQueue } = usePlayQueue();
  const context = messages
    .filter((m) => ["user", "assistant"].includes(m.role))
    .map((m) => {
      if (m.role === "assistant") {
        const foundAudio = playQueue.findLast((item) => item.id === m.id);
        const voice = foundAudio?.model
          ? voiceMap(foundAudio?.model).name
          : "Deepgram";

        return `${voice ?? "Asteria"}: ${m.content}`;
      }

      if (m.role === "user") {
        return `User: ${m.content}`;
      }
    });

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <DownloadButton content={context.join("\n\n")} />
    </div>
  );
};
