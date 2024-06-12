const express = require("express");
const multer = require("multer");
const { SpeechClient } = require("@google-cloud/speech");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });
const speechClient = new SpeechClient();

app.use(cors());
app.use(express.json());

const transcriptionFilePath = path.join(
  __dirname,
  "./transcriptionFile(s)",
  "transcription.txt"
);

const wordTimeMappingFilePath = path.join(
  __dirname,
  "./transcriptionFile(s)",
  "word_time_mapping.json"
);

const openai = new OpenAI({
  apiKey: "",
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const transcription = await openai.audio.transcriptions.create({
      audio: fs.createReadStream(filePath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularity: ["word"],
    });

    console.log("Transcription:", transcription);
  } catch (error) {
    console.error("Error during transcription:", error);
    res.status(500).send("Error during transcription");
  }
});



app.post("/resetTranscriptionFile", (req, res) => {
  try {
    fs.writeFileSync(transcriptionFilePath, "");
    fs.writeFileSync(wordTimeMappingFilePath, "");
    res.send("Transcription file reset successfully");
  } catch (error) {
    console.error("Error resetting transcription file:", error);
    res.status(500).send("Error resetting transcription file.");
  }
});

app.get("/file", (req, res) => {
  res.sendFile(transcriptionFilePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(err.status).end();
    } else {
      console.log("File sent successfully.");
    }
  });
});

app.post("/find-sentence", (req, res) => {
  const { sentence } = req.body;
  if (!sentence) {
    return res.status(400).send("Sentence is required.");
  }

  try {
    const wordTimeMapping = JSON.parse(
      fs.readFileSync(wordTimeMappingFilePath)
    );
    const words = sentence.split(" ");

    let startTime = null;
    let endTime = null;
    let wordIndex = 0;

    for (let i = 0; i < wordTimeMapping.length; i++) {
      if (
        wordTimeMapping[i].word.toLowerCase() === words[wordIndex].toLowerCase()
      ) {
        if (wordIndex === 0) {
          startTime = wordTimeMapping[i].startTime;
        }
        if (wordIndex === words.length - 1) {
          endTime = wordTimeMapping[i].endTime;
          break;
        }
        wordIndex++;
      } else {
        wordIndex = 0;
        startTime = null;
      }
    }

    if (startTime !== null && endTime !== null) {
      res.json({ sentence: sentence, startTime: startTime, endTime: endTime });
    } else {
      res.status(404).send("Sentence not found in the transcription.");
    }
  } catch (error) {
    console.error("Error finding sentence:", error);
    res.status(500).send("Error finding sentence.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
