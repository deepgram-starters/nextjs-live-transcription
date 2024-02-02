import React, { Dispatch, SetStateAction } from "react";

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
import { ScrollArea } from "@/components/ui/scroll-area";

//import icon stuff
import { User } from "lucide-react";
import type { SpeakerDetail, FinalizedSentence } from "../microphone"; // Assuming these types are exported from microphone.tsx

interface TranscriptDisplayProps {
  speakerDetails: SpeakerDetail[];
  setSpeakerDetails: Dispatch<SetStateAction<SpeakerDetail[]>>;
  finalizedSentences: FinalizedSentence[];
  caption: string | null;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  speakerDetails,
  setSpeakerDetails,
  finalizedSentences,
  caption,
}) => {
  // Moved inside TranscriptDisplay
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

  const getSpeakerName = (speakerNumber: number) => {
    const speaker = speakerDetails.find(
      (s) => s.speakerNumber === speakerNumber
    );
    return speaker
      ? `${speaker.firstName} ${speaker.lastName}`.trim()
      : `Speaker ${speakerNumber}`;
  };

  return (
    <div className="flex flex-col">
      {/* Display Speakers */}
      <div className="flex flex-wrap gap-2">
        {speakerDetails.map((speaker, index) => (
          <div key={index} className="flex flex-row gap-3">
            <Popover>
              <PopoverTrigger>
                <Badge variant="outline" className="h-8">
                  {speaker.firstName} {speaker.lastName}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Speaker Details
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Update speaker details below:
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`firstName-${speaker.speakerNumber}`}>
                        First Name
                      </Label>
                      <Input
                        id={`firstName-${speaker.speakerNumber}`}
                        value={speaker.firstName}
                        onChange={(e) =>
                          handleFirstNameChange(
                            speaker.speakerNumber,
                            e.target.value
                          )
                        }
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`lastName-${speaker.speakerNumber}`}>
                        Last Name
                      </Label>
                      <Input
                        id={`lastName-${speaker.speakerNumber}`}
                        value={speaker.lastName}
                        onChange={(e) =>
                          handleLastNameChange(
                            speaker.speakerNumber,
                            e.target.value
                          )
                        }
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
      <ScrollArea className="h-[calc(100vh-260px)] md:h-[calc(100vh-305px)]">
        {/* Display is_final responses */}
        {(finalizedSentences.length > 0 || caption) && (
          <div className="my-4 space-y-4">
            {finalizedSentences.map((sentence, index) => (
              <div key={index} className="flex flex-row">
                <Avatar className="">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col ml-4 border rounded-lg p-4">
                  <div className="flex flex-row justify-between mb-3">
                    <div className="font-bold">
                      {getSpeakerName(sentence.speaker)}
                    </div>
                    <div className="text-muted-foreground">
                      {sentence.start.toFixed(2)} - {sentence.end.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    {sentence.transcript}{" "}
                    <span className="text-blue-500">{caption} </span>
                  </div>
                </div>
              </div>
            ))}
            {caption && finalizedSentences.length === 0 && (
              <div className="flex flex-row">
                <Avatar className="">
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col ml-4 border rounded-lg p-4">
                  <div>
                    <span className="text-blue-500">{caption}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TranscriptDisplay;
