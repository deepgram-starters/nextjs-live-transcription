import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const ffmpeg = createFFmpeg({
  log: true,
  corePath: "/dist/ffmpeg-core.js",
});

export async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

export async function extractSegment(
  audioBlob: Blob,
  startTime: number,
  endTime: number,
  outputFilename: string
): Promise<Blob> {
  await loadFFmpeg(); // Ensure FFmpeg is loaded

  const startSeconds = startTime; // Convert to seconds if needed
  const durationSeconds = endTime - startTime; // Calculate duration

  await ffmpeg.FS("writeFile", "input.webm", await fetchFile(audioBlob));
  await ffmpeg.run(
    "-ss",
    `${startSeconds}`,
    "-t",
    `${durationSeconds}`,
    "-i",
    "input.webm",
    outputFilename
  );
  const data = ffmpeg.FS("readFile", outputFilename);

  return new Blob([data.buffer], { type: "audio/webm" });
}
