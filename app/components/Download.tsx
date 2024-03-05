import { Message } from "ai/react";
import { DownloadIcon } from "./icons/DownloadIcon";
import { useDeepgram } from "../context/Deepgram";

const DownloadButton = ({ content }: { content: string }) => {
  const file = new Blob([content], { type: "text/plain" });

  return (
    <a
      className="glass w-[10.5rem] md:w-10 h-10 border rounded-full text-sm p-2.5 hover:w-[10.5rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap"
      download="transcript.txt"
      target="_blank"
      rel="noreferrer"
      href={URL.createObjectURL(file)}
    >
      <DownloadIcon className="w-5 h-5" />
      <span className="ml-2.5 text-xs">Download transcript</span>
    </a>
  );
};

export const Download = ({ messages }: { messages: Message[] }) => {
  const { ttsOptions } = useDeepgram();
  const voice = ttsOptions.model;
  const context = messages
    .filter((m) => ["user", "assistant"].includes(m.role))
    .map((m) => {
      if (m.role === "assistant") {
        return `${voice ?? "Asteria"}: ${m.content}`;
      }

      if (m.role === "user") {
        return `User: ${m.content}`;
      }
    });

  return <DownloadButton content={context.join("\n\n")} />;
};
