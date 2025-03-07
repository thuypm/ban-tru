const express = require("express");
const cors = require("cors");
const {
  syncData,
  jsonData,
  getJsonData,
  tickUpdateData,
} = require("./syncData");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
// app.use("/static", express.static(path.join(__dirname, "static")));
app.get("/api/get-all", (req, res) => {
  res.json(getJsonData());
});
app.post("/api/tick", (req, res) => {
  const { code } = req.body;
  tickUpdateData(code);
  res.json(getJsonData());
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(5000, () => {
  syncData();
});
