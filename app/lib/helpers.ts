import { LiveTranscriptionEvent } from "@deepgram/sdk";
import { greetings } from "./constants";

/**
 * get a random greeting
 * @returns {object}
 */
const getRandomGreeting = () =>
  greetings[Math.floor(Math.random() * greetings.length)] ?? greetings[0];

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
 * get message we want to display in the chat
 * @param {any[]} messages
 * @returns {any[]}
 */
const getUserMessages = (messages: any[]) => {
  return messages.filter((message) => message.role !== "system");
};

export { getRandomGreeting, getUserMessages, utteranceText };
