"use client";

import { useState } from "react";

type TranscriptResponse = {
  model: string;
  embedding: string;
  delayTime: number;
  executionTime: number;
  timestamp: string; // Add this line
};

const RunPodPage = () => {
  const [responses, setResponses] = useState<TranscriptResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const models = [
    "tiny",
    // "base",
    // "small",
    // "medium",
    // "large-v1",
    // "large-v2",
    // "large-v3",
  ];

  const fetchTranscripts = async () => {
    setLoading(true);
    const requestTimestamp = new Date().toLocaleString(); // Get the current timestamp

    const fetchPromises = models.map(async (model) => {
      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              audio_file:
                "https://github.com/runpod-workers/sample-inputs/raw/main/audio/gettysburg.wav",
              //   model: model,
            },
          }),
        });
        const data = await response.json();
        // Include the timestamp in the state update
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            model: model,
            embedding: data.output.embedding,
            delayTime: data.delayTime,
            executionTime: data.executionTime,
            timestamp: requestTimestamp, // Add this line
          },
        ]);
      } catch (error) {
        console.error(`Failed to fetch transcript for model ${model}:`, error);
      }
    });

    await Promise.allSettled(fetchPromises);
    setLoading(false);
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const miliseconds = Math.round((milliseconds % 1000) / 100);
    return `${seconds}.${miliseconds}`;
  };

  const calculateAverageTimes = (responses: TranscriptResponse[]) => {
    const modelTimes: Record<string, { total: number; count: number }> = {};

    responses.forEach((response) => {
      const totalTime = response.delayTime + response.executionTime;
      if (modelTimes[response.model]) {
        modelTimes[response.model].total += totalTime;
        modelTimes[response.model].count += 1;
      } else {
        modelTimes[response.model] = { total: totalTime, count: 1 };
      }
    });

    const averages = Object.entries(modelTimes).map(
      ([model, { total, count }]) => ({
        model,
        averageTime: total / count,
      })
    );

    // Sort in ascending order based on averageTime
    return averages.sort((a, b) => a.averageTime - b.averageTime);
  };

  return (
    <div>
      <button onClick={fetchTranscripts} disabled={loading}>
        {loading ? "Loading..." : "Get Transcripts"}
      </button>
      <div className="flex flex-col mt-4">
        <div className="text-center font-bold mb-2">
          Average Total Time by Model
        </div>
        <div className="grid grid-cols-2 text-center border-b-2 border-x-2 border-t-2">
          <div className="border-r-2 p-2">Model</div>
          <div className="p-2">Average Total Time (s)</div>
        </div>
        {calculateAverageTimes(responses).map((avg, index) => (
          <div
            key={index}
            className="grid grid-cols-2 text-center border-b-2 border-x-2"
          >
            <div className="border-r-2 p-2">{avg.model}</div>
            <div className="p-2">{formatTime(avg.averageTime)}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col mt-4">
        <div className="grid grid-cols-6 text-center font-bold">
          <div>Model</div>
          <div>Delay Time</div>
          <div>Execution Time</div>
          <div>Total Time</div>
          <div>embedding</div>
          <div>Timestamp</div> {/* Add this column header */}
        </div>
        {responses.map((response, index) => (
          <div key={index} className="grid grid-cols-6 text-center py-2">
            {" "}
            {/* Update grid-cols to 6 */}
            <div>{response.model}</div>
            <div>{formatTime(response.delayTime)}</div>
            <div>{formatTime(response.executionTime)}</div>
            <div>{formatTime(response.delayTime + response.executionTime)}</div>
            <div>{response.embedding}</div>
            <div>{response.timestamp}</div> {/* Display the timestamp */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunPodPage;
