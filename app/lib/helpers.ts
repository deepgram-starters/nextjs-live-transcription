import { LiveTranscriptionEvent } from "@deepgram/sdk";
import { Message } from "ai/react";
import { CreateMessage } from "ai";

/**
 * get the sentence from a LiveTranscriptionEvent
 * @param {LiveTranscriptionEvent} event
 * @returns {string}
 */
const utteranceText = (event: LiveTranscriptionEvent) => {
  const words = event.channel.alternatives[0].words;
  return words.map((word: any) => word.punctuated_word ?? word.word).join(" ");
};

/**
 * get user messages
 * @param {any[]} messages
 * @returns {any[]}
 */
const getUserMessages = (messages: Message[]) => {
  return messages.filter((message) => message.role === "user");
};

/**
 * get message we want to display in the chat
 * @param {any[]} messages
 * @returns {any[]}
 */
const getConversationMessages = (messages: Message[]) => {
  return messages.filter((message) => message.role !== "system");
};

const blankUserMessage: CreateMessage = {
  role: "user",
  content: "",
};

export {
  getUserMessages,
  getConversationMessages,
  utteranceText,
  blankUserMessage,
};
