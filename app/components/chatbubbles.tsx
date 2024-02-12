import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const LeftBubble = ({ text, meta }: { text: string; meta: string }) => {
  return (
    <>
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="flex items-center justify-center h-8 w-8 flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M11.1,24H1c-0.4,0-0.5-0.4-0.3-0.6l6.5-6.2c0.1-0.1,0.2-0.1,0.3-0.1h3.7c2.9,0,5.3-2.1,5.4-4.8c0.1-2.8-2.3-5.2-5.3-5.2H7.4
	v4.6c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4V0.4C0,0.2,0.2,0,0.4,0h10.9C18.4,0,24.1,5.5,24,12.2
	C23.9,18.8,18.1,24,11.1,24z"
              />
            </svg>
          </div>
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-xl">
            <TextContent text={text} />
          </div>
        </div>
        <small className="text-zinc-500 ml-[3.75rem] py-1">{meta}</small>
      </div>
    </>
  );
};

const RightBubble = ({
  text,
  meta,
  blink = false,
}: {
  text: string;
  meta: string;
  blink?: boolean;
}) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-xl">
            <div className={blink ? "cursor-blink" : ""}>
              <TextContent text={text} />
            </div>
          </div>
        </div>
        <small className="block text-zinc-500 pr-3 text-right py-1">
          {meta}
        </small>
      </div>
    </>
  );
};

const TextContent = ({ text }: { text: string }) => {
  return (
    <Markdown
      components={{
        code({ node, className, children, style, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              PreTag="div"
              language={match[1]}
              style={atomDark}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {text}
    </Markdown>
  );
};

const ChatBubble = ({ message }: { message: any }) => {
  if (message.role === "user") {
    return <RightBubble text={message.content} meta={"3ms"} />;
  } else {
    return <LeftBubble text={message.content} meta={"20ms"} />;
  }
};

export { LeftBubble, RightBubble, ChatBubble };
