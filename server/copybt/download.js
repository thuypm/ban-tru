require("isomorphic-fetch");
const { Client } = require("@microsoft/microsoft-graph-client");
require("dotenv").config();

const TENANT_ID = "927baee0-3a5b-4b51-a0bb-1b3d48cc21fd";
const CLIENT_ID = "323e4f91-fbff-4bed-91e7-86c8e8602e4b";
const CLIENT_SECRET = "Zng8Q~-pQ-CPrQVlrTFPHvzFtjSJb_RD6TDHNaQO";
const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID; // ID của site SharePoint
const FILE_PATH = "Shared Documents/TestFile.pdf"; // Đường dẫn tệp trong SharePoint

async function getAccessToken() {
  const response = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  const data = await response.json();
  return data.access_token;
}

async function downloadFile() {
  const accessToken = await getAccessToken();

  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const fileUrl = `/sites/${SHAREPOINT_SITE_ID}/drive/root:/${FILE_PATH}:/content`;
  const response = await client.api(fileUrl).get();

  require("fs").writeFileSync("downloaded_file.pdf", Buffer.from(response));
  console.log("Tệp đã được tải xuống thành công!");
}

downloadFile().catch(console.error);
