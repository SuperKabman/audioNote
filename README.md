# AudioNote

AudioNote is an innovative app designed to enhance your note-taking and information-sharing experience. Leveraging OpenAI's Whisper API, AudioNote records conversations and seamlessly converts them into text. It then utilizes the powerful GPT model to summarize those conversations concisely. Additionally, AudioNote features an integrated AI chatbot that can answer any questions you have about the audio notes recorded by the user. You can also share your AudioNotes with anyone, including the summary and transcription. Whether for meetings, lectures, or personal reminders, AudioNote ensures you never miss important details, making your life more organized and efficient.

## Features Of The App

1. __Realtime Summaries:__ Get instant summaries of any recorded conversation, complete with an auto-generated title.
2. __Customizable Settings:__ Adjust parameters such as Conversation Language, Conversation Type, Summary Size and Depth, and even use a custom summary prompt for enhanced summarization.
3. __Highlighted Transcriptions:__ Play back your recorded audio while the corresponding transcription is highlighted in real-time, similar to Spotify's lyrics feature.
4. __AI Chatbot:__ Ask questions about your recorded audio notes and receive insightful answers from the integrated AI chatbot.
5. __Easy Sharing:__ Share your AudioNotes, including the summary and transcription, with anyone effortlessly.

## Tech Stack Used

1. React Native (front end)
2. Node.js (backend)
3. Expo
4. Whisper API (transcription)
5. GPT 3.5 API (chatBot and summarization)
6. Firebase Authenticator (user authentication)
7. Google Cloud Compute Engine (hosting backend)
8. NativeWind (styling)

## Visual Appeal Of The App

/Demo_Images/LoginPage.PNG



## How To Start The Project For Yourself

1. Install dependencies

   ```bash
   npm install
   ```
2. Get API Keys from OpenAI and replace them in the code
3. Replace ``` LOCAL_IP_ADDRESS ``` with your machine's IP address
5. Start the app

   ```bash
    npx expo start
   ```
6. Go to the server files directory and start the server

   ```bash
   cd transcription-server
   node index.js
   ```



