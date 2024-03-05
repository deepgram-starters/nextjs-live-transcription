import { Avatar } from "@nextui-org/react";
import { DgSvg } from "./DgSvg";
import { Message } from "ai/react";
import { useMessageData } from "../context/MessageMetadata";
import { usePlayQueue } from "../context/PlayQueue";
import { voiceMap } from "../context/Deepgram";

export const AgentAvatar = ({
  message,
  className = "",
}: {
  message: Message;
  className?: string;
}) => {
  const { playQueue } = usePlayQueue();
  const { messageData } = useMessageData();

  const foundAudio = playQueue.findLast((item) => item.id === message.id);
  const foundData = messageData.findLast((item) => item.id === message.id);

  if (foundAudio?.model) {
    return <Avatar src={voiceMap(foundAudio?.model).avatar} />;
  }

  if (foundData?.ttsModel) {
    return <Avatar src={voiceMap(foundData?.ttsModel).avatar} />;
  }

  return <DgSvg />;
};
