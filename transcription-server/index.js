const express = require("express");
const multer = require("multer");
const { SpeechClient } = require("@google-cloud/speech");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

var app = express();
var cors  =require('cors');
app.use(cors());
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });
const speechClient = new SpeechClient();

app.use(express.json());

const transcriptionFilePath = path.join(__dirname,'./transcriptionFile(s)','transcription.txt')

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    const audio = {
      content: fs.readFileSync(filePath).toString("base64"),
    };

    const config = {
      model: "latest_long",
      encoding: req.file.mimetype === "audio/x-caf" ? "LINEAR16" : "MP3",
      sampleRateHertz: 44100,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      languageCode: "en-IN",
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
    fs.appendFileSync(transcriptionFilePath, transcription + "\n");
    // Delete the file after processing
    fs.unlinkSync(filePath);

    res.json({ transcription: transcription });
  } catch (error) {
    console.error("Error during transcription:", error);
    res.status(500).send("Error during transcription");


  }
});

app.post("/resetTranscriptionFile", (req,res) => {
  try {
    fs.writeFileSync(transcriptionFilePath, "");
    res.send("Transcription file reset successfully");
  }catch (error) {
    console.error("Error resetting transcription file:", error);
    res.status(500).send("Error resetting transcription file.");

    
  }
})

app.get('/file' , (req,res) => {
  res.sendFile(transcriptionFilePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(err.status).end();
    } else{
      console.log("File sent successfully.")
    }
  });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// fs.readFile(filePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error('Error reading the file:', err);
//     return;
//   }
// })