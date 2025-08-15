const axios = require("axios");

const URL = "https://your-school-website.com/api/ping"; // replace with actual

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 14)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X)"
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

(async () => {
  try {
    const headers = { "User-Agent": getRandomUserAgent() };
    const urlWithParams = `${URL}?r=${Math.random().toString(36).substring(2)}&t=${Date.now()}`;

    console.log(`Pinging ${urlWithParams}`);
    await axios.get(urlWithParams, { headers });

    console.log(`Ping successful`);
  } catch (err) {
    console.error(`Ping failed: ${err.message}`);
  }
})();
