const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Deepgram } = require("@deepgram/sdk");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const ffmpeg = require("fluent-ffmpeg");

const { exec } = require("child_process");
const { createEmbedding } = require("./database/dbOperations");

const pool = require("./database/dbConfig"); // Add this line at the top of your file

// Import the costDbOperations.js file for keeping track of costs
const {
  API_Clients,
  API_Usage_Requests,
  API_Costs,
  Process_Times,
} = require("./database/costDbOperations");

// Import the meetingsDbOperations.js file for keeping track of meetings
const {
  Client_Meetings,
  Speakers,
  Words,
} = require("./database/meetingsDbOperations");

// Import the shared Sequelize instance
const sequelize = require("./database/sequelize");

// import getEmbedding and ProcessAndSaveEmbeddings functions from getembeding.js
const { getEmbedding, processAndSaveEmbeddings } = require("./getembeding");
//import the startInstance function from startGoogleCompute.js
const { startInstance } = require("./startGoogleCompute.js");
// import the chatresponse from oai
const getAssistantResponse = require("./OAI-Assistant.js");

const FormData = require("form-data");

// Serve static files from the "public" directory to load meetings and return transctiprts for retrieving response.json
app.use(express.static(path.join(__dirname, "public")));

const apiKey = "";
const model = "gpt-3.5-turbo-1106"; //"gpt-3.5-turbo";

// Your Deepgram API Key
const deepgramApiKey = "";
// Initialize the Deepgram SDK
const deepgram = new Deepgram(deepgramApiKey);

//keep track of voice memos procesed to determine news one showed up
const processedFilesPath = path.join(
  __dirname,
  "/meetings/processedFiles.json"
);

//begin - attempt to push to client html/js when we detect new audio files from function watchForNewFiles()
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on("connection", (ws) => {
  let id = uuidv4(); // Generate a unique ID for this client
  clients[id] = ws; // Store the WebSocket instance in the clients object

  console.log(`Client connected with ID: ${id}`);
  console.log(`Number of clients connected: ${Object.keys(clients).length}`);

  ws.on("close", () => {
    delete clients[id]; // Remove the client from the clients object when it disconnects
    console.log(`Client disconnected with ID: ${id}`);
    console.log(`Number of clients connected: ${Object.keys(clients).length}`);
  });
});
//end - attempt to push to client html/js when we detect new audio files from function watchForNewFiles()

async function transcribeAudio(file) {
  // Check whether requested file is local or remote, and prepare accordingly
  let source;
  if (file.startsWith("http")) {
    // File is remote
    // Set the source
    source = {
      url: file,
    };
  } else {
    // File is local
    // Open the audio file
    const audio = fs.readFileSync(file);

    // Set the source
    source = {
      buffer: audio,
      mimetype: "audio/wav", // Replace with the correct mimetype for your audio files
    };
  }

  // Send the audio to Deepgram and get the response
  try {
    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      model: "nova-2-ea",
      language: "en-US",
      diarize: true,
      detect_topics: false,
    });

    // Get the directory of the file
    const dir = path.dirname(file);

    // Create the path to the JSON response file
    const jsonResponseFile = path.join(dir, "response.json");

    // Write the JSON response to a file
    fs.writeFileSync(jsonResponseFile, JSON.stringify(response, null, 2));

    // Return the transcription response
    return response;
  } catch (err) {
    console.log(err);
  }
}

function convertAudio(inputFile, outputFormat) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      path.dirname(inputFile),
      `audio.${outputFormat}`
    ); // Save the converted file as "audio.wav" or "audio.mp3"
    ffmpeg(inputFile)
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./meetings/" + new Date().toISOString().replace(/:/g, "-");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, "audio" + path.extname(file.originalname)); // Save the file as "audio" with the original extension
  },
});

const upload = multer({ storage: storage });

// Add route handler for /api/upload
app.post(
  "/api/upload",
  upload.single("audio"),
  async function (req, res, next) {
    // Convert the audio file to WAV format
    const wavFile = await convertAudio(req.file.path, "wav");

    // Convert the audio file to MP3 format
    const mp3File = await convertAudio(req.file.path, "mp3");

    // Transcribe the WAV file and wait for it to finish
    const transcriptionResponse = await transcribeAudio(wavFile);

    // Return the name of the meeting folder
    res.json({
      message: "File uploaded, converted and transcribed",
      meetingName: path.basename(req.file.path),
    });
  }
);

// LOAD MEETINGS onload
// Return list of meetings for the index.html sidebar
app.get("/api/meetings", async (req, res) => {
  try {
    let meetings = await Client_Meetings.findAll({
      include: [Speakers],
    });

    // Remove unnecessary properties
    meetings = meetings.map((meeting) => {
      const { transcript, ...meetingData } = meeting.dataValues;
      return meetingData;
    });

    // Sort the meetings by date
    meetings.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }

  // 12.28 - STOP using .json and use postgres db
  // // Load the processed files
  // let processedFiles = getProcessedFiles();

  // // Remove the transcript property from each file
  // processedFiles.forEach((file) => {
  //   delete file.transcript;
  // });

  // // Return the processed files
  // res.json(processedFiles);

  // 12/10 - This used the actual directoy folder structure and we are going to use the processedfiles.json - need more attributes and started with trying to sort meetings and audio by created date when directory was returning the date the audio was proceed not created
  // // Get the path to the meetings directory
  // const meetingsDirectory = path.join(__dirname, "meetings");
  // // Read the contents of the meetings directory
  // fs.readdir(meetingsDirectory, (err, items) => {
  //   if (err) {
  //     console.error("Could not list the directory.", err);
  //     res.status(500).send("An error occurred while fetching the meetings.");
  //     return;
  //   }
  //   // Check if each item is a directory and get its creation time
  //   const meetings = items.map((item) => {
  //     const itemPath = path.join(meetingsDirectory, item);
  //     const stat = fs.statSync(itemPath);
  //     return {
  //       id: item,
  //       name: item,
  //       isDirectory: stat.isDirectory(),
  //       created: stat.birthtime, // Add this line
  //     };
  //   });
  //   // Filter out files, keeping only directories
  //   const directories = meetings.filter((item) => item.isDirectory);
  //   // Sort the directories by creation time in descending order
  //   directories.sort((a, b) => b.created - a.created);
  //   // const processedFiles = getProcessedFiles(); // Function to get the processed files info
  //   // const directoriesWithNewInfo = directories.map((directory) => {
  //   //   const isDirectoryNew = processedFiles.some(
  //   //     (file) => file && file.name.includes(directory.name) && file.isNew
  //   //   );
  //   //   return { ...directory, isNew: isDirectoryNew };
  //   // });
  //   res.json(directories);
  // });
});

// retrieve the audio recordings on my local machine
const recordingsPath =
  "/Users/josephtaylor/Library/Application Support/com.apple.voicememos/Recordings";

app.get("/api/retrieveLocalAudioRecordings", async (req, res) => {
  // Add async here
  fs.readdir(recordingsPath, async (err, files) => {
    // Add async here
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the directory");
    }

    let sortedFiles = files
      .map((filename) => ({
        name: filename,
        time: fs.statSync(path.join(recordingsPath, filename)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time)
      .map((file) => file.name);

    res.json(sortedFiles);
  });
});

// Add route to retirieve duration of audio files
app.get("/api/getAudioDuration/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(recordingsPath, fileName);

  if (fs.existsSync(filePath) && fileName.endsWith(".m4a")) {
    try {
      const metadata = await musicMetadata.parseFile(filePath);

      // Convert the duration to hh:mm:ss format
      const durationInSeconds = Math.floor(metadata.format.duration);
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
      const seconds = durationInSeconds - hours * 3600 - minutes * 60;

      const formattedDuration =
        (hours < 10 ? "0" + hours : hours) +
        ":" +
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        (seconds < 10 ? "0" + seconds : seconds);

      res.json({ duration: formattedDuration });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error reading the audio file");
    }
  } else {
    res.status(404).send("File not found or not an .m4a file");
  }
});

app.post("/api/process-selected-audio", async (req, res) => {
  const filePath = path.join(recordingsPath, req.body.selectedFileName);

  // 12.27 - Commented out reference to processedfiles .json

  // // Reload processed files
  // let processedFilesArray;
  // const processedFilesPath = "meetings/processedFiles.json";
  // if (!fs.existsSync(processedFilesPath)) {
  //   fs.writeFileSync(processedFilesPath, JSON.stringify([]));
  //   processedFilesArray = [];
  // } else {
  //   processedFilesArray = JSON.parse(
  //     fs.readFileSync(processedFilesPath, "utf-8")
  //   );
  // }

  // if (
  //   fs.existsSync(filePath) &&
  //   !processedFilesArray.some((file) => file.name === req.body.selectedFileName)
  // ) {

  // Notify all connected clients immediately when a new file is detected
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        message: "Audio file selected!  Processing now...",
        filePath: req.body.selectedFileName,
      });
      client.send(message);
    }
  });
  await measureAndStoreTime(
    req.body.selectedFileName,
    "Total Process Time",
    () =>
      processFile(
        filePath,
        req.body.model,
        (transcriptMessage) => {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const message = JSON.stringify({
                message: transcriptMessage,
                filePath: filePath,
              });
              client.send(message);
            }
          });
        },
        (embeddingMessage) => {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const message = JSON.stringify({
                message: embeddingMessage,
                filePath: filePath,
              });
              client.send(message);
            }
          });
        }
      )
  );
  // } else {
  //   console.log("File already processed:", filePath); // Debug statement
  //   wss.clients.forEach((client) => {
  //     if (client.readyState === WebSocket.OPEN) {
  //       const message = JSON.stringify({
  //         message: "File already processed.",
  //         filePath: req.body.selectedFileName,
  //       });
  //       client.send(message);
  //     }
  //   });
  // }
});

// Get the list of files in a meeting directory for the correction.html sidebar
app.get("/api/meetings/:meetingId", (req, res) => {
  const meetingId = req.params.meetingId;
  const directoryPath = path.join(__dirname, "meetings", meetingId);

  fs.readdir(directoryPath, { withFileTypes: true }, (err, items) => {
    if (err) {
      console.error("Could not list the directory.", err);
      res
        .status(500)
        .send("An error occurred while fetching the directory contents.");
      return;
    }

    // Map the items to an array of file and directory objects with creation time
    const filesAndDirs = items.map((dirent) => {
      const itemPath = path.join(directoryPath, dirent.name);
      const stat = fs.statSync(itemPath);
      return {
        name: dirent.name,
        created: stat.birthtime,
        isDirectory: dirent.isDirectory(),
        path: itemPath,
      };
    });

    // Sort the items by creation time in descending order
    filesAndDirs.sort((a, b) => b.created - a.created);

    // For each directory, read its contents and sort them by creation time
    const sortedFilesAndDirs = filesAndDirs.map((item) => {
      if (item.isDirectory) {
        const dirContents = fs.readdirSync(item.path, { withFileTypes: true });
        const sortedDirContents = dirContents.map((dirent) => {
          const itemPath = path.join(item.path, dirent.name);
          const stat = fs.statSync(itemPath);
          return {
            name: dirent.name,
            created: stat.birthtime,
            isDirectory: dirent.isDirectory(),
          };
        });
        sortedDirContents.sort((a, b) => b.created - a.created);
        return { ...item, contents: sortedDirContents };
      } else {
        return item;
      }
    });

    // Send the sorted items as the response
    res.json(sortedFilesAndDirs);
  });
});

app.put("/api/meetings/:meetingId", (req, res) => {
  var meetingId = req.params.meetingId;
  var newMeetingTitle = req.body.newName;

  // Save the new meeting title
  // This depends on how you want to save it. For example, you could rename a directory:

  var oldPath = path.join(__dirname, "meetings", meetingId);
  var newPath = path.join(__dirname, "meetings", newMeetingTitle);

  fs.rename(oldPath, newPath, function (err) {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "An error occurred while renaming the meeting." });
    } else {
      res.json({ message: "Meeting renamed successfully" });
    }
  });

  // For now, just send a response to avoid the error
  //res.json({ message: "Meeting title received: " + newMeetingTitle });
});

// route to delete files or folders
app.delete("/api/files/:folder/:fileName?", async (req, res) => {
  const folder = req.params.folder;
  const fileName = req.params.fileName;
  // const clientMeetingId = req.body.clientMeetingId + ".m4a"; // Get the clientMeetingId from the request body
  const pathToDelete = path.join(__dirname, "meetings", folder, fileName || "");

  // Load processed files
  let processedFiles = JSON.parse(
    fs.readFileSync("meetings/processedFiles.json", "utf-8")
  );

  // Filter out the file to be deleted
  const updatedProcessedFiles = processedFiles.filter(
    (file) => file.directoryShort !== `meetings/${folder}`
  );

  // Write the updated list back to the file
  fs.writeFileSync(
    "meetings/processedFiles.json",
    JSON.stringify(updatedProcessedFiles, null, 2)
  );

  // Reload processed files
  processedFiles = JSON.parse(
    fs.readFileSync("meetings/processedFiles.json", "utf-8")
  );

  // Look up the clientMeetingId using the fileName
  let clientMeeting;
  try {
    clientMeeting = await Client_Meetings.findOne({
      where: { name: folder + ".m4a" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An error occurred while looking up the client meeting",
    });
  }

  if (!clientMeeting) {
    return res
      .status(404)
      .json({ message: "No client meeting found with the provided fileName" });
  }

  const clientMeetingId = clientMeeting.id;

  // Delete rows from the Words, Speakers, and Client_Meetings tables
  try {
    await Promise.all([
      Words.destroy({ where: { meeting_id: clientMeetingId } }),
      Speakers.destroy({ where: { meeting_id: clientMeetingId } }),
      Client_Meetings.update(
        { status: "deleted" },
        { where: { id: clientMeetingId } }
      ),
    ]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An error occurred while deleting the database entries",
    });
  }

  if (fileName) {
    // Delete file
    fs.unlink(pathToDelete, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the file" });
      }

      res.json({ message: "File successfully deleted" });
    });
  } else {
    // Delete folder
    fs.rm(pathToDelete, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the folder" });
      }

      res.json({ message: "Folder successfully deleted" });
    });
  }
});

app.get("/api/getSummary/:meetingId", (req, res) => {
  const meetingId = req.params.meetingId;
  const summaryFilePath = path.join(
    __dirname,
    "meetings",
    meetingId,
    "summary.md"
  );

  fs.readFile(summaryFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the summary file");
    }
    res.send(data);
  });
});

// modified 10/12 to use OAI Assisstnats
app.post("/summarize", async (req, res) => {
  const transcript = req.body.transcript;
  const model = req.body.model || "gpt-3.5-turbo-1106"; //"gpt-3.5-turbo"; // Default to GPT-3.5 if no model is provided
  const folderPath = path.join(__dirname, "meetings", req.body.meeting);

  try {
    const response = await getAssistantResponse(
      `The following is the output from a speach to text transcript of a meeting. I need to send out the meeting notes,
      Please provide: 
      1. 150 word Executive Summary
      2. Additional Details in outline format
      3. Any Decisions Made
      4. Any Action Items & Owners
      
      Transcript:  ${transcript}`,
      req.body.model
    );

    const summary = response.message;
    const topic = "No topic identified";
    const decision = "No decisions identified";
    const action = "No action items identified";

    // Create a new markdown file and write the summary to it
    const mdFilePath = path.join(folderPath, "summary.md");
    fs.writeFileSync(mdFilePath, summary);

    //12.25 - Log the cost to the cost table
    //need to find the client_meeting id
    // Look up the clientMeetingId using the fileName
    let clientMeeting;
    try {
      clientMeeting = await Client_Meetings.findOne({
        where: { name: req.body.meeting + ".m4a" },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An error occurred while looking up the client meeting",
      });
    }

    if (!clientMeeting) {
      return res.status(404).json({
        message: "No client meeting found with the provided fileName",
      });
    }
    const clientMeetingId = clientMeeting.id;

    console.log("clientMeetingId", clientMeetingId);

    // Create entries for prompt, completion, and total costs
    let costEntries = [];
    const costTypes = ["prompt", "completion", "total"];

    for (const costType of costTypes) {
      // Create a new entry in the API_Usage_Requests table
      const usageRequest = await API_Usage_Requests.create({
        client_id: 1, // assuming the client_id is 1
        meeting_id: clientMeetingId,
        api_type: "OpenAI",
        timestamp: new Date(),
        request_details: JSON.stringify({
          tokens: response.usage[`${costType}_tokens`],
          type: costType,
        }),
      });

      // Add the OpenAI cost entry to the costEntries array
      costEntries.push({
        usage_id: usageRequest.usage_id,
        cost_amount: response.usage[`${costType}_cost`],
        currency: "USD",
      });
    }

    // Insert all entries into the API_Costs table in a single operation
    await API_Costs.bulkCreate(costEntries);

    //Return all four responses
    res.json({ summary, topic, decision, action });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "An error occurred while processing the text" });
  }
});

app.use(express.json()); // for parsing application/json

app.post("/api/save", async function (req, res) {
  // Extract the data from the request body
  const { summary, transcript, meetingId } = req.body;

  // Convert the data to a string
  const dataString = JSON.stringify({ summary, transcript });

  // Specify the path to the file
  const filePath = `./meetings/${meetingId}/data.json`;

  // Write the data to a file
  fs.writeFile(filePath, dataString, async (err) => {
    // Notice the 'async' keyword here
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while saving the data." });
    } else {
      // Data saved successfully, now generate embeddings
      console.time("generateEmbeddings");
      try {
        const folderPath = `./meetings/${meetingId}`;

        // Convert the mp3 audio  file to WAV format
        const wavFile = await convertAudio(
          path.join(folderPath, "audio.mp3"),
          "wav"
        );

        statusUpdates[folderPath] = "Starting...";
        await getEmbedding(folderPath, (status) => {
          statusUpdates[folderPath] = status;
        });
        console.timeEnd("generateEmbeddings");

        // Delete the .wav file to save on space
        if (fs.existsSync(wavFile)) {
          fs.unlinkSync(wavFile);
        }

        res.json({
          message: "Data saved and embeddings generation initiated.",
        });
      } catch (embeddingError) {
        console.error("Error generating embeddings:", embeddingError);
        res.status(500).json({ message: "Failed to generate embeddings." });
      }
    }
  });
});

function splitAudio(inputFile, startTime, duration, outputFile) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputFile).setStartTime(startTime).output(outputFile);

    if (duration !== null && !isNaN(duration)) {
      command = command.duration(duration);
    }

    command.on("end", resolve).on("error", reject).run();
  });
}

let chunksProcessed = 0; // Add this line at the top of your file

//used to troubled shoot errors in terminal for chunking
const computeDuration = (startTS, endTS) => {
  const [startH, startM, startS] = startTS.split(":").map(Number);
  const [endH, endM, endS] = endTS.split(":").map(Number);

  const startInSeconds = startH * 3600 + startM * 60 + startS;
  const endInSeconds = endH * 3600 + endM * 60 + endS;

  return endInSeconds - startInSeconds;
};

//trying to get the status back to the client html doesnt send status but works still for the embedding
let statusUpdates = {};

// 12.27 - REMOVE since I this is using processedfiles .json and I cant find any other code using this route.
// I think this was for when the predicted speakers was not done in the processfiles function
// app.post("/api/generateEmbeddingsWithoutSaving", async function (req, res) {
//   const meetingId = req.body.meetingId;
//   const folderPath = "meetings/" + meetingId;

//   // Load processed files
//   const processedFiles = JSON.parse(
//     fs.readFileSync("meetings/processedFiles.json", "utf-8")
//   );

//   // Check if the meeting has already been processed
//   const processedFile = processedFiles.find(
//     (file) => file.directoryShort === folderPath
//   );

//   if (processedFile) {
//     // If the meeting has been processed, return the saved speaker data
//     res.send(processedFile.speakers);
//   } else {
//     // If the meeting has not been processed, proceed with generating the embeddings
//     statusUpdates[folderPath] = "Starting...";

//     // Convert the audio file to WAV format
//     const wavFile = await convertAudio(
//       path.join(folderPath, "audio.mp3"),
//       "wav"
//     );

//     const response = await getEmbedding(
//       folderPath,
//       (status) => {
//         statusUpdates[folderPath] = status;
//       },
//       false
//     );

//     // Delete the .wav file
//     if (fs.existsSync(wavFile)) {
//       fs.unlinkSync(wavFile);
//     }

//     res.send(response);
//   }
// });

app.get("/status/:folderPath", (req, res) => {
  const folderPath = req.params.folderPath;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send the current status update
  res.write(`data: ${statusUpdates[folderPath]}\n\n`);
});

//handle updating the response.json file with names for the speakers
app.post("/api/update-speaker-names", (req, res) => {
  const { updatedNames, meetingId } = req.body;
  console.log("req.body", req.body);

  console.log(
    "Received request to update speaker names:",
    updatedNames,
    "for meetingId:",
    meetingId
  ); // Debug statement

  const responseFilePath = path.join(
    __dirname,
    "meetings",
    meetingId,
    "response.json"
  );

  fs.readFile(responseFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading response.json:", err);
      return res.status(500).send("Error reading response.json");
    }
    let jsonResponse = JSON.parse(data);

    jsonResponse.results.channels[0].alternatives[0].words.forEach((word) => {
      if (updatedNames.hasOwnProperty(`SPEAKER ${word.speaker}`)) {
        word.speaker_name = updatedNames[`SPEAKER ${word.speaker}`];
      }
    });

    fs.writeFile(
      responseFilePath,
      JSON.stringify(jsonResponse, null, 2),
      async (err) => {
        if (err) {
          console.error("Error writing updated response.json:", err);
          return res.status(500).send("Error updating response.json");
        }
        // After updating response.json, call the processAndSaveEmbeddings function
        try {
          const folderPath = path.join(__dirname, "meetings", meetingId);

          // Convert the audio file to WAV format
          const wavFile = await convertAudio(
            path.join(folderPath, "audio.mp3"),
            "wav"
          );

          console.log(
            "Converted audio file to WAV format:",
            path.join(folderPath, "audio.mp3")
          ); // Debug statement

          await processAndSaveEmbeddings(folderPath, (status) => {
            sendStatusUpdate(status); // will send message to client via websocket
          });

          // Delete the .wav file
          if (fs.existsSync(wavFile)) {
            fs.unlinkSync(wavFile);
          }

          console.log("deleted .wav file"); // Debug statement

          res.send(
            "response.json updated and embeddings processed successfully"
          );
        } catch (error) {
          console.error("Error processing embeddings:", error);
          res.status(500).send("Error processing embeddings");
        }
      }
    );
  });
});

//begin - create function to auto process new audio files in voice memos folder as they are added
// Function to get list of processed files
const musicMetadata = require("music-metadata");

// Initialize processed files array
let processedFilesArray = getProcessedFiles();

//endpoint for the client to UPDATE attributes like change isNew to false
app.put("/api/updateFile", (req, res) => {
  // Extract the file name, attribute name, and new value from the request body
  const { fileName, attributeName, newValue } = req.body;
  // Find the file to update
  let fileToUpdate = processedFilesArray.find((file) => file.name === fileName);
  // If the file is not found, return an error
  if (!fileToUpdate) {
    return res.status(404).json({ message: "File not found." });
  }
  // Update the attribute
  fileToUpdate[attributeName] = newValue;
  // Save the updated processed files
  saveProcessedFiles();

  // Return a success message
  res.json({ message: "File updated successfully." });
});

//endpoint for the client to RETRIEVE attributes from the processedFiles.json like change isNew to false
app.get("/api/file/:fileName", (req, res) => {
  // Extract the file name from the request parameters
  const { fileName } = req.params;
  // Load the processed files
  let processedFiles = getProcessedFiles();
  // Find the file
  let file = processedFiles.find((file) => file.name === fileName);
  // If the file is not found, return an error
  if (!file) {
    return res.status(404).json({ message: "File not found." });
  }
  // Return the file attributes
  res.json(file);
});

// Function to convert seconds to hh:mm:ss
function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? (h < 10 ? "0" : "") + h + ":" : "00:";
  var mDisplay = m > 0 ? (m < 10 ? "0" : "") + m + ":" : "00:";
  var sDisplay = s > 0 ? (s < 10 ? "0" : "") + s : "00";
  return hDisplay + mDisplay + sDisplay;
}

// Function to get file attributes
async function getFileAttributes(filePath) {
  const stats = fs.statSync(filePath);
  const metadata = await musicMetadata.parseFile(filePath);

  // Convert ISO string to date object
  let creationDate = new Date(stats.birthtime);

  // Format date to "ddd, mm/dd/yy @ HH:MM PM"
  let formattedDate = creationDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
  let formattedTime = creationDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  formattedDate = `${formattedDate} @ ${formattedTime}`;

  return {
    name: path.basename(filePath),
    size: stats.size,
    creationDate: formattedDate,
    birthTime: stats.birthtime.toISOString(),
    modificationDate: stats.mtime.toISOString(),
    duration: secondsToHms(metadata.format.duration), // Convert duration to hh:mm:ss
    sampleRate: metadata.format.sampleRate,
    bitRate: metadata.format.bitrate,
    channels: metadata.format.numberOfChannels,
    isNew: true,
    title: "",
    // ... other attributes you find useful ...
  };
}

// Function to get list of processed files
function getProcessedFiles() {
  if (fs.existsSync(processedFilesPath)) {
    return JSON.parse(fs.readFileSync(processedFilesPath, "utf-8"));
  }
  return [];
}

// Function to save processed files
function saveProcessedFiles() {
  fs.writeFileSync(
    processedFilesPath,
    JSON.stringify(processedFilesArray, null, 2)
  );
}

// Helper function to measure and store the time taken for a subtask
async function measureAndStoreTime(filePath, subtask, task, transaction) {
  const startTime = Date.now();
  let result;

  try {
    result = await task();
  } catch (error) {
    console.error(`Error executing task '${subtask}':`, error);
    return;
  }

  const endTime = Date.now();
  const processTime = (endTime - startTime) / 1000; // Convert to seconds

  try {
    const createResult = await Process_Times.create(
      {
        file_path: filePath,
        subtask: subtask,
        process_time: processTime,
      },
      { transaction }
    ); // Include the transaction object here
  } catch (error) {
    console.error(`Error storing time for '${subtask}':`, error);
    throw error; // Rethrow the error to handle it in the caller function
  }

  return result;
}

// Modify the processFile function to accept a second callback function
async function processFile(
  filePath,
  model,
  transcriptCallback,
  embeddingCallback
) {
  // Start the timer
  console.log("\nProcessing file:", filePath);
  console.log("\nUsing:", model);

  // Declare costEntries as an empty array
  const costEntries = [];

  // 0. Check if the client exits in the table
  // Assuming you have the client_id and client_name
  let clientId = 1;
  let clientName = "Joe Taylor";

  // Check if the client already exists
  let client = await API_Clients.findOne({ where: { client_id: clientId } });

  // If the client doesn't exist, create it
  if (!client) {
    client = await API_Clients.create({
      client_id: clientId,
      client_name: clientName,
      // Add other details as necessary
    });
  }

  const fileAttributes = await getFileAttributes(filePath);

  // 1. Create a new directory
  let newDir = path.join(
    __dirname,
    "meetings",
    path.basename(filePath, ".m4a")
  );
  fs.mkdirSync(newDir, { recursive: true });

  // Populate the meetings table with a new meeting
  const meeting = await Client_Meetings.create({
    name: fileAttributes.name,
    size: fileAttributes.size,
    creationDate: fileAttributes.creationDate,
    birthTime: new Date(fileAttributes.birthTime),
    modificationDate: new Date(fileAttributes.modificationDate),
    duration: fileAttributes.duration,
    sampleRate: fileAttributes.sampleRate,
    bitRate: fileAttributes.bitRate,
    channels: fileAttributes.channels,
    isNew: fileAttributes.isNew,
    title: fileAttributes.title,
    directoryLong: newDir,
    directoryShort: path.relative(__dirname, newDir),
    client_id: 1,
  });

  // 2. Move the audio.m4a to the directory
  const newFilePath = path.join(newDir, "audio.m4a");
  fs.copyFileSync(filePath, newFilePath);

  // 3. Convert the audio to WAV and MP3
  // const [wavFile, mp3File] = await Promise.all([
  //   measureAndStoreTime(fileAttributes.name, "Convert Audio to WAV", () =>
  //     convertAudio(newFilePath, "wav")
  //   ),
  //   measureAndStoreTime(fileAttributes.name, "Convert Audio to MP3", () =>
  //     convertAudio(newFilePath, "mp3")
  //   ),
  // ]);

  // 3. Convert the audio to WAV and MP3
  // const mp3File = convertAudio(newFilePath, "mp3");
  const mp3File = measureAndStoreTime(
    fileAttributes.name,
    "Convert Audio to MP3",
    () => convertAudio(newFilePath, "mp3")
  );

  // const wavFile = await measureAndStoreTime(
  //   fileAttributes.name,
  //   "Convert Audio to WAV",
  //   () => convertAudio(newFilePath, "wav")
  // );

  // 4. Start VM and Transcribe and convert audio to WAV
  const [externalIp, transcriptionResponse, wavFile] = await Promise.all([
    measureAndStoreTime(fileAttributes.name, "Start VM", () =>
      startInstance(sendStatusUpdate)
    ),
    measureAndStoreTime(fileAttributes.name, "Transcribe Audio", () =>
      transcribeAudio(newFilePath)
    ),
    measureAndStoreTime(fileAttributes.name, "Convert Audio to WAV", () =>
      convertAudio(newFilePath, "wav")
    ),
  ]);

  const transcript =
    transcriptionResponse.results.channels[0].alternatives[0].transcript;

  // Save the WORD transcript data to the Words table
  // Loop over the alternatives array
  transcriptionResponse.results.channels[0].alternatives.forEach(
    (alternative) => {
      // Loop over the words array
      alternative.words.forEach((word) => {
        // Define the word data
        const wordData = {
          meeting_id: meeting.id, // Replace with the actual meeting ID
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence,
          speaker: word.speaker,
          speaker_confidence: word.speaker_confidence,
          punctuated_word: word.punctuated_word,
          speaker_name: word.speaker_name,
        };

        // Add the word to the Words table
        Words.create(wordData)
          .then(() => {
            //success
          })
          .catch((error) => {
            console.error("Error adding word:", error);
          });
      });
    }
  );

  // Call the transcriptCallback function after the transcription is ready
  if (transcriptCallback) {
    transcriptCallback(`Transcript ready!`);
  }

  // 6. Propose Meeting Title
  // 12.27 - Only use the first 1000 char of the transcript for the title.
  // save on tokens and also the title is usually in the beginning of the meeting
  const meetingTitlePromise = measureAndStoreTime(
    fileAttributes.name,
    "Propose Meeting Title",
    () =>
      getAssistantResponse(
        `"${transcript.substring(
          0,
          1000
        )}" The preceeding text is a transcript from a meeting.  
        Please provide a title for the meeting using no more than 5 words`,
        "gpt-3.5-turbo-1106"
      )
  );

  let sanitizedMeetingTitle = "";
  meetingTitlePromise.then(async (meetingTitleResponse) => {
    // Ensure the response does not contain any special characters especially quotations like "
    if (meetingTitleResponse.message) {
      sanitizedMeetingTitle = meetingTitleResponse.message.replace(
        /[^a-zA-Z0-9 ]/g,
        ""
      );
    }

    console.log("1 sanitizedMeetingTitle", sanitizedMeetingTitle); // Debug statement

    // Update the title of the meeting
    meeting.update({ title: sanitizedMeetingTitle });

    // Log the cost
    if (meetingTitleResponse && meetingTitleResponse.usage) {
      const costTypes = ["prompt", "completion", "total"];

      for (const costType of costTypes) {
        const usageRequest = await API_Usage_Requests.create({
          client_id: 1, // assuming the client_id is 1
          meeting_id: meeting.id,
          api_type: "OpenAI",
          timestamp: new Date(),
          request_details: JSON.stringify({
            tokens: meetingTitleResponse.usage[`${costType}_tokens`],
            type: costType,
          }),
        });

        costEntries.push({
          usage_id: usageRequest.usage_id,
          cost_amount: meetingTitleResponse.usage[`${costType}_cost`],
          currency: "USD",
        });
      }

      await API_Costs.bulkCreate(costEntries);
    }
  });

  // 7. Get speaker names
  const relativeDir = path.relative(__dirname, newDir);
  const predictedSpeakerNames = await measureAndStoreTime(
    fileAttributes.name,
    "Get Embedding",
    () =>
      getEmbedding(
        relativeDir,
        (status) => {
          statusUpdates[newDir] = status;
          sendStatusUpdate(status);
        },
        false
      )
  );

  // Call the embeddingCallback function after the getEmbedding function is done
  if (embeddingCallback) {
    embeddingCallback(`Predicted speakers ready!`);
  }

  // Add predicted speakers to the speakers table

  // Group words by speaker
  const wordsBySpeaker =
    transcriptionResponse.results.channels[0].alternatives[0].words.reduce(
      (groups, word) => {
        if (!groups[word.speaker]) {
          groups[word.speaker] = [];
        }
        groups[word.speaker].push(word);
        return groups;
      },
      {}
    );

  for (const speaker of predictedSpeakerNames) {
    // Find the longest part of the transcript for this speaker
    const words = wordsBySpeaker[speaker.speaker];
    let longestPart = "";
    let longestPartStartTime = null;
    if (words) {
      words.sort((a, b) => a.start - b.start);
      let currentPart = "";
      let currentPartStartTime = words[0].start;
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i].end === words[i + 1].start) {
          currentPart += ` ${words[i].word}`;
        } else {
          if (currentPart.length > longestPart.length) {
            longestPart = currentPart;
            longestPartStartTime = currentPartStartTime;
          }
          currentPart = words[i + 1].word;
          currentPartStartTime = words[i + 1].start;
        }
      }
      if (currentPart.length > longestPart.length) {
        longestPart = currentPart;
        longestPartStartTime = currentPartStartTime;
      }
    }

    await Speakers.create({
      meeting_id: meeting.id,
      speaker: speaker.speaker,
      bestMatch: speaker.bestMatch,
      highestSimilarity: speaker.highestSimilarity,
      longestparttranscript: longestPart,
      longestpartstarttime: longestPartStartTime,
    });
  }
  // 9. Retrieve Meeting Summary Response from LLM
  // Create a mapping of speaker IDs to their best match names
  const speakerMap = predictedSpeakerNames.reduce((map, speaker) => {
    map[speaker.speaker] = speaker.bestMatch;
    return map;
  }, {});
  // Format the transcript
  let currentSpeaker = null;
  let formattedTranscript = "";
  transcriptionResponse.results.channels[0].alternatives[0].words.forEach(
    (word) => {
      const speakerName = speakerMap[word.speaker];
      if (speakerName !== currentSpeaker) {
        // Speaker has changed
        currentSpeaker = speakerName;
        formattedTranscript += `\n${speakerName}: `;
      }
      formattedTranscript += `${word.punctuated_word} `;
    }
  );

  // 12.30 use model from the client request
  //Set a model
  // model = "gpt-3.5-turbo-1106"; //"gpt-3.5-turbo"; // Default to GPT-3.5 if no model is provided

  const response = await measureAndStoreTime(
    fileAttributes.name,
    "Retrieve Meeting Summary",
    () =>
      getAssistantResponse(
        `The following is the output from a speech to text transcript of a meeting. I need to send out the meeting notes,
        Please provide: 
        1. 150 word Executive Summary
        2. Additional Details in outline format
        3. Any Decisions Made
        4. Any Action Items & Owners
        
        Transcript:  ${formattedTranscript}`,
        model
      )
  );

  // Create a new markdown file and write the summary to it
  // Note sometimes the transcript is too many tokens so we need to fix this, for now writing an error to the md file
  const mdFilePath = path.join(relativeDir, "summary.md");
  if (response && response.message) {
    fs.writeFileSync(mdFilePath, response.message);
  } else {
    fs.writeFileSync(
      mdFilePath,
      "Error: Issue creating the summary from the OpenAI response."
    );
  }

  // 10. Calculate costs and publish to table
  // let costEntries = [];

  // 10.1 deepgram costs = Nova-2 is $0.0043/min of audio
  // Split the duration into hours, minutes, and seconds
  const [hours, minutes, seconds] = fileAttributes.duration
    .split(":")
    .map(Number);

  // Convert the duration to minutes
  const durationInMinutes = hours * 60 + minutes + seconds / 60;

  // Calculate the cost
  const costPerMinute = 0.0043;
  const totalCost = costPerMinute * durationInMinutes;

  // Insert a new entry into the API_Usage_Requests table
  const usageRequestDeepgram = await API_Usage_Requests.create({
    client_id: 1, // assuming the client_id is 1
    meeting_id: meeting.id,
    api_type: "Deepgram",
    timestamp: new Date(),
    request_details: JSON.stringify({
      audio_duration: durationInMinutes,
    }),
  });

  // Add the Deepgram cost entry to the costEntries array
  costEntries.push({
    usage_id: usageRequestDeepgram.usage_id,
    cost_amount: totalCost,
    currency: "USD",
  });

  // 10.2 google compute for gpu for speaker predictions
  // Insert a new entry into the API_Usage_Requests table
  const usageRequestGoogleCompute = await API_Usage_Requests.create({
    client_id: 1, // assuming the client_id is 1
    meeting_id: meeting.id,
    api_type: "Google Compute",
    timestamp: new Date(),
    request_details: JSON.stringify({
      requested_time: 15, // 15 minutes
    }),
  });

  // Define the hourly rate
  const hourlyRate = 0.15;

  // Convert the hourly rate to a per-minute rate
  const perMinuteRate = hourlyRate / 60;

  // Retrieve the request_details
  const requestDetails = JSON.parse(usageRequestGoogleCompute.request_details);

  // Retrieve the requested_time
  const requestedTime = requestDetails.requested_time;

  // Calculate the cost
  const costAmount = perMinuteRate * requestedTime;

  // Add the Google Compute cost entry to the costEntries array
  costEntries.push({
    usage_id: usageRequestGoogleCompute.usage_id,
    cost_amount: costAmount,
    currency: "USD",
  });

  // 10.3 openai costs for title and summary.md
  // 12.27 - Skip if there is no response - typically from an uncaught error
  if (response && response.message) {
    // Create entries for prompt, completion, and total costs
    const costTypes = ["prompt", "completion", "total"];

    for (const costType of costTypes) {
      // Create a new entry in the API_Usage_Requests table
      const usageRequest = await API_Usage_Requests.create({
        client_id: 1, // assuming the client_id is 1
        meeting_id: meeting.id,
        api_type: "OpenAI",
        timestamp: new Date(),
        request_details: JSON.stringify({
          tokens: response.usage[`${costType}_tokens`],
          type: costType,
        }),
      });

      // Add the OpenAI cost entry to the costEntries array
      costEntries.push({
        usage_id: usageRequest.usage_id,
        cost_amount: response.usage[`${costType}_cost`],
        currency: "USD",
      });
    }

    // Insert all entries into the API_Costs table in a single operation
    await API_Costs.bulkCreate(costEntries);
  }

  // 5. Delete the .m4a and .wav files
  if (fs.existsSync(newFilePath)) {
    fs.unlinkSync(newFilePath);
  }
  if (fs.existsSync(wavFile)) {
    fs.unlinkSync(wavFile);
  }

  console.log("2 meeting title:" + sanitizedMeetingTitle);
  // Add the newDir and predictedSpeakerNames to the fileAttributes
  fileAttributes.directoryLong = newDir;
  fileAttributes.directoryShort = relativeDir;
  fileAttributes.title = sanitizedMeetingTitle; // <-- use sanitized title without quotes
  fileAttributes.speakers = predictedSpeakerNames;
  fileAttributes.meetingID = meeting.id;
  // fileAttributes.transcript = transcriptionResponse;  <-- don't need to save transcript since we have the words db

  // 8. Save file attributes and transcription response
  processedFilesArray.push(fileAttributes);
  saveProcessedFiles();

  console.log("meetingId: " + meeting.id);
  // Notify all connected clients that a new meeting has been processed
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        message: "Done! New meeting processed.",
        meeting: fileAttributes, // Send the new meeting data to the client via attributes json
      });
      client.send(message);
    }
  });
}

// Function to process new files at startup
async function processNewFiles() {
  const allFiles = fs.readdirSync(recordingsPath);

  const newM4aFiles = allFiles
    .filter(
      (file) =>
        path.extname(file).toLowerCase() === ".m4a" &&
        !processedFilesArray.some((f) => f.name === file)
    )
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(recordingsPath, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)
    .map((file) => file.name)
    .slice(0, 0); // Process up to 2 most recent files

  for (const file of newM4aFiles) {
    const filePath = path.join(recordingsPath, file);
    await processFile(filePath);
  }
}

function watchForNewFiles() {
  fs.watch(recordingsPath, async (eventType, filename) => {
    if (eventType === "rename") {
      const filePath = path.join(recordingsPath, filename);

      // Check if the file is new and not already processed
      if (
        fs.existsSync(filePath) &&
        !processedFilesArray.some((file) => file.name === filename)
      ) {
        // Notify all connected clients immediately when a new file is detected
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
              message: "New file detected!",
              filePath: filename,
            });
            client.send(message);
          }
        });

        // Then process the file and notify clients when the transcription and embedding are ready
        await processFile(
          filePath,
          (transcriptMessage) => {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                  message: transcriptMessage,
                  filePath: filename,
                });
                client.send(message);
              }
            });
          },
          (embeddingMessage) => {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                  message: embeddingMessage,
                  filePath: filename,
                });
                client.send(message);
              }
            });
          }
        );
      } else {
        // Notification that the file is already processed - not sure we need this onload really, but i did add it for the audio selection fuction
        // console.log("File already processed:", filePath); // Debug statement
        // wss.clients.forEach((client) => {
        //   if (client.readyState === WebSocket.OPEN) {
        //     const message = JSON.stringify({
        //       message: "File already processed.",
        //       filePath: filename,
        //     });
        //     client.send(message);
        //   }
        // });
      }
    }
  });
}

// Function to send status updates to all connected clients
function sendStatusUpdate(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const messageObj = JSON.stringify({
        message: message,
      });
      client.send(messageObj);
    }
  });
}

// Start processing and watching for new files
processNewFiles();
watchForNewFiles();
//end - create function to auto process new audio files in voice memos folder as they are added

// 12.23 Rout to retrieve meeting transcript
app.get("/api/meetings/:meetingId/words", async (req, res) => {
  console.log("Received request for meeting transcript"); // Debug statement
  try {
    const meetingId = req.params.meetingId;
    const words = await Words.findAll({
      where: { meeting_id: meetingId },
      order: [["start", "ASC"]], // Assuming you want to order by the start time
    });
    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).send("Error fetching words from the database");
  }
});

// 12.21 Route to retrieve meeting speakers
app.get("/api/meeting-speakers/:meetingId", async (req, res) => {
  const meetingId = parseInt(req.params.meetingId); // Convert meetingId to integer

  console.log("Meeting ID: ", meetingId); // Debug statement

  try {
    const speakers = await Speakers.findAll({
      where: { meeting_id: meetingId },
    });

    if (!speakers || speakers.length === 0) {
      console.log(`No speakers found for meeting ID: ${meetingId}`);
      return res.status(404).json({
        error: `No speakers found for meeting ID: ${meetingId}`,
      });
    }

    const detailedSpeakers = speakers.map((speaker) => {
      return {
        speaker: speaker.dataValues.speaker,
        bestMatch: speaker.dataValues.bestMatch,
        highestSimilarity: parseFloat(
          speaker.dataValues.highestSimilarity.toFixed(2)
        ),
        longestparttranscript: speaker.dataValues.longestparttranscript,
        longestpartstarttime: speaker.dataValues.longestpartstarttime,
      };
    });

    res.json(detailedSpeakers);
  } catch (error) {
    console.error("Error occurred: ", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the speakers." });
  }
});

// Start Cost Routes
app.get("/api/meeting-cost/:meetingId", async (req, res) => {
  const { meetingId } = req.params;

  try {
    const usageRequests = await API_Usage_Requests.findAll({
      where: { meeting_id: meetingId },
      include: API_Costs,
    });

    //console.log("Usage requests: ", usageRequests); // Log the retrieved usage requests

    if (!usageRequests || usageRequests.length === 0) {
      console.log(`No usage requests found for meeting ID: ${meetingId}`);
      return res.status(404).json({
        error: `No usage requests found for meeting ID: ${meetingId}`,
      });
    }

    const detailedCosts = usageRequests
      .map((request) => {
        // Check if API_Cost exists before trying to access its cost_amount property
        if (
          request.dataValues.API_Costs &&
          request.dataValues.API_Costs.length > 0
        ) {
          return {
            usage_id: request.dataValues.usage_id,
            api_type: request.dataValues.api_type,
            request_details: request.dataValues.request_details,
            cost_id: request.dataValues.API_Costs[0].dataValues.cost_id,
            cost_amount: request.dataValues.API_Costs[0].dataValues.cost_amount,
          };
        } else {
          return null;
        }
      })
      .filter((item) => item !== null); // Filter out any null items

    res.json(detailedCosts);
  } catch (error) {
    console.error("Error occurred: ", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the cost." });
  }
});

// route to requests values from tables
app.get("/api/get-field", async (req, res) => {
  const { tableName, searchField, searchValue, returnField } = req.query;

  // Check if the model exists
  if (!sequelize.models[tableName]) {
    return res.status(400).json({
      error: `Model for ${tableName} not found.`,
    });
  }

  try {
    // Get the model for the specified table
    const Model = sequelize.models[tableName];

    // Find the record that matches the search field and value
    const record = await Model.findOne({
      where: { [searchField]: searchValue },
    });

    // If no record is found, return an error
    if (!record) {
      return res.status(404).json({
        error: `No record found for ${searchField} = ${searchValue} in ${tableName}`,
      });
    }

    // Return the value of the specified return field
    res.json({ [returnField]: record[returnField] });
  } catch (error) {
    console.error("Error occurred: ", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the field." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
