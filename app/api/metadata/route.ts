import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    title: "Next.js Live Transcription",
    description: "Get started using Deepgram's Live Transcription with this Next.js demo app",
    author: "Deepgram DX Team <devrel@deepgram.com> (https://developers.deepgram.com)",
    repository: "https://github.com/deepgram-devs/nextjs-live-transcription",
    useCase: "live-transcription",
    language: "javascript",
    framework: "nextjs",
    sdk: "@deepgram/sdk",
    tags: ["live-transcription", "live-stt", "real-time-transcription", "streaming-transcription", "live-speech-to-text", "javascript", "nextjs", "react"],
  });
}
