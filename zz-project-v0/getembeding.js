const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const dbOperations = require("./database/dbOperations");
const path = require("path");

//import the startInstance function from startGoogleCompute.js
const { startInstance } = require("./startGoogleCompute.js");

// does a lot of stuff but the main thing is it gets the embedding for the longest part and compars to the database of embeddings to predict the speaker name.  I gave it an optional parameter to seve or not save because i was trying to remodify to csave confmired names and embeddingss to the database afer the user reviewed but it got too difficult so created a new function for that.
const getEmbedding = async (
  folderPath,
  sendStatusUpdate,
  shouldSave = false
) => {
  // sendStatusUpdate(`Starting the VM instance`);
  const externalIp = await startInstance();
  // sendStatusUpdate(`VM started now starting the python server`);

  // Check if the server is ready
  let serverReady = false;
  while (!serverReady) {
    try {
      await axios.get(`http://${externalIp}:5000/`);
      serverReady = true;
    } catch (error) {
      // Wait for 1 second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  sendStatusUpdate(`Reviewing speaker audio.`);

  // Load the JSON file
  const audioPath = path.join(folderPath, "audio.wav");
  const responsePath = path.join(__dirname, folderPath, "response.json");
  const response = require(responsePath);

  // Find the longest spoken segment for each speaker

  const speakers = {};
  response.results.channels[0].alternatives[0].paragraphs.paragraphs.forEach(
    (paragraph) => {
      const speaker = paragraph.speaker;
      const duration = paragraph.end - paragraph.start;

      if (!speakers[speaker] || duration > speakers[speaker].duration) {
        speakers[speaker] = {
          start: paragraph.start,
          end: paragraph.end,
          duration: duration,
        };
      }
    }
  );

  // Get all embeddings from the database
  const allEmbeddings = await dbOperations.getAllEmbeddings(); //returns only speaker name and embedding vector

  // Extract the audio segment for each speaker and send it to the /generate_embedding endpoint
  const promises = Object.keys(speakers).map((speaker) => {
    const outputFilePath = path.join(folderPath, `speaker_${speaker}.wav`);

    return new Promise((resolve, reject) => {
      const { start, end } = speakers[speaker];

      ffmpeg(audioPath)
        .setStartTime(start)
        .setDuration(end - start)
        .output(outputFilePath)
        .on("end", async function (err) {
          if (!err) {
            // Send the audio segment to the /generate_embedding endpoint
            const form = new FormData();
            form.append("audio_file", fs.createReadStream(outputFilePath));

            const response = await axios.post(
              `http://${externalIp}:5000/generate_embedding`,
              form,
              {
                headers: form.getHeaders(),
              }
            );

            // Get the returned embedding
            const returnedEmbedding = response.data.embedding;

            // const result = await identifySpeaker(returnedEmbedding, speaker);
            const result = await identifySpeaker(
              returnedEmbedding,
              speaker,
              allEmbeddings
            );

            // Delete the wav file
            fs.unlink(outputFilePath, (err) => {
              if (err) {
                console.error(`Error deleting file ${outputFilePath}: `, err);
              }
            });

            resolve(result);
          }
        })
        .on("error", function (err) {
          console.log("error: ", err);
          // Reject the promise with the error
          reject(err);
        })
        .run();
    });
  });

  // Wait for all the promises to resolve and return the results
  const results = await Promise.all(promises);
  return results;
};

// Calculate the cosine similarity between the two speakers
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, a_i, i) => sum + a_i * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, a_i) => sum + a_i * a_i, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, b_i) => sum + b_i * b_i, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function identifySpeaker(embedding, speaker, allEmbeddings) {
  let bestMatch = null;
  let highestSimilarity = -1;

  // Compare the returned embedding with each embedding in the database
  for (const dbEmbedding of allEmbeddings) {
    const similarity = cosineSimilarity(
      embedding,
      dbEmbedding.embedding_vector
    );

    if (similarity > highestSimilarity) {
      bestMatch = dbEmbedding.speaker_name;
      highestSimilarity = similarity;
    }
  }

  return { speaker, bestMatch, highestSimilarity };
}

// const processAndSaveEmbeddings = async (folderPath, sendStatusUpdate) => {
//   sendStatusUpdate(`Starting the VM instance`);
//   const externalIp = await startInstance(sendStatusUpdate);
//   sendStatusUpdate(`VM started, now starting the Python server`);

//   // Check if the server is ready
//   let serverReady = false;
//   while (!serverReady) {
//     try {
//       await axios.get(`http://${externalIp}:5000/`);
//       serverReady = true;
//     } catch (error) {
//       // Wait for 1 second before trying again
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }

//   sendStatusUpdate(`Reviewing speaker audio.`);

//   // Load the response.json file
//   const responsePath = path.join(folderPath, "response.json");
//   const response = JSON.parse(fs.readFileSync(responsePath, "utf8"));

//   // Find all spoken segments for each speaker
//   const speakers = {};
//   response.results.channels[0].alternatives[0].paragraphs.paragraphs.forEach(
//     (paragraph) => {
//       const speaker = paragraph.speaker;

//       if (!speakers[speaker]) {
//         speakers[speaker] = [];
//       }

//       speakers[speaker].push({
//         start: paragraph.start,
//         end: paragraph.end,
//         duration: paragraph.end - paragraph.start,
//       });
//     }
//   );

//   // Extract the audio segment for each speaker and send it to the /generate_embedding endpoint
//   const totalSpeakers = Object.keys(speakers).length;
//   let currentSpeakerNumber = 0;

//   // Extract the audio segment for each speaker and send it to the /generate_embedding endpoint
//   for (const speaker in speakers) {
//     for (const segment of speakers[speaker]) {
//       const outputFilePath = path.join(
//         folderPath,
//         `speaker_${speaker}_${segment.start}.wav`
//       );
//       const { start, end } = segment;

//       try {
//         await new Promise((resolve, reject) => {
//           ffmpeg(path.join(folderPath, "audio.wav"))
//             .setStartTime(start)
//             .setDuration(end - start)
//             .output(outputFilePath)
//             .on("end", () => resolve())
//             .on("error", (err) => reject(err))
//             .run();
//         });

//         const form = new FormData();
//         form.append("audio_file", fs.createReadStream(outputFilePath));

//         const embeddingResponse = await axios.post(
//           `http://${externalIp}:5000/generate_embedding`,
//           form,
//           {
//             headers: form.getHeaders(),
//           }
//         );

//         const embedding = embeddingResponse.data.embedding;
//         const speakerName =
//           response.results.channels[0].alternatives[0].words.find(
//             (w) => w.speaker.toString() === speaker
//           ).speaker_name;

//         await dbOperations.createEmbedding({
//           speakerName: speakerName,
//           embeddingVector: embedding,
//           audioMetadata: { startTime: start, endTime: end },
//           timestamp: new Date(),
//         });

//         if (fs.existsSync(outputFilePath)) {
//           fs.unlinkSync(outputFilePath);
//         }

//         currentSpeakerNumber++;
//         sendStatusUpdate(
//           `Processed embedding ${currentSpeakerNumber} of ${totalSpeakers} total. Speaker: ${speakerName}`
//         );
//       } catch (error) {
//         console.error(`Error processing speaker ${speaker}:`, error);
//         sendStatusUpdate(`Error processing speaker ${speaker}`);
//       }
//     }
//   }

//   sendStatusUpdate(`All embeddings processed and saved`);
// };

// 12.20 - new approch to save embeddings to database process audio for each speaker concurrently
const processAndSaveEmbeddings = async (folderPath, sendStatusUpdate) => {
  sendStatusUpdate(`Starting the VM instance`);
  const externalIp = await startInstance(sendStatusUpdate);
  sendStatusUpdate(`VM started, now starting the Python server`);

  // Check if the server is ready
  let serverReady = false;
  while (!serverReady) {
    try {
      await axios.get(`http://${externalIp}:5000/`);
      serverReady = true;
    } catch (error) {
      // Wait for 1 second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  sendStatusUpdate(`Reviewing speaker audio.`);

  // Load the response.json file
  const responsePath = path.join(folderPath, "response.json");
  const response = JSON.parse(fs.readFileSync(responsePath, "utf8"));

  // Find all spoken segments for each speaker
  const speakers = {};
  response.results.channels[0].alternatives[0].paragraphs.paragraphs.forEach(
    (paragraph) => {
      const speaker = paragraph.speaker;

      if (!speakers[speaker]) {
        speakers[speaker] = [];
      }

      speakers[speaker].push({
        start: paragraph.start,
        end: paragraph.end,
        duration: paragraph.end - paragraph.start,
      });
    }
  );

  // Create an array to hold all the promises
  let promises = [];

  // Extract the audio segment for each speaker and send it to the /generate_embedding endpoint
  for (const speaker in speakers) {
    for (const segment of speakers[speaker]) {
      // Push each promise into the array
      promises.push(
        processSpeakerSegment(
          speaker,
          segment,
          folderPath,
          response,
          externalIp,
          sendStatusUpdate
        )
      );
    }
  }

  // Wait for all promises to resolve
  await Promise.all(promises);

  sendStatusUpdate(`All embeddings processed and saved`);

  // This function processes a speaker segment and returns a promise
  async function processSpeakerSegment(
    speaker,
    segment,
    folderPath,
    response,
    externalIp,
    sendStatusUpdate
  ) {
    const outputFilePath = path.join(
      folderPath,
      `speaker_${speaker}_${segment.start}.wav`
    );
    const { start, end } = segment;

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(path.join(folderPath, "audio.wav"))
          .setStartTime(start)
          .setDuration(end - start)
          .output(outputFilePath)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });

      const form = new FormData();
      form.append("audio_file", fs.createReadStream(outputFilePath));

      const embeddingResponse = await axios.post(
        `http://${externalIp}:5000/generate_embedding`,
        form,
        {
          headers: form.getHeaders(),
        }
      );

      const embedding = embeddingResponse.data.embedding;
      const speakerName =
        response.results.channels[0].alternatives[0].words.find(
          (w) => w.speaker.toString() === speaker
        ).speaker_name;

      await dbOperations.createEmbedding({
        speakerName: speakerName,
        embeddingVector: embedding,
        audioMetadata: { startTime: start, endTime: end },
        timestamp: new Date(),
      });

      if (fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath);
      }

      sendStatusUpdate(`Processed embedding for speaker: ${speakerName}`);
    } catch (error) {
      console.error(`Error processing speaker ${speaker}:`, error);
      sendStatusUpdate(`Error processing speaker ${speaker}`);
    }
  }
};

// Export both functions as named exports
module.exports = { getEmbedding, processAndSaveEmbeddings };
