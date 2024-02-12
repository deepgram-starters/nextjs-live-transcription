import * as React from "react";
import ReactCountryFlag from "react-country-flag";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectProps {
  onLanguageSelect: (language: string) => void;
}

interface LanguageOption {
  value: string;
  label: string;
  countryCode: string;
}

const languageOptions: LanguageOption[] = [
  { value: "en-US", label: "English (United States)", countryCode: "US" },
  // Add more options here
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  onLanguageSelect,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select a language</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Languages</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onLanguageSelect(option.value)}
          >
            <ReactCountryFlag
              countryCode={option.countryCode}
              svg
              style={{ marginRight: "8px" }}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
