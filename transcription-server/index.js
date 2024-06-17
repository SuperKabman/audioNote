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
const { log } = require("@grpc/grpc-js/build/src/logging");
const openai = new OpenAI({
  apiKey: "sk-proj-mwk4p3idrv3rzkJtElxFT3BlbkFJVjp4tnLPFWBuY5lj02qK",
});

app.use(cors());
app.use(express.json());

let conversationParameter = "";

let summaryLength = "";

let customUserPrompt = "";

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
      messages: [
        {
          role: "system",
          content:
            conversationParameter +
            "\n\n" +
            summaryLength +
            "\n\n" +
            customUserPrompt,
        },
        { role: "user", content: Transcription },
      ],
    });
    console.log(
      "message:",
      conversationParameter + summaryLength + customUserPrompt
    );
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
      messages: [
        {
          role: "system",
          content:
            "You are a title generating bot. Your prompts are summaries of lectures/audionotes/meetings/discussions etc. You have to give a title to those summaries (essentially the notes) in 4 words or less. Only return the title as your response, nothing else, do not use quotations to return the title.",
        },
        { role: "user", content: Summary },
      ],
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
    const settings = JSON.parse(req.body.settings);
    const language = settings.language;
    const conversationType = settings.conversationType;
    const translation = settings.translation;
    const summarySize = settings.summarySize;
    const customSummaryPrompt = settings.customSummaryPrompt;
    customUserPrompt = customSummaryPrompt;
    console.log("settings in backend:", settings);
    console.log("Uploaded file type:", fileType);

    var lang = "";

    if (language === "English") {
      lang = "en";
    } else if (language === "Spanish") {
      lang = "es";
    } else if (language === "French") {
      lang = "fr";
    } else if (language === "Hindi") {
      lang = "hi";
    } else if (language === "German") {
      lang = "de";
    }

    if (conversationType === "Notes") {
      conversationParameter =
        'You are a summarizing tool for general audio-notes that a person might make at any time of their day. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio. And remember that you have to talk in a way that you are talking to the user, because that is who you interact with, that is who you help. You will always address the transcription as "the conversation". If you ever get a very short audionote, ask the user to make a longer audionote, or say that the information was not enough to make an evaluate the audio. If you recieve a blank audionote, say that "the audio was empty" and ask the user to try again.';
    } else if (conversationType === "Lectures") {
      conversationParameter =
        'You are a summarizing tool for university lectures that a person might record for any class/subject/course or level of study. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio.And remember that you have to talk in a way that you are talking to the user, because that is who you interact with, that is who you help. You will always address the transcription as "the lecture”.If you ever get a very short audionote, ask the user to make a longer audionote, or say that the information was not enough to make an evaluate the audio. If you recieve a blank audionote, say that "the audio was empty" and ask the user to try again.';
    } else if (conversationType === "Discussions") {
      conversationParameter =
        'You are a summarizing tool for general discussions about anything that a person might have with anyone at any one or multiple people. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio. And remember that you have to talk in a way that you are talking to the user, because that is who you interact with, that is who you help. You will always address the transcription as "the discussion”.If you ever get a very short audionote, ask the user to make a longer audionote, or say that the information was not enough to make an evaluate the audio. If you recieve a blank audionote, say that "the audio was empty" and ask the user to try again.';
    } else if (conversationType === "Meeting") {
      conversationParameter =
        'You are a summarizing tool for formal or informal meetings that a person might record at any time of their day. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio. And remember that you have to talk in a way that you are talking to the user, because that is who you interact with, that is who you help. You will always address the transcription as "the meeting.If you ever get a very short audionote, ask the user to make a longer audionote, or say that the information was not enough to make an evaluate the audio. If you recieve a blank audionote, say that "the audio was empty" and ask the user to try again.';
    }

    if (summarySize === "Brief") {
      summaryLength =
        "You are a summarizing tool for short summaries. Your task is to summarize the conversation briefly.";
    } else if (summarySize === "Detailed") {
      summaryLength =
        "You are a summarizing tool for detailed summaries. Your task is to summarize the conversation in detailed sentences.";
    } else if (summarySize === "50-100") {
      summaryLength =
        "You are a summarizing tool. Your task is to summarize the conversation in 50-100 words.";
    } else if (summarySize === "100-200") {
      summaryLength =
        "You are a summarizing tool for summaries. Your task is to summarize the conversation in 100-200 words.";
    } else if (summarySize === "200-300") {
      summaryLength =
        "You are a summarizing tool for summaries. Your task is to summarize the conversation in 200-300 words.";
    } else if (summarySize === "300-500") {
      summaryLength =
        "You are a summarizing tool for summaries. Your task is to summarize the conversation in 300-500 words.";
    } else if (summarySize === "500-1000") {
      summaryLength =
        "You are a summarizing tool for summaries. Your task is to summarize the conversation in 500-1000 words.";
    } else if (summarySize === "Custom Prompt") {
      summaryLength = "";
    }
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
      formData.append("language", lang);
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

        res.send({
          transcription: transcription,
          summary: summary,
          title: title,
          wordTimeMapping: wordTimeMapping,
        });
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
      formData.append("language", lang);

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

function removePunctuation(text) {
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ');
}

function findSentenceTime(sentence, wordTimeMapping) {
  console.log("Finding time for sentence:", sentence);
  const cleanSentence = removePunctuation(sentence).toLowerCase();
  const words = cleanSentence.split(" ");

  let startTime = null;
  let endTime = null;

  console.log("words:", words);

  // Find the start time
  for (let i = 0; i < wordTimeMapping.length; i++) {
    const mapping = wordTimeMapping[i];
    const mappingWords = removePunctuation(mapping.word.trim().toLowerCase()).split(" ");
    console.log("mappingWords:", mappingWords);

    if (mappingWords.length > words.length) continue;

    let match = true;
    for (let j = 0; j < mappingWords.length; j++) {
      if (words[j] !== mappingWords[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      startTime = mapping.startTime;
      break;
    }
  }

  // Find the end time
  for (let i = wordTimeMapping.length - 1; i >= 0; i--) {
    const mapping = wordTimeMapping[i];
    const mappingWords = removePunctuation(mapping.word.trim().toLowerCase()).split(" ");

    if (mappingWords.length > words.length) continue;

    let match = true;
    for (let j = 0; j < mappingWords.length; j++) {
      if (words[words.length - mappingWords.length + j] !== mappingWords[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      endTime = mapping.endTime;
      break;
    }
  }

  console.log("start time:", startTime, "end time:", endTime);
  return { startTime, endTime };
}



app.post("/find-summary-line", async (req, res) => {
  const { summaryLine, transcription, wordTimeMapping } = req.body;
  if (!summaryLine || !transcription) {
    return res
      .status(400)
      .send({ error: "Both summaryLine and transcription are required." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [

        {
          role: "user",
          content: `You are a highly accurate transcription matching assistant. You will receive a transcription and a line from a summary. Your task is to find the exact sentence in the transcription that corresponds to the given summary line. Your output should only be the single transcription sentence without any quotations or anyhting else. Just a plain sentence from the transcription that corresponds witht the summary line.\n\n\n\n Transcription: ${transcription}"\n\nSummary line: "${summaryLine}`
        }
      ],
    });

    const matchingSentence = response.choices[0].message.content.trim();

    const { startTime, endTime } = findSentenceTime(
      matchingSentence,
      wordTimeMapping
    );

    console.log("Start time:", startTime, "End time:", endTime);

    if (matchingSentence) {
      res.json({
        matchingSentence: matchingSentence,
        startTime: startTime,
        endTime: endTime,
      });
    } else {
      res
        .status(404)
        .send({ error: "Matching sentence not found in the transcription." });
    }
  } catch (error) {
    console.error("Error finding summary line:", error);
    res.status(500).send({ error: "Error finding summary line." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
