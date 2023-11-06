"use client";

import { useTranscriptionContext } from "@/context/transcription";
import { useState } from "react";

export default function Captions() {
  const { transcription } = useTranscriptionContext();

  return (
    <div className="captions" id="captions">
      <span>{transcription ?? "Captions by Deepgram"}</span>
    </div>
  );
}
