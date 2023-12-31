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
  let exporterClients = new Map();
  let viewerClients = new Map();
  let allClients = [];

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.id = uniqueId();

    socket.on("message", (rawMessage) => {
      const stringMessage = rawMessage.toString();
      try {
        const message = JSON.parse(stringMessage);
        console.log("message", message);
        if (message.type == "registerExporter") {
          socket.clientId = message.clientId;
          exporterClients.set(message.clientId, socket);
        } else if (message.type == "registerViewer") {
          socket.clientId = message.clientId;
          console.log("set viewers", message);
        } else if (message.type == "sendImage") {
          wss.clients.forEach((ws) => {
            if (ws.clientId == message.clientId) {
              ws.send(
                JSON.stringify({
                  type: "receiveImage",
                  imageUri: message.imageUri,
                  imageName: message.imageName,
                })
              );
            }
          });
        } else if (message.type == "sendLayout") {
          // const layout = JSON.parse(message.layout);
          console.log("sending layout", message.layout);
          wss.clients.forEach((ws) => {
            if (ws.clientId == message.clientId) {
              ws.send(
                JSON.stringify({
                  type: "receiveLayout",
                  layout: message.layout,
                })
              );
            }
          });
        }
      } catch (e) {
        console.log("error, probably not JSON.", e.message);
      }
    });

    socket.on("close", () => {
      console.log("Closed connection: ", socket.id);
    });
  });
  // Ping every client every interval
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(() => {});
    });
    console.log("client count", wss.clients.size);
  }, 5000);

  wssServer.listen(8081, () => {
    console.log("WebSocket server is running on wss://localhost:8081");
  });
});

function uniqueId() {
  return Math.floor(Math.random() * Date.now()).toString();
}
