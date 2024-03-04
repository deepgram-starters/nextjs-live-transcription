import { LiveTranscriptionEvent } from "@deepgram/sdk";
import { Message } from "ai/react";
import { CreateMessage } from "ai";
import moment from "moment";
import { greetings } from "./constants";

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

/**
 * Splits a string into chunks based on specified delimiters, ensuring each chunk meets a minimum length.
 * @see https://chat.openai.com/share/b5f3cd47-d995-4a19-af3a-d37f78f7a28c
 * @param {string}   string      The string to split into chunks.
 * @param {string[]} delimiters  An array of delimiters based on which the string should be chunked.
 * @param {number}   minLength   The minimum length required for each chunk.
 * @returns {string[]}           An array of chunks that meet the minimum length requirement.
 */
const chunkStringWithMinLength = (
  string: string,
  delimiters: string[],
  minLength: number
): string[] => {
  let chunks = [];
  let currentChunk = "";

  for (let i = 0; i < string.length; i++) {
    let foundDelimiter = false;

    for (let j = 0; j < delimiters.length; j++) {
      if (string.substr(i, delimiters[j].length) === delimiters[j]) {
        currentChunk += delimiters[j];
        if (currentChunk.length >= minLength) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        i += delimiters[j].length - 1;
        foundDelimiter = true;
        break;
      }
    }

    if (!foundDelimiter) {
      currentChunk += string[i];
    }
  }

  if (currentChunk.length >= minLength) {
    chunks.push(currentChunk);
  }

  return chunks.filter((chunk) => chunk.trim() !== "");
};

/**
 * @returns {string}
 */
const contextualHello = () => {
  const hour = moment().hour();

  if (hour > 3 && hour <= 12) {
    return "Good morning";
  } else if (hour > 12 && hour <= 15) {
    return "Good afternoon";
  } else if (hour > 15 && hour <= 20) {
    return "Good evening";
  } else if (hour > 20 || hour <= 3) {
    return "You're up late";
  } else {
    return "Hello";
  }
};

const sprintf = (template: string, ...args: any[]) => {
  return template.replace(/%[sdf]/g, (match: any) => {
    const arg = args.shift();
    switch (match) {
      case "%s":
        return String(arg);
      case "%d":
        return parseInt(arg, 10).toString();
      case "%f":
        return parseFloat(arg).toString();
      default:
        return match;
    }
  });
};

const randomArrayValue = (array: any[]) => {
  const key = Math.floor(Math.random() * array.length);

  return array[key];
};

const contextualGreeting = () => {
  const greeting = randomArrayValue(greetings);

  return sprintf(greeting.text, ...greeting.strings);
};

export {
  contextualHello,
  contextualGreeting,
  chunkStringWithMinLength,
  getUserMessages,
  getConversationMessages,
  utteranceText,
  blankUserMessage,
};
