import { Octokit } from "@octokit/rest";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const TARGET_URL = process.env.PING_URL || "https://davpsasansol.onrender.com/api/ping";
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const FILE_PATH = "ping-log.txt";

if (!OWNER || !REPO || !TOKEN) {
  console.error("❌ Missing GitHub environment variables!");
  process.exit(1);
}

const octokit = new Octokit({ auth: TOKEN });
const MAX_SKIP_STREAK = 4;
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
];

function timestamp() {
  return new Date().toISOString();
}

// Fetch last 10 log lines from GitHub
async function getLastLogs() {
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: FILE_PATH });
    if ("content" in res.data) {
      const content = Buffer.from(res.data.content, "base64").toString("utf-8");
      const lines = content.trim().split("\n");
      const last10 = lines.slice(-10);
      return { lines, last10, sha: res.data.sha };
    }
  } catch (err: any) {
    if (err.status === 404) return { lines: [], last10: [], sha: null };
    console.error("❌ GitHub fetch error:", err.message);
    return { lines: [], last10: [], sha: null };
  }
  return { lines: [], last10: [], sha: null };
}

// Append log to GitHub
async function appendLog(message: string, sha: string | null) {
  const newLine = `[${timestamp()}] ${message}\n`;
  const content = ((await getLastLogs()).lines || []).join("\n") + (newLine || "");
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      message: "Update ping logs",
      content: Buffer.from(content).toString("base64"),
      sha: sha || undefined
    });
    console.log("📌 Log pushed:", message);
  } catch (err: any) {
    console.error("❌ GitHub push error:", err.message);
  }
}

// Decide whether to skip based on last state
function shouldSkip(last10: string[]) {
  const lastSkips = last10.slice(-MAX_SKIP_STREAK).filter(line => line.includes("⏭ skipped")).length;
  if (lastSkips >= MAX_SKIP_STREAK) return false; // force ping
  return Math.random() < 0.3; // ~30% chance to skip
}

// Ping the URL with random UA and delay
async function ping() {
  const { last10, sha } = await getLastLogs();

  if (shouldSkip(last10)) {
    console.log("⏭ Skipping ping this time");
    await appendLog("⏭ skipped", sha);
    return;
  }

  const delaySec = Math.floor(Math.random() * 61); // 0–60s
  console.log(`⏳ Waiting ${delaySec}s before ping...`);

  let waited = 0;
  const hb = setInterval(() => {
    waited += 2;
    console.log(`... waiting (${Math.min(waited, delaySec)}s/${delaySec}s)`);
    if (waited >= delaySec) clearInterval(hb);
  }, 2000);

  setTimeout(() => {
    clearInterval(hb);
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const urlWithNoise = `${TARGET_URL}?t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
    console.log(`📡 Pinging: ${urlWithNoise}`);

    const req = https.get(urlWithNoise, {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        "Connection": "close"
      },
      timeout: 8000
    }, async (res) => {
      let bytes = 0;
      res.on("data", chunk => bytes += chunk.length);
      res.on("end", async () => {
        const status = res.statusCode || 0;
        console.log(`✅ HTTP ${status} (${bytes} bytes)`);
        await appendLog(`✅ Ping success ${status}`, sha);
      });
    });

    req.on("timeout", async () => {
      console.warn("⌛ Request timed out");
      req.destroy();
      await appendLog("❌ Ping timed out", sha);
    });

    req.on("error", async (err) => {
      console.error("❌ Network error:", err.message);
      await appendLog(`❌ Network error: ${err.message}`, sha);
    });
  }, delaySec * 1000);
}

// Run ping
ping();
