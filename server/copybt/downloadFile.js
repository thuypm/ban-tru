const axios = require("axios");
const fs = require("fs");
const qs = require("querystring");
const path = require("path");

const tenantId = "927baee0-3a5b-4b51-a0bb-1b3d48cc21fd";
const clientId = "91195357-0fe3-4215-b267-22bdf7b045eb";

const tokensFile = path.join(__dirname, "tokens.json"); // ✅ an toàn hơn

// File lưu local
const BT_MC1 = path.join(__dirname, "BT_MC1.xlsx");
const BT_MC2 = path.join(__dirname, "BT_MC2.xlsx");

// Link chia sẻ
const BT_MC1_LINK =
  "https://mcshaiduong-my.sharepoint.com/:x:/g/personal/thuypm_smmc_edu_vn/EZ5yugnDG2REnxiRcGuKCpgB1p5d4MaM6OFl04yy-6bfUQ?e=E1jvwX";
const BT_MC2_LINK =
  "https://mcshaiduong-my.sharepoint.com/:x:/g/personal/thuypm_smmc_edu_vn/EXzfCAzoxYpFmBlct3Nr-6UBUlYu7XSdZW-Jkyyf2axudw?e=F74dIT";

// ====== TOKEN HANDLING ======
async function ensureAccessToken() {
  const tokens = JSON.parse(fs.readFileSync(tokensFile, "utf8"));
  const refreshToken = tokens.refresh_token;

  const res = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    qs.stringify({
      client_id: clientId,
      scope: "User.Read Files.Read Files.ReadWrite offline_access",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  // Lưu refresh_token mới (sliding expiration)
  fs.writeFileSync(tokensFile, JSON.stringify(res.data, null, 2));
  console.log("🔄 Access token refreshed");
  return res.data.access_token;
}

// Convert link share thành shareId
function getShareIdFromUrl(url) {
  const b64 = Buffer.from(url)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `u!${b64}`;
}

// ====== DOWNLOAD GENERIC ======
async function downloadFile(sharedLink, savePath) {
  const token = await ensureAccessToken();
  const shareId = getShareIdFromUrl(sharedLink);

  const metaRes = await axios.get(
    `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const downloadUrl = metaRes.data["@microsoft.graph.downloadUrl"];
  if (!downloadUrl) throw new Error("Không tìm thấy downloadUrl");

  const resp = await axios.get(downloadUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(savePath);
  resp.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log("✅ File đã tải:", savePath);
      resolve(savePath);
    });
    writer.on("error", reject);
  });
}

// ====== DOWNLOAD BOTH FILES ======
async function downloadAll() {
  await downloadFile(BT_MC1_LINK, BT_MC1);
  await downloadFile(BT_MC2_LINK, BT_MC2);
}

module.exports = { downloadFile, downloadAll };
