const fetch = require("node-fetch");

const URL = process.env.PING_URL || "https://example.com";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
];

const delay = Math.floor(Math.random() * 61); // 0–60s
console.log(`⏳ Will wait ${delay}s before ping...`);

let elapsed = 0;
const interval = setInterval(() => {
  elapsed += 5;
  console.log(`... still waiting (${elapsed}s/${delay}s)`);
  if (elapsed >= delay) {
    clearInterval(interval);
    doPing();
  }
}, 5000);

function doPing() {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  console.log(`📡 Pinging ${URL} with UA: ${ua}`);

  fetch(URL, { headers: { "User-Agent": ua } })
    .then(res => console.log(`✅ Response: ${res.status}`))
    .catch(err => console.error("❌ Error:", err));
}
