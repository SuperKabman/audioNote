const express = require("express");
const multer = require("multer");
const { SpeechClient } = require("@google-cloud/speech");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
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

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const audio = {
      content: fs.readFileSync(filePath).toString("base64"),
    };

    const config = {
      model: "latest_short",
      encoding: req.file.mimetype === "audio/x-caf" ? "LINEAR16" : "MP3",
      sampleRateHertz: 44100,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      languageCode: "en-US",
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    const wordTimeMapping = [];
    response.results.forEach((result) => {
      result.alternatives[0].words.forEach((wordInfo) => {
        wordTimeMapping.push({
          word: wordInfo.word,
          startTime:
            wordInfo.startTime.seconds + wordInfo.startTime.nanos / 1e9,
          endTime: wordInfo.endTime.seconds + wordInfo.endTime.nanos / 1e9,
        });
      });
    });

    fs.appendFileSync(transcriptionFilePath, transcription + "\n");
    fs.writeFileSync(
      wordTimeMappingFilePath,
      JSON.stringify(wordTimeMapping, null, 2)
    );
    fs.unlinkSync(filePath);

    res.json({ transcription: transcription, wordTimeMapping: wordTimeMapping});
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

app.post('/find-sentence', (req, res) => {
  const { sentence } = req.body;
  if (!sentence) {
    return res.status(400).send("Sentence is required.");
  }

  try {
    const wordTimeMapping = JSON.parse(fs.readFileSync(wordTimeMappingFilePath));
    const words = sentence.split(" ");

    let startTime = null;
    let endTime = null;
    let wordIndex = 0;

    for (let i = 0; i < wordTimeMapping.length; i++) {
      if (wordTimeMapping[i].word.toLowerCase() === words[wordIndex].toLowerCase()) {
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
