import { LeftBubble } from "./LeftBubble";
import { Message } from "ai";
import { RightBubble } from "./RightBubble";

// const isMessage = (message: Message | Metadata): message is Message {
//   return typeof message === 'Message';
// }

function isUserMessage(message: any): message is Message {
  return message.role === "user";
}

function isAssistantMessage(message: any): message is Message {
  return message.role === "assistant";
}

export const ChatBubble = ({ message }: { message: any }) => {
  if (isUserMessage(message)) {
    return <RightBubble text={message.content} id={message.id ?? null} />;
  } else if (isAssistantMessage(message)) {
    return <LeftBubble text={message.content} id={message.id ?? null} />;
  } else {
    return <></>;
  }
};
