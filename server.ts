import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("sentinel.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS infected_tokens (
    token TEXT PRIMARY KEY,
    published_at INTEGER,
    risk_level TEXT
  );
  
  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT,
    timestamp INTEGER
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---

  // Health Authority: Publish tokens of an infected individual
  app.post("/api/admin/publish-tokens", (req, res) => {
    const { tokens, riskLevel } = req.body;
    
    if (!Array.isArray(tokens)) {
      return res.status(400).json({ error: "Tokens must be an array" });
    }

    const insert = db.prepare("INSERT OR IGNORE INTO infected_tokens (token, published_at, risk_level) VALUES (?, ?, ?)");
    const now = Date.now();
    
    const transaction = db.transaction((tokenList) => {
      for (const token of tokenList) {
        insert.run(token, now, riskLevel || "HIGH");
      }
    });

    transaction(tokens);
    
    db.prepare("INSERT INTO system_logs (event, timestamp) VALUES (?, ?)").run(`Published ${tokens.length} tokens`, now);
    
    res.json({ success: true, count: tokens.length });
  });

  // Client: Fetch all infected tokens (Decentralized approach)
  // In a real PSI, this would be a multi-step cryptographic exchange.
  // For this simulation, we provide the public set for local intersection.
  app.get("/api/tokens/infected", (req, res) => {
    const tokens = db.prepare("SELECT token, risk_level FROM infected_tokens").all();
    res.json(tokens);
  });

  // System Stats
  app.get("/api/stats", (req, res) => {
    const count = db.prepare("SELECT COUNT(*) as count FROM infected_tokens").get() as { count: number };
    const logs = db.prepare("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 5").all();
    res.json({ totalInfectedTokens: count.count, recentLogs: logs });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sentinel Server running on http://localhost:${PORT}`);
  });
}

startServer();
