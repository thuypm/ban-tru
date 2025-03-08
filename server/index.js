const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const {
  syncData,
  jsonData,
  getJsonData,
  tickUpdateData,
} = require("./syncData");
const path = require("path");
const { copyExcelDataWithStyle } = require("./copybt");
const cron = require("node-cron");
const { copyAllRootData } = require("./copybt/getlistAllData");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send initial data
  socket.emit("get-all", getJsonData());

  // Handle tick event
  socket.on("tick", (code) => {
    tickUpdateData(code);
    io.emit("get-all", getJsonData()); // Broadcast updated data to all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

server.listen(5000, async () => {
  // await copyAllRootData();
  await copyExcelDataWithStyle();
  syncData();
  cron.schedule("0 6 * * *", async () => {
    await copyAllRootData();
    await copyExcelDataWithStyle();
    syncData();
  });

  cron.schedule("0 10 * * *", async () => {
    await copyAllRootData();
    await copyExcelDataWithStyle();
    syncData();
  });
});
