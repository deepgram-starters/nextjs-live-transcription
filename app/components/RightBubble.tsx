import { Message } from "ai/react";
import { Avatar } from "./Avatar";
import { MessageMeta } from "./MessageMeta";
import { TextContent } from "./TextContext";

export const RightBubble = ({
  message,
  text,
}: {
  message?: Message;
  text?: string;
}) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3">
        <div className="flex justify-start flex-row-reverse gap-2">
          <div className="h-6 w-6 text-white shrink-0 pt-1 mt-1 rounded-full bg-black border border-zinc-300 overflow-hidden">
            <Avatar />
          </div>
          <div className="glass relative text-sm py-2 px-4 shadow rounded-s-xl rounded-ee-xl">
            <div className="text-sm font-normal text-white/80 markdown">
              <TextContent text={message?.content ?? text ?? ""} />
            </div>
          </div>
        </div>
        {message && <MessageMeta className="mr-7 pt-3" message={message} />}
      </div>
    </>
  );
};
