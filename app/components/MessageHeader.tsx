import { Message } from "ai/react";
import { useMessageData } from "../context/MessageMetadata";
import moment from "moment";
import { voiceMap } from "../context/Deepgram";
import { usePlayQueue } from "../context/PlayQueue";

const MessageHeader = ({
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

  if (message.role === "assistant") {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <span className="text-sm font-semibold text-white">
          {foundAudio?.model
            ? voiceMap(foundAudio?.model)
            : foundData?.ttsModel
            ? voiceMap(foundData?.ttsModel)
            : "Deepgram AI"}
        </span>
        <span className="text-xs font-normal text-gray-400">
          {moment().calendar()}
        </span>
      </div>
    );
  }
};

export { MessageHeader };
