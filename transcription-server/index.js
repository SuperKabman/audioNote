const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios");
const FormData = require('form-data');
const cors = require("cors");
const { exec } = require("child_process");
const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });

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
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const convertedFilePath = path.join(__dirname, "uploads", "converted.mp3");

    // Convert WAV to MP3 using ffmpeg
    await convertToMP3(filePath, convertedFilePath);

    // Create form data for the OpenAI API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(convertedFilePath));
    formData.append("model", "whisper-1");
    formData.append("language", "en-US"); 
    formData.append("response_format", "verbose_json"); 
    formData.append("timestamp_granularity", ["word"]);  

    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...formData.getHeaders(),
    };

    // Make the request to the OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      { headers: headers }
    );

    // Delete the files after processing
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
    fs.unlink(convertedFilePath, (err) => {
      if (err) {
        console.error("Error deleting converted file:", err);
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error("Error during transcription:", error.response ? error.response.data : error.message);
    res.status(500).send({ error: "Error during transcription" });
  }
});

async function convertToMP3(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i ${inputFile} -vn -ar 44100 -ac 2 -b:a 192k ${outputFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error converting file:", error);
        reject(error);
      } else {
        console.log("File converted successfully");
        resolve();
      }
    });
  });
}

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
