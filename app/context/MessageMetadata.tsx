"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { MessageMetadata } from "../lib/types";

type MessageMetadataContext = {
  messageData: MessageMetadata[];
  setMessageData: Dispatch<SetStateAction<MessageMetadata[]>>;
  addMessageData: (queueItem: MessageMetadata) => void;
};

interface MessageMetadataContextInterface {
  children: React.ReactNode;
}

const MessageMetadataContext = createContext({} as MessageMetadataContext);

const MessageMetadataContextProvider = ({
  children,
}: MessageMetadataContextInterface) => {
  const [messageData, setMessageData] = useState<MessageMetadata[]>([]);

  const addMessageData = useCallback((queueItem: MessageMetadata): void => {
    setMessageData((q) => [...q, queueItem]);
  }, []);

  return (
    <MessageMetadataContext.Provider
      value={{
        messageData,
        setMessageData,
        addMessageData,
      }}
    >
      {children}
    </MessageMetadataContext.Provider>
  );
};

function useMessageData() {
  return useContext(MessageMetadataContext);
}

export { MessageMetadataContextProvider, useMessageData };
