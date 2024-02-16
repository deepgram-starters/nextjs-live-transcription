import { MessageMeta } from "@/app/components/MessageMeta";
import { TextContent } from "@/app/components/TextContext";

export const RightBubble = ({
  text,
  id,
  blink = false,
}: {
  text: string;
  id?: string;
  blink?: boolean;
}) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-s-xl rounded-ee-xl">
            <div className={blink ? "cursor-blink" : ""}>
              <TextContent text={text} />
            </div>
          </div>
        </div>
        <small className="block text-zinc-500 pr-3 text-right py-1">
          <MessageMeta id={id} />
        </small>
      </div>
    </>
  );
};
