import { DgSvg } from "./DgSvg";
import { MessageAudio } from "./MessageAudio";
import { MessageMeta } from "./MessageMeta";
import { TextContent } from "./TextContext";
import { useMemo } from "react";
import moment from "moment";
import { Message } from "ai/react";

export const LeftBubble = ({ message }: { message: Message }) => {
  return (
    <>
      <div className="col-start-1 col-end-13 sm:col-end-11 md:col-end-9 lg:col-end-8 xl:col-end-7 p-3">
        <div className="flex items-start gap-2">
          <div className="h-5 w-5 text-white shrink-0 mt-1">
            <DgSvg />
          </div>
          <div className="glass flex p-4 rounded-e-xl rounded-es-xl">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-white">Emily</span>
                <span className="text-sm font-normal text-gray-400">
                  {useMemo(() => moment().calendar(), [])}
                </span>
              </div>
              <div className="text-sm font-normal pt-2 text-white/80 markdown">
                <TextContent text={message.content} />
              </div>
            </div>
          </div>
          <div className="h-6 w-6 shrink-0 self-center">
            <MessageAudio message={message} />
          </div>
        </div>
        <MessageMeta className="ml-7 pt-3" message={message} />
      </div>
    </>
  );
};
