const https = require("https");
const fs = require("fs");
const path = require("path");

// CONFIG
const URL = "https://davpsasnsol.onrender.com/api/ping";
const STATE_FILE = path.join(__dirname, "last_state.json");
const LOG_FILE = path.join(__dirname, "ping-log.txt");
const MAX_SKIPS = 4; // never skip more than 4 in a row

// Load last state
let state = { skipCount: 0 };
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
} catch {
  state = { skipCount: 0 };
}

// Random User-Agent list
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
  "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
  "Mozilla/5.0 (Android 11; Mobile; rv:89.0)",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0)"
];

// Decide skip logic
let skip = false;
if (state.skipCount < MAX_SKIPS) {
  skip = Math.random() < 0.5; // 50% chance to skip
} else {
  skip = false; // force ping if max skips reached
}

if (skip) {
  state.skipCount += 1;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  const logEntry = `[${new Date().toISOString()}] ⏩ Skipped (in a row: ${state.skipCount})\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(logEntry);
  process.exit(0);
}

// If pinging, reset skipCount
state.skipCount = 0;
fs.writeFileSync(STATE_FILE, JSON.stringify(state));

// Add random delay before ping (0–60 sec)
const delay = Math.floor(Math.random() * 61);
console.log(`⏳ Waiting ${delay}s before ping...`);

setTimeout(() => {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  console.log(`📡 Pinging ${URL} with UA: ${ua}`);

  https.get(
    URL,
    { headers: { "User-Agent": ua } },
    (res) => {
      const logEntry = `[${new Date().toISOString()}] ✅ Pinged ${URL} | Status: ${res.statusCode}\n`;
      fs.appendFileSync(LOG_FILE, logEntry);
      console.log(logEntry);
    }
  ).on("error", (err) => {
    const logEntry = `[${new Date().toISOString()}] ❌ Error: ${err.message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.error(logEntry);
  });
}, delay * 1000);
