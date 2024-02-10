const LeftBubble = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  return (
    <>
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-xl">
            {children}
          </div>
        </div>
        <small className="text-zinc-500 pl-3">{meta}</small>
      </div>
    </>
  );
};

const RightBubble = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="flex items-center justify-center h-8 w-8 flex-shrink-0 ml-4">
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
            <div>{children}</div>
          </div>
        </div>
        <small className="block text-zinc-500 pl-3 text-right mr-[3.75rem]">
          {meta}
        </small>
      </div>
    </>
  );
};

const ChatBubble = ({ message }: { message: any }) => {
  if (message.role === "user") {
    return <LeftBubble meta={"20ms"}>{message.content}</LeftBubble>;
  } else {
    return <RightBubble meta={"3ms"}>{message.content}</RightBubble>;
  }
};

export { LeftBubble, RightBubble, ChatBubble };
