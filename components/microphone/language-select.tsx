//import react stuff
import * as React from "react";
import ReactCountryFlag from "react-country-flag";

//import shadcnui stuff
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface LanguageSelectProps {
  onLanguageSelect: (language: string) => void;
  id?: string;
}

interface LanguageOption {
  value: string;
  label: string;
  countryCode: string;
}

const languageOptions: LanguageOption[] = [
  { value: "cs", label: "Czech", countryCode: "CZ" },
  { value: "da", label: "Danish", countryCode: "DK" },
  { value: "da-DK", label: "Danish (Denmark)", countryCode: "DK" },
  { value: "nl", label: "Dutch", countryCode: "NL" },
  { value: "en", label: "English", countryCode: "GB" },
  { value: "en-AU", label: "English (Australia)", countryCode: "AU" },
  { value: "en-GB", label: "English (United Kingdom)", countryCode: "GB" },
  { value: "en-US", label: "English (United States)", countryCode: "US" },
  { value: "en-NZ", label: "English (New Zealand)", countryCode: "NZ" },
  { value: "en-IN", label: "English (India)", countryCode: "IN" },
  { value: "nl-BE", label: "Flemish", countryCode: "BE" },
  { value: "fr", label: "French", countryCode: "FR" },
  { value: "fr-CA", label: "French (Canada)", countryCode: "CA" },
  { value: "de", label: "German", countryCode: "DE" },
  { value: "el", label: "Greek", countryCode: "GR" },
  { value: "hi", label: "Hindi", countryCode: "IN" },
  { value: "hi-Latn", label: "Hindi (Latin)", countryCode: "IN" },
  { value: "id", label: "Indonesian", countryCode: "ID" },
  { value: "it", label: "Italian", countryCode: "IT" },
  { value: "ko", label: "Korean", countryCode: "KR" },
  { value: "ko-KR", label: "Korean (South Korea)", countryCode: "KR" },
  { value: "no", label: "Norwegian", countryCode: "NO" },
  { value: "pl", label: "Polish", countryCode: "PL" },
  { value: "pt", label: "Portuguese", countryCode: "PT" },
  { value: "pt-BR", label: "Portuguese (Brazil)", countryCode: "BR" },
  { value: "ru", label: "Russian", countryCode: "RU" },
  { value: "es", label: "Spanish", countryCode: "ES" },
  { value: "es-419", label: "Spanish (Latin America)", countryCode: "MX" },
  { value: "sv", label: "Swedish", countryCode: "SE" },
  { value: "sv-SE", label: "Swedish (Sweden)", countryCode: "SE" },
  { value: "tr", label: "Turkish", countryCode: "TR" },
  { value: "uk", label: "Ukrainian", countryCode: "UA" },
  // Add more options here if needed
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  onLanguageSelect,
  id,
}) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState("en-US");

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    onLanguageSelect(language);
  };

  const selectedOption = languageOptions.find(
    (option) => option.value === selectedLanguage
  );
  const otherOptions = languageOptions.filter(
    (option) => option.value !== selectedLanguage
  );

  return (
    <div id={id}>
      <Select
        onValueChange={handleLanguageSelect}
        defaultValue={selectedLanguage}
      >
        <SelectTrigger className="w-16 flex justify-between items-center p-2">
          {selectedOption ? (
            <>
              <ReactCountryFlag
                countryCode={selectedOption.countryCode}
                svg
                style={{
                  marginRight: "8px",
                  width: "24px", // Set the width of the flag in the trigger
                  height: "16px", // Set the height of the flag in the trigger
                }}
              />
            </>
          ) : (
            <SelectValue placeholder="Select a language" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Selected language</SelectLabel>
            {selectedOption && (
              <SelectItem
                key={selectedOption.value}
                value={selectedOption.value}
              >
                <ReactCountryFlag
                  countryCode={selectedOption.countryCode}
                  svg
                  style={{ marginRight: "8px" }}
                />
                {selectedOption.label}
              </SelectItem>
            )}
            <Separator />
            <SelectLabel className="my-2">Additonal Options</SelectLabel>
            {otherOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <ReactCountryFlag
                  countryCode={option.countryCode}
                  svg
                  style={{ marginRight: "8px" }}
                />
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
