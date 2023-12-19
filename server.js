// server.js
const fs = require("fs");
const https = require("https");
const express = require("express");
const { Server } = require("ws");
const speech = require("@google-cloud/speech");
const next = require("next");
const { openai } = require("openai");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const axios = require("axios");

async function transcribe(file) {
  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      file,
      model: "whisper-1",
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.text;
}

app.prepare().then(() => {
  const server = express();
  server.all("*", (req, res) => handle(req, res));

  const httpsServer = https.createServer(
    {
      key: fs.readFileSync("./certificates/localhost-key.pem"),
      cert: fs.readFileSync("./certificates/localhost.pem"),
    },
    server
  );

  httpsServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on https://localhost:3000");
  });

  const wssServer = https.createServer({
    key: fs.readFileSync("./certificates/localhost-key.pem"),
    cert: fs.readFileSync("./certificates/localhost.pem"),
  });

  const wss = new Server({ server: wssServer });
  let speechClient;

  wss.on("connection", (socket) => {
    if (!speechClient) {
      speechClient = new speech.SpeechClient(); // Creates a client
    }
    let recognizeStream = speechClient
      .streamingRecognize({
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
        interimResults: true,
      })
      .on("data", (data) => {
        console.log("got data", JSON.stringify(data));
        socket.send(JSON.stringify(data));
      })
      .on("error", (error) => {
        console.error("Error in recognition stream:", error);
      });

    socket.on("message", (message) => {
      if (message instanceof Buffer) {
        console.log("data is ", message);
        // const arrayBuffer = Uint8Array.from(message).buffer;
        // Write the audio data to a temporary file
        fs.writeFile("temp.webm", message, async (err) => {
          if (err) throw err;
          // Send the temporary file to the OpenAI Whisper API
          console.log(err);

          const text = await transcribe(fs.createReadStream("temp.webm"));
          console.log(text);
          // openai.audio.transcriptions
          //   .create({
          //     model: "whisper-1",
          //     file: fs.createReadStream("temp.webm"),
          //   })
          //   .then((response) => {
          //     console.log(response);
          //   });
        });
        // fs.writeFile("audio.webm", message, (err) => {
        //   console.log("about to create", message, err);
        //   if (err) throw err;
        //   openai.audio.transcriptions
        //     .create({
        //       file: fs.createReadStream("audio.webm"),
        //       model: "whisper-1",
        //     })
        //     .then((response) => {
        //       console.log(response);
        //     });
        // });
        // if (recognizeStream) {
        //   recognizeStream.write(message);
        // }
      } else {
        try {
          const json = JSON.parse(message);
          console.log("message", message.type);
          if (json.type == "data_recording") {
            if (!recognizeStream || recognizeStream.destroyed) {
              // startRecognitionStream();
            }
            if (recognizeStream) {
              // recognizeStream.write(message);
            }
          } else if (json.type == "start_recording") {
            if (!recognizeStream || recognizeStream.destroyed) {
              // startRecognitionStream();
            }
          } else if (json.type == "stop_recording") {
            if (recognizeStream && !recognizeStream.destroyed) {
              recognizeStream.end();
            }
          }
        } catch (e) {
          console.log("error with message", e);
        }
      }
    });

    socket.on("close", () => {
      if (recognizeStream && !recognizeStream.destroyed) {
        recognizeStream.end();
      }
    });
  });

  wssServer.listen(8081, () => {
    console.log("WebSocket server is running on wss://localhost:8081");
  });
});
