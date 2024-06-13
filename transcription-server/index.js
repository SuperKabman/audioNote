const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const { exec } = require("child_process");
const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: "sk-proj-mwk4p3idrv3rzkJtElxFT3BlbkFJVjp4tnLPFWBuY5lj02qK",
});

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

const generateResponseNote = async (Transcription) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role:'system', content:'You are a summarizing tool for general audio-notes that a person might make at any time of their day. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio. And remember that you have to talk in a way that you are talking to the user, because that is who you interact with, that is who you help. You will always address the transcription as "the conversation".'},{ role: "user", content:Transcription }],
    });

    console.log("Generated response:", response.choices[0].message.content);
    return response.choices[0].message.content; 
  } catch (error) {
    console.error("Failed to generate response:", error);
    
  }
};

const generateTitle = async (Summary) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role:'system', content:"You are a title generating bot. Your prompts are summaries of lectures/audionotes/meetings/discussions etc. You have to give a title to those summaries (essentially the notes) in 4 words or less."},{ role: "user", content:Summary }],
    });

    console.log("Generated response:", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate response:", error);
  }
};

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    console.log("Uploaded file type:", fileType);

    // Check if the uploaded file is a WAV file (audio/vnd.wave)
    if (fileType === "audio/vnd.wave" || fileType === "audio/m4a") {
      const convertedFilePath = path.join(
        __dirname,
        "uploads",
        "converted.mp3"
      );
      console.log("Converted file path:", convertedFilePath);
      console.log("api key:", process.env.OPENAI_API_KEY);
      try {
        await convertToMP3(filePath, convertedFilePath);
      } catch (error) {
        console.error("Error converting file to MP3:", error.message);
        return res.status(500).send({ error: "Failed to convert file to MP3" });
      }

      // Use the converted MP3 file for transcription
      const formData = new FormData();
      formData.append("file", fs.createReadStream(convertedFilePath));
      formData.append("model", "whisper-1");
      formData.append("language", "en");
      formData.append("response_format", "verbose_json");

      const headers = {
        Authorization: `Bearer sk-proj-mwk4p3idrv3rzkJtElxFT3BlbkFJVjp4tnLPFWBuY5lj02qK`,
        ...formData.getHeaders(),
      };

      console.log("Headers:", headers);
      console.log("FormData:", formData);

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/audio/transcriptions",
          formData,
          { headers }
        );

        console.log("API response:", response.data);

        const transcription = response.data.text;
        // summary function

        let summary;
        try {
          summary = await generateResponseNote(transcription);
        } catch (error) {
          console.error("Error generating summary:", error);
          return res.status(500).send({ error: "Error generating summary" });
        }

        const wordTimeMapping = response.data.segments.map((segment) => {
          return {
            word: segment.text,
            startTime: segment.start,
            endTime: segment.end,
          };
        });

        let title;
        try {
          title = await generateTitle(summary);
        } catch (error) {
          console.error("Error generating title:", error);
          return res.status(500).send({ error: "Error generating title" });
        }

        res.send({ transcription: transcription, summary: summary, title:title, wordTimeMapping: wordTimeMapping});
      } catch (error) {
        console.error("Error making API request:", error);
        console.error("API response data:", error.response.data);
        res.status(500).send({ error: "Error transcribing audio" });
      }
      // Clean up: delete uploaded and converted files
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
    } else {
      // For other supported file types, proceed directly to transcription
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      const headers = {
        Authorization: `Bearer sk-proj-mwk4p3idrv3rzkJtElxFT3BlbkFJVjp4tnLPFWBuY5lj02qK`,
        ...formData.getHeaders(),
      };

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/audio/transcriptions",
          formData,
          { headers: headers }
        );

        console.log("API response:", response.data);

        const transcription = response.data.transcription;

        let summary;
        try {
          summary = await generateResponseNote(transcription);
        } catch (error) {
          console.error("Error generating summary:", error);
          return res.status(500).send({ error: "Error generating summary" });
        }

        res.send({ transcription: transcription, summary: summary });
      } catch (error) {
        console.error("Error making API request:", error);
        console.error("API response data:", error.response.data);
        res.status(500).send({ error: "Error transcribing audio" });
      }
      // Clean up: delete uploaded file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
  } catch (error) {
    console.error("Error during transcription:", error.message);
    res.status(500).send({ error: "Error during transcription" });
  }
});



async function convertToMP3(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    // Quote the file paths to handle spaces in the paths

    const command = `ffmpeg -i "${inputFile}" -vn -ar 44100 -ac 2 -b:a 192k "${outputFile}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error converting file:", error);
        console.error("FFmpeg stderr:", stderr);
        reject(
          new Error(
            "Failed to convert file. Please check the file format and try again."
          )
        );
      } else {
        console.log("File converted successfully");
        resolve();
      }
    });
  });
}

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


