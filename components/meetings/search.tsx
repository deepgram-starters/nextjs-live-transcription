import React, { useState } from "react";

//import convex stuff
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

//import shadcnui stuff
import { Button } from "@/components/ui/button"; // Import the button component from the components/ui/button module
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"; // Import the command components from the components/ui/command module
import { Input } from "@/components/ui/input"; // Import the input component from the components/ui/input module

//import icon stuff
import { Search } from "lucide-react"; // Assuming you're using lucide-react for icons

//import types
import type { SearchResult } from "@/lib/types";

type SearchCommandProps = {
  onSearchComplete: (results: SearchResult[]) => void;
};

export const SearchCommand = ({ onSearchComplete }: SearchCommandProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const [sentenceIds, setSentenceIds] = useState<Id<"finalizedSentences">[]>(
    []
  );

  const searchMeetings = useAction(api.transcript.searchSentencesByEmbedding);

  // Assuming the action returns an array of objects with sentenceId and meetingId
  const handleSearch = async () => {
    if (inputValue.trim() !== "") {
      const results = await searchMeetings({ searchQuery: inputValue });
      if (results) {
        const detailedResults = results.map((result) => ({
          id: result.finalizedSentenceId, // Adjusted from finalizedSentenceId to id
          meetingID: result.meetingID, // Adjusted from meetingId to meetingID
          score: result.score,
          searchInput: inputValue,
        }));
        onSearchComplete(detailedResults as SearchResult[]);
      }
    }
  };

  // Use the useQuery hook to fetch sentence details based on the sentenceIds state
  const sentenceDetails = useQuery(
    api.transcript.fetchMultipleFinalizedSentenceDetails,
    { sentenceIds }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputValue(e.target.value);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Render logic here, including displaying sentenceDetails if available
  return (
    <div className="flex items-center max-w-md mx-auto">
      <Input
        className="w-full pl-5 rounded-l-full leading-tight"
        id="search"
        type="text"
        placeholder="Search..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant="secondary"
        className="rounded-r-full"
        onClick={handleSearch}
      >
        <Search size={20} className="mr-2" />
      </Button>
    </div>
  );
};
