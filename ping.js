
// ping.js
const https = require("https");

const URL = process.env.PING_URL || "https://davpsasnsol.onrender.com/api/ping";

// Random delay 0–10s so pings aren't perfectly aligned
const delaySec = Math.floor(Math.random() * 11);

// Modest set of UAs
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
];

console.log(`⏳ Will wait ${delaySec}s before ping...`);

// Heartbeat so Actions doesn't think we're hung
let waited = 0;
const hb = setInterval(() => {
  waited += 2;
  if (waited >= delaySec) {
    clearInterval(hb);
  }
  console.log(`... still waiting (${Math.min(waited, delaySec)}s/${delaySec}s)`);
}, 2000);

setTimeout(() => {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  const urlWithNoise = `${URL}?t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;

  console.log(`📡 Pinging: ${urlWithNoise}`);
  const req = https.get(
    urlWithNoise,
    {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        "Connection": "close"
      },
      timeout: 8000 // 8s network timeout
    },
    (res) => {
      let bytes = 0;
      res.on("data", (chunk) => (bytes += chunk.length));
      res.on("end", () => {
        console.log(`✅ HTTP ${res.statusCode} (${bytes} bytes)`);
        process.exit(0); // succeed regardless of status code
      });
    }
  );

  req.on("timeout", () => {
    console.warn("⌛ Request timed out (8s).");
    req.destroy(); // abort
    process.exit(0); // still succeed
  });

  req.on("error", (err) => {
    console.error(`❌ Network error: ${err.message}`);
    process.exit(0); // don't fail the job
  });
}, delaySec * 1000);
