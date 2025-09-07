// login.js
const axios = require("axios");
const fs = require("fs");
const qs = require("querystring");

const tenantId = "927baee0-3a5b-4b51-a0bb-1b3d48cc21fd";
const clientId = "91195357-0fe3-4215-b267-22bdf7b045eb"; // chỉ cần client_id

async function getDeviceCode() {
  const res = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/devicecode`,
    qs.stringify({
      client_id: clientId,
      scope: "User.Read Files.Read Files.ReadWrite offline_access",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data;
}

async function pollToken(deviceCode) {
  while (true) {
    try {
      const res = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        qs.stringify({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          client_id: clientId,
          device_code: deviceCode,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      return res.data; // chứa access_token + refresh_token
    } catch (err) {
      if (err.response && err.response.status === 400) {
        await new Promise((r) => setTimeout(r, 5000)); // đợi rồi thử lại
      } else {
        console.log(err.response.data);
      }
    }
  }
}

(async () => {
  const device = await getDeviceCode();
  console.log("👉 Mở link:", device.verification_uri);
  console.log("👉 Nhập code:", device.user_code);

  const tokens = await pollToken(device.device_code);
  fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));
  console.log("✅ Đã lưu token vào tokens.json");
})();
