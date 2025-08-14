const axios = require("axios");
const faker = require("faker");

const URL = "https://davpsasnsol.onrender.com/api/ping";

// Some random user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile Safari/604.1"
];

function getRandomInterval() {
  const min = 2 * 60 * 1000; // 2 minutes
  const max = 10 * 60 * 1000; // 10 minutes
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomQueryParams() {
  return `?r=${Math.random().toString(36).substring(2)}&t=${Date.now()}`;
}

async function ping() {
  try {
    // Randomize method between GET and POST
    const method = Math.random() > 0.2 ? "get" : "post";
    const headers = { "User-Agent": getRandomUserAgent() };

    let urlWithParams = URL + getRandomQueryParams();

    console.log(`[${new Date().toISOString()}] 🔄 Sending ${method.toUpperCase()} to ${urlWithParams}`);

    let response;
    if (method === "get") {
      response = await axios.get(urlWithParams, { headers });
    } else {
      response = await axios.post(urlWithParams, { fakeData: faker.lorem.sentence() }, { headers });
    }

    console.log(`[${new Date().toISOString()}] ✅ Status: ${response.status}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error: ${err.message}`);
  }

  const nextInterval = getRandomInterval();
  console.log(`⏳ Next ping in ${(nextInterval / 60000).toFixed(2)} minutes\n`);
  setTimeout(ping, nextInterval);
}

ping();
