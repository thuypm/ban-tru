const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const {
  syncRootData,
  jsonData,
  getJsonData,
  tickUpdateData,
} = require("./syncData");
const path = require("path");
const cron = require("node-cron");
const { downloadAll } = require("./copybt/downloadFile");

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
    io.emit("tick-a-item", code);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
app.get("/api/download", (req, res) => {
  const filePath = path.resolve(
    "E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx"
  );
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Lỗi gửi file:", err);
      res.status(500).send("Không thể gửi file");
    }
  });
});
app.get("/api/get-all", (req, res) => {
  res.json(getMC2RootData());
});
app.get("/api/sync-data", async (req, res) => {
  await runSync();
  res.json({
    message: "ok",
  });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});
async function runSync() {
  try {
    await downloadAll(); // luôn tải file mới nhất trước
    await syncRootData(); // sau đó mới xử lý dữ liệu
  } catch (err) {
    console.error("Lỗi khi sync:", err.message);
  }
}
server.listen(5000, async () => {
  // await copyAllRootData();
  // await copyExcelDataWithStyle();
  await runSync();
  cron.schedule(
    "0 6 * * *",
    async () => {
      runSync();
    }
    // {
    //   timezone: "Asia/Ho_Chi_Minh",
    // }
  );

  cron.schedule(
    "0 10 * * *",
    async () => {
      runSync();
    }
    // {
    //   timezone: "Asia/Ho_Chi_Minh",
    // }
  );
});
