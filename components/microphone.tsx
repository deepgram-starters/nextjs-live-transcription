"use client";

//import react stuff
import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import { useQueue } from "@uidotdev/usehooks";

//import nextjs stuff
import Image from "next/image";
import Link from "next/link";

// import convex stuff for db
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

//import deepgram stuff
import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";

//import shadcnui stuff
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

//import icon stuff
import { Mic, Pause, Timer, Download } from "lucide-react";
import Dg from "@/app/dg.svg";

//import custom stuff
import TranscriptDisplay from "@/components/microphone/transcript";
import { extractSegment } from "@/lib/ffmpgUtils";

interface CaptionDetail {
  words: string;
  isFinal: boolean;
}

export interface WordDetail {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
  punctuated_word: string;
}

export interface FinalizedSentence {
  speaker: number;
  transcript: string;
  start: number;
  end: number;
  meetingID: Id<"meetings">;
}

export interface SpeakerDetail {
  speakerNumber: number;
  firstName: string;
  lastName: string;
  meetingID: Id<"meetings">;
}

// Step 1: Define a QuestionDetail Interface
export interface QuestionDetail {
  question: string;
  timestamp: number; // You can choose to track the time the question was asked
  speaker: number; // Optional: track which speaker asked the question
  meetingID: Id<"meetings">; // Optional: track the meeting ID
}

interface MicrophoneProps {
  meetingID: Id<"meetings">;
  language: string;
  finalizedSentences: FinalizedSentence[];
  setFinalizedSentences: React.Dispatch<
    React.SetStateAction<FinalizedSentence[]>
  >;
  speakerDetails: SpeakerDetail[];
  setSpeakerDetails: React.Dispatch<React.SetStateAction<SpeakerDetail[]>>;
  caption: CaptionDetail | null;
  setCaption: Dispatch<SetStateAction<CaptionDetail | null>>;
  finalCaptions: WordDetail[];
  setFinalCaptions: Dispatch<SetStateAction<WordDetail[]>>;

  initialDuration: number; // Add this line
  questions: QuestionDetail[]; // Add this line
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDetail[]>>;
}

export default function Microphone({
  meetingID,
  language,

  finalizedSentences,
  setFinalizedSentences,
  speakerDetails,
  setSpeakerDetails,
  caption,
  setCaption,
  finalCaptions,
  setFinalCaptions,
  initialDuration,
}: MicrophoneProps) {
  const { add, remove, first, size, queue } = useQueue<any>([]);

  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const combinedAudioBlob = new Blob(audioBlobs, { type: "audio/webm" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  // const [finalCaptions, setFinalCaptions] = useState<WordDetail[]>([]);

  const retrieveSummary = useAction(api.meetingSummary.retrieveMeetingSummary);

  // State for the timer
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const storeQuestion = useMutation(api.transcript.storeQuestion);
  const storeWordDetail = useMutation(api.transcript.storeWordDetail);

  const generateUploadUrl = useMutation(api.transcript.generateAudioUploadUrl);
  const sendAudio = useMutation(api.transcript.sendAudio);

  const runProcessAudioEmbedding = useAction(
    api.transcript.processAudioEmbedding
  );

  const uploadAudioBlob = useCallback(
    async (audioBlob: Blob) => {
      try {
        // Step 1: Get a short-lived upload URL
        const uploadUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "audio/webm" },
          body: audioBlob,
        });
        if (!response.ok) {
          throw new Error("Failed to upload audio blob");
        }
        const { storageId } = await response.json();

        // Step 3: Save the newly allocated storage id to the database
        await sendAudio({ storageId, meetingID });

        // Call the generateEmebedding action with the storageId
        // runProcessAudioEmbedding({ storageId }).then(() => {
        //   // Handle the response as needed
        // });
      } catch (error) {
        console.error("Error uploading audio blob:", error);
      }
    },
    [meetingID, generateUploadUrl, sendAudio, runProcessAudioEmbedding]
  );

  //disable re-recording until i fix the bug
  const [disableRecording, setDisableRecording] = useState(false);
  useEffect(() => {
    // Set the timer to the initial duration
    setTimer(initialDuration);
    // Disable recording if there is an initial duration
    if (initialDuration > 0) {
      setDisableRecording(true);
    }
  }, [initialDuration]);

  useEffect(() => {
    // This useEffect hook will run when the component mounts and anytime downloadUrl changes.
    // The cleanup function will run when the component unmounts or before the effect runs again due to a change in downloadUrl.
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null); // Optionally reset downloadUrl state here if needed
      }
    };
  }, [downloadUrl]);

  // Function to start the timer
  const startTimer = useCallback(() => {
    setTimer(0); // Reset timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000); // Update timer every second
    setTimerInterval(interval);
  }, [setTimerInterval]); // Add dependencies if any

  // Function to stop the timer
  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval, setTimerInterval]);

  const addSpeakerToDB = useMutation(api.meetings.addSpeaker);

  // Function to handle new speakers
  const handleNewSpeaker = useCallback(
    (speakerNumber: number) => {
      // Check if the speaker already exists
      if (
        !speakerDetails.some((detail) => detail.speakerNumber === speakerNumber)
      ) {
        // Add new speaker with default names
        const newSpeaker: SpeakerDetail = {
          speakerNumber,
          firstName: "Speaker " + speakerNumber,
          lastName: "",
          meetingID,
        };
        // console.log("New Speaker:", newSpeaker);
        setSpeakerDetails((prevDetails) => [...prevDetails, newSpeaker]);
      }
    },
    [speakerDetails, meetingID, setSpeakerDetails]
  );

  const handleFirstNameChange = (id: number, newFirstName: string) => {
    setSpeakerDetails((prevSpeakers) =>
      prevSpeakers.map((speaker) =>
        speaker.speakerNumber === id
          ? { ...speaker, firstName: newFirstName }
          : speaker
      )
    );
  };

  const handleLastNameChange = (id: number, newLastName: string) => {
    setSpeakerDetails((prevSpeakers) =>
      prevSpeakers.map((speaker) =>
        speaker.speakerNumber === id
          ? { ...speaker, lastName: newLastName }
          : speaker
      )
    );
  };

  //this helper function handles the mapping of the speaker number in the sentences to the speaker names in the speaker table
  const getSpeakerName = (speakerNumber: number) => {
    const speaker = speakerDetails.find(
      (s) => s.speakerNumber === speakerNumber
    );
    return speaker
      ? `${speaker.firstName} ${speaker.lastName}`.trim()
      : `Speaker ${speakerNumber}`;
  };

  // Define the mutation hook at the top of your component
  const storeFinalizedSentences = useMutation(
    api.transcript.storeFinalizedSentence
  );
  // Fetch finalized sentences for the given meetingID when the component mounts
  const finalizedSentencesFromDB = useQuery(
    api.transcript.getFinalizedSentencesByMeeting,
    { meetingID }
  );

  useEffect(() => {
    // Check if there are any finalized sentences fetched from the database
    if (finalizedSentencesFromDB && finalizedSentencesFromDB.length > 0) {
      // Handle the fetched finalized sentences as needed
      // For example, you might want to set them to your component's state
      setFinalizedSentences(finalizedSentencesFromDB);
    }
  }, [finalizedSentencesFromDB, setFinalizedSentences]);

  const speakersFromDB = useQuery(api.meetings.getSpeakersByMeeting, {
    meetingID,
  });

  useEffect(() => {
    // Check if there are any speakers fetched from the database
    if (speakersFromDB && speakersFromDB.length > 0) {
      // Set the fetched speakers to your component's state
      setSpeakerDetails(speakersFromDB);
    }
  }, [speakersFromDB, setSpeakerDetails]);

  const createMeeting = useMutation(api.meetings.createMeeting);
  const updateMeeting = useMutation(api.meetings.updateMeetingDetails);

  const handleGenerateSummary = async () => {
    try {
      // Clean finalizedSentences as before
      const cleanedFinalizedSentences = finalizedSentences.map(
        ({ speaker, transcript, start, end, meetingID }) => ({
          speaker,
          transcript,
          start,
          end,
          meetingID,
        })
      );

      // Now also clean speakerDetails to remove any fields not expected by the validator
      const cleanedSpeakerDetails = speakerDetails.map(
        ({ firstName, lastName, speakerNumber }) => ({
          firstName,
          lastName,
          speakerNumber,
        })
      );

      // Call the action with the necessary arguments, including the cleaned data
      const summary = await retrieveSummary({
        message:
          "Please generate a summary for this meeting. Note that the meeting is in " +
          language,
        meetingID: meetingID,
        aiModel: "gpt-3",
        finalizedSentences: cleanedFinalizedSentences,
        speakerDetails: cleanedSpeakerDetails,
      });

      // console.log("Summary:", summary);
    } catch (error) {
      console.error("Failed to generate meeting summary:", error);
      // Optionally, show an error message
    }
  };

  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);

      setDisableRecording(true); //stop enabling the ability to record again until we fix the error/bug

      //retrieve the summary
      handleGenerateSummary();

      console.log("finalCaptions:", finalCaptions); // Log the finalized

      microphone.stop();

      //save final words
      // console.log("Finalized Sentences:", finalizedSentences); // Log the finalized sentences when stopping the recording
      finalCaptions.forEach(async (caption) => {
        try {
          const result = await storeWordDetail({
            meetingID: meetingID,
            word: caption.word,
            start: caption.start,
            end: caption.end,
            confidence: caption.confidence,
            speaker: caption.speaker,
            punctuated_word: caption.punctuated_word,
            // audio_embedding can be omitted if not available yet
          });
          console.log("Word detail stored:", result);
        } catch (error) {
          console.error("Failed to store word detail:", error);
        }
      });

      stopTimer(); // Stop the timer
      await updateMeeting({ meetingID, updates: { duration: timer } });

      // Store finalized sentences in the database
      await Promise.all(
        finalizedSentences.map((sentence) => storeFinalizedSentences(sentence))
      );
      // Push speaker details to the database
      await Promise.all(
        speakerDetails.map((speaker) => addSpeakerToDB(speaker))
      );

      // Combine audio blobs into a single Blob
      const combinedAudioBlob = new Blob(audioBlobs, { type: "audio/webm" });
      // Code to create a downloadable link for the combined audio
      const audioURL = URL.createObjectURL(combinedAudioBlob);
      setDownloadUrl(audioURL); // Set the URL for the download button to use

      uploadAudioBlob(combinedAudioBlob);

      //handle next steps to initiate audio embedding
      // console.log("calling /api/embedding with audio blob:", combinedAudioBlob);
      // const formData = new FormData();
      // formData.append("audio_file", combinedAudioBlob, "audio.webm");

      // const response = await fetch("/api/embedding", {
      //   method: "POST",
      //   body: formData, // Send the form data
      // });
      // console.log("response from /api/embedding:", response);

      // Reset or handle state updates as necessary
      setAudioBlobs([]);
    } else {
      if (disableRecording) {
        toast("Were working on it", {
          description: "Woring on enabling ability to record again",
          action: {
            label: "Got it!",
            onClick: () => console.log("client attempted to rerecord"),
          },
        });
        return;
      } else {
        setAudioBlobs([]); // Reset audio blobs here

        const constraints = {
          audio: {
            echoCancellation: false, // Toggle echoCancellation as needed
            noiseSuppression: false, // Toggle noiseSuppression as needed
          },
        };

        console.log("getting user media with constraings: ", constraints);

        const userMedia =
          await navigator.mediaDevices.getUserMedia(constraints);

        const microphone = new MediaRecorder(userMedia);
        microphone.start(500);

        startTimer(); // Start the timer

        microphone.onstart = () => {
          setMicOpen(true);
        };

        microphone.onstop = () => {
          setMicOpen(false);
        };

        microphone.ondataavailable = (e) => {
          add(e.data);
          setAudioBlobs((prevBlobs) => [...prevBlobs, e.data]);
          console.log("Audio Blob Size:", e.data.size); // Log the size of the current audio blob
        };

        setUserMedia(userMedia);
        setMicrophone(microphone);
      }
    }
  }, [
    add,
    microphone,
    userMedia,
    finalizedSentences,
    startTimer,
    stopTimer,
    addSpeakerToDB,
    meetingID,
    speakerDetails,
    storeFinalizedSentences,
    timer,
    updateMeeting,
    disableRecording,
    audioBlobs,
    storeWordDetail,
    finalCaptions,
    setAudioBlobs,
    setDownloadUrl,
    uploadAudioBlob,
  ]);

  // Clear the interval when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      setAudioBlobs([]); // Reset audio blobs here
    };
  }, [timerInterval]);

  // Function to format the timer
  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!apiKey) {
      // console.log("getting a new api key");
      fetch("/api", { cache: "no-store" })
        .then((res) => res.json())
        .then((object) => {
          if (!("key" in object)) throw new Error("No api key returned");

          setApiKey(object);
          setLoadingKey(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey, setLoadingKey]);

  useEffect(() => {
    if (apiKey && "key" in apiKey) {
      console.log("connecting to deepgram:", language);
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova-2",
        diarize: true,
        interim_results: true,
        smart_format: true,
        language: language,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("connection established");
        setListening(true);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        // console.log("connection closed");
        setListening(false);
        setApiKey(null);
        setConnection(null);
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        // console.log(data);
        const words = data.channel.alternatives[0].words
          .map((word: any) => word.punctuated_word ?? word.word)
          .join(" ");
        const isFinal = data.is_final;
        if (words !== "") {
          setCaption({ words, isFinal });

          // Check if the transcript is final
          if (data.is_final) {
            // Update the finalCaptions array with word details
            setFinalCaptions((prevCaptions) => [
              ...prevCaptions,
              ...data.channel.alternatives[0].words.map((word: any) => ({
                word: word.word,
                start: word.start,
                end: word.end,
                confidence: word.confidence,
                speaker: word.speaker,
                punctuated_word: word.punctuated_word,
              })),
            ]);
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error("Deepgram connection error:", error);
        // Handle the error appropriately in your application context
      });

      setConnection(connection);
      setLoading(false);

      // Cleanup function to close the connection when the component unmounts or the language changes
      return () => {
        console.log("disconnecting from deepgram");
        // Check the connection state before attempting to finish
        if (connection.getReadyState() === WebSocket.OPEN) {
          connection.finish();
        } else {
          console.log(
            `Connection not open. State: ${connection.getReadyState()}`
          );
          // Implement any additional handling for non-OPEN states if necessary
        }
      };
    }
  }, [apiKey, setCaption, setFinalCaptions]);

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  // Function to process final captions and construct finalized sentences
  const processFinalCaptions = useCallback(
    async (finalCaptions: WordDetail[]) => {
      const sentences: FinalizedSentence[] = [];
      let currentSpeaker = finalCaptions[0]?.speaker;
      let currentText = "";
      let startTime = finalCaptions[0]?.start;
      let endTime = finalCaptions[0]?.end;

      // Track if we have already handled the current speaker
      let handledSpeakers: number[] = [];

      // New logic for capturing full questions
      let currentSentence = ""; // Track the current sentence being formed
      const detectedQuestions: QuestionDetail[] = []; // Array to hold detected questions

      for (const wordDetail of finalCaptions) {
        // Append the current word to the sentence being formed
        currentSentence += wordDetail.punctuated_word + " ";

        // Check if the current word ends with a question mark
        if (wordDetail.punctuated_word.endsWith("?")) {
          // If so, capture the entire current sentence as a question

          const currentQuestion: QuestionDetail = {
            question: currentSentence.trim(),
            timestamp: startTime,
            speaker: currentSpeaker,
            meetingID: meetingID,
          };

          detectedQuestions.push(currentQuestion);
          // Reset currentSentence for the next sentence
          currentSentence = "";
        }

        if (
          wordDetail.speaker !== currentSpeaker ||
          wordDetail === finalCaptions[finalCaptions.length - 1]
        ) {
          if (wordDetail === finalCaptions[finalCaptions.length - 1]) {
            currentText += wordDetail.punctuated_word + " ";
            endTime = wordDetail.end;
          }

          sentences.push({
            speaker: currentSpeaker,
            transcript: currentText.trim(),
            start: startTime,
            end: endTime,
            meetingID: meetingID,
          });

          // If we haven't handled this speaker yet, do so now
          if (!handledSpeakers.includes(currentSpeaker)) {
            handleNewSpeaker(currentSpeaker);
            handledSpeakers.push(currentSpeaker);
          }

          currentSpeaker = wordDetail.speaker;
          currentText = wordDetail.punctuated_word + " ";
          startTime = wordDetail.start;
          endTime = wordDetail.end;
        } else {
          currentText += wordDetail.punctuated_word + " ";
          endTime = wordDetail.end;
        }
      }

      console.log("Finalized Sentences:", sentences);
      console.log("Detected Questions:", detectedQuestions); // Log detected questions
      setFinalizedSentences(sentences);
      setQuestions(detectedQuestions);
    },
    [meetingID, handleNewSpeaker, setFinalizedSentences]
  );

  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  // Inside your component
  const prevQuestionsLengthRef = useRef(questions.length);
  useEffect(() => {
    // Check if the questions array has grown
    if (questions.length > prevQuestionsLengthRef.current) {
      // A new question was added, handle it here
      const newQuestion = questions[questions.length - 1];
      console.log("New question added:", newQuestion);
      storeQuestion(newQuestion);
    }
    // Update the ref to the current length after handling
    prevQuestionsLengthRef.current = questions.length;
  }, [questions, storeQuestion]);

  // Call processFinalCaptions whenever finalCaptions is updated
  useEffect(() => {
    if (finalCaptions.length > 0) {
      processFinalCaptions(finalCaptions);
    }
  }, [finalCaptions, processFinalCaptions]);

  // if (isLoadingKey)
  //   return <span className="">Loading temporary API key...</span>;
  // if (isLoading) return <span className="">Loading the app...</span>;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <div className="flex flex-row items-center space-x-2 mr-4">
          {initialDuration === 0 && timer === 0 ? (
            <></>
          ) : (
            <>
              <Timer className="w-6 h-6" />
              <span>{formatTimer()}</span>
            </>
          )}
        </div>
        {/* toggle microphone */}
        {!downloadUrl && (
          <Button
            variant={
              !!userMedia && !!microphone && micOpen
                ? "destructive"
                : "secondary"
            }
            size="icon"
            onClick={() => toggleMicrophone()}
            disabled={isLoadingKey} // Button is disabled if isLoadingKey is true
            className={
              !!userMedia && !!microphone && micOpen
                ? "" // recording enabled
                : "" // recording disabled
            }
          >
            {!!userMedia && !!microphone && micOpen ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        )}
        {/* toggle download */}

        {downloadUrl && (
          <Button size="icon" className="">
            <Link href={downloadUrl} download="recorded_audio.webm">
              <Download />
            </Link>
          </Button>
        )}
      </div>
      {/* connection indicator for deepgram via socket and temp api key */}
      {/* <div
        className="z-20 flex shrink-0 grow-0 justify-around items-center 
                  fixed bottom-0 right-0 rounded-lg mr-1 mb-5 lg:mr-5 lg:mb-5 xl:mr-10 xl:mb-10 gap-5"
      >
        <Button
          variant={isListening ? "secondary" : "outline"}
          className="space-x-2"
        >
          <Dg
            id="dg"
            width="24"
            height="24"
            className={isListening ? "" : ""}
          />
          <Label htmlFor="dg" className="">
            {isListening ? "connected" : "connecting"}
          </Label>
        </Button>
      </div> */}
    </div>
  );
}
