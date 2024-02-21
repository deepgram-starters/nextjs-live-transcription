import { DgSvg } from "./DgSvg";
import { MessageAudio } from "./MessageAudio";
import { MessageMeta } from "./MessageMeta";
import { TextContent } from "./TextContext";
import { useMemo } from "react";
import moment from "moment";

export const LeftBubble = ({ text, id }: { text: string; id?: string }) => {
  return (
    <>
      <div className="col-start-1 col-end-13 sm:col-end-11 md:col-end-9 lg:col-end-8 xl:col-end-7 p-3">
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 p-1 bg-gradient-to-br from-[#7800ED]/70 via-[#7800ED]/50 to-black/50 text-white rounded-full">
            <DgSvg />
          </div>
          <div className="flex  p-4 rounded-e-xl rounded-es-xl bg-[#1E1E23]/50">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-white">Emily</span>
                <span className="text-sm font-normal text-gray-400">
                  {useMemo(() => moment().calendar(), [])}
                </span>
              </div>
              <div className="text-sm font-normal pt-2 text-white markdown">
                <TextContent text={text} />
              </div>
              <div className="pt-2 flex justify-between">
                <MessageMeta id={id} />
              </div>
            </div>
          </div>
          <MessageAudio id={id} className="self-center ml-2" />
        </div>
      </div>
    </>
  );
};
