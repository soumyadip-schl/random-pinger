const https = require("https");
const fs = require("fs");
const path = require("path");

// CONFIG
const URL = "https://davpsasnsol.onrender.com/api/ping";
const STATE_FILE = path.join(__dirname, "last_state.json");
const LOG_FILE = path.join(__dirname, "pinger.log");
const MAX_SKIPS = 5; // never skip more than 5 times in a row

// Load last state (skip counter)
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
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64)",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0)"
];

// Helper: log to file
function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, entry);
  console.log(message);
}

// Decide skip logic
let skip = false;
if (state.skipCount < MAX_SKIPS) {
  skip = Math.random() < 0.5; // 50% chance
} else {
  skip = false; // force ping if max skips reached
}

if (skip) {
  state.skipCount += 1;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  log(`⏩ Skipping this run (#${state.skipCount} in a row)...`);
  process.exit(0);
}

// If pinging, reset skipCount and delete state file
state.skipCount = 0;
if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);

// Add random delay before ping (0–60 sec)
const delay = Math.floor(Math.random() * 61);
log(`⏳ Waiting ${delay}s before ping...`);

setTimeout(() => {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  log(`📡 Pinging ${URL} with UA: ${ua}`);

  https.get(
    URL,
    { headers: { "User-Agent": ua } },
    (res) => {
      log(`✅ Status: ${res.statusCode}`);
    }
  ).on("error", (err) => {
    log(`❌ Error: ${err.message}`);
  });
}, delay * 1000);
