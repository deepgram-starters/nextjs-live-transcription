import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
  onLanguageSelect: (language: string) => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  onLanguageSelect,
}) => {
  return (
    <Select onValueChange={onLanguageSelect} defaultValue="en-US">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Languages</SelectLabel>
          <SelectItem value="cs">Czech</SelectItem>
          <SelectItem value="da">Danish</SelectItem>
          <SelectItem value="da-DK">Danish (Denmark)</SelectItem>
          <SelectItem value="nl">Dutch</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="en-US">English (United States)</SelectItem>
          <SelectItem value="en-AU">English (Australia)</SelectItem>
          <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
          <SelectItem value="en-NZ">English (New Zealand)</SelectItem>
          <SelectItem value="en-IN">English (India)</SelectItem>
          <SelectItem value="nl-BE">Flemish</SelectItem>
          <SelectItem value="fr">French</SelectItem>
          <SelectItem value="fr-CA">French (Canada)</SelectItem>
          <SelectItem value="de">German</SelectItem>
          <SelectItem value="el">Greek</SelectItem>
          <SelectItem value="hi">Hindi</SelectItem>
          <SelectItem value="hi-Latn">Hindi (Latin)</SelectItem>
          <SelectItem value="id">Indonesian</SelectItem>
          <SelectItem value="it">Italian</SelectItem>
          <SelectItem value="ko">Korean</SelectItem>
          <SelectItem value="ko-KR">Korean (South Korea)</SelectItem>
          <SelectItem value="no">Norwegian</SelectItem>
          <SelectItem value="pl">Polish</SelectItem>
          <SelectItem value="pt">Portuguese</SelectItem>
          <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
          <SelectItem value="ru">Russian</SelectItem>
          <SelectItem value="es">Spanish</SelectItem>
          <SelectItem value="es-419">Spanish (Latin America)</SelectItem>
          <SelectItem value="sv">Swedish</SelectItem>
          <SelectItem value="sv-SE">Swedish (Sweden)</SelectItem>
          <SelectItem value="tr">Turkish</SelectItem>
          <SelectItem value="uk">Ukrainian</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
