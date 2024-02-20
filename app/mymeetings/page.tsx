"use client";

//import react stuff
import { useState } from "react";

//import convex stuff
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

//import types
import type { SearchResult } from "@/lib/types";

//import shadcnui stuff
import { Separator } from "@/components/ui/separator";

//import custom stuff
import ListOfMeetings from "@/components/meetings/list-of-meetings";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { SearchCommand } from "@/components/meetings/search";
import { SearchResults } from "@/components/meetings/search-results";

export default function MyMeetings() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchCommandKey, setSearchCommandKey] = useState<number>(0); // New state for controlling re-render

  const sentenceIds = searchResults.map((result) => result.id);

  // Directly use `sentenceIds` as a parameter for `useQuery`.
  // Convex automatically re-fetches the query when `sentenceIds` changes.
  const sentenceDetails = useQuery(
    api.transcript.fetchMultipleFinalizedSentenceDetails,
    { sentenceIds }
  );

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchCommandKey((prevKey) => prevKey + 1); // Increment key to force re-render
  };

  return (
    <main className="flex flex-col h-full mx-2 mt-2 sm:mx-10 space-y-2">
      <div className="relative flex flex-row justify-between items-center">
        <Breadcrumbs className="my-2">
          <BreadcrumbItem href="/mymeetings">All Meetings</BreadcrumbItem>
        </Breadcrumbs>
        <div className="absolute right-0 top-0 items-end">
          <SearchCommand
            key={searchCommandKey} // Use the key here
            onSearchComplete={(results) => setSearchResults(results)}
          />
        </div>
      </div>
      <div className="flex flex-row h-full">
        <div className="flex flex-col w-full">
          {/* <Separator className="mb-4" /> */}
          <SearchResults
            searchResults={searchResults}
            onClearSearch={clearSearchResults}
          />

          {searchResults.length === 0 && <ListOfMeetings />}
        </div>
      </div>
    </main>
  );
}
