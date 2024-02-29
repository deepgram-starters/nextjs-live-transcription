import { Avatar } from "./Avatar";
import { TextContent } from "./TextContext";

export const RightBubble = ({ text, id }: { text: string; id?: string }) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3">
        <div className="flex justify-start flex-row-reverse gap-2">
          <div className="h-6 w-6 text-white shrink-0 pt-1">
            <Avatar />
          </div>
          <div className="glass relative text-sm py-2 px-4 shadow rounded-s-xl rounded-ee-xl">
            <TextContent text={text} />
          </div>
        </div>
      </div>
    </>
  );
};
