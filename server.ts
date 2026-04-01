import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import axios from "axios";
import db from "./src/lib/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "codesentinel-secret-key";
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      const user: any = db.prepare('SELECT id, email, name, plan FROM users WHERE api_key = ?').get(apiKey);
      if (user) {
        req.user = user;
        return next();
      }
    }

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Registration
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword, name, plan: 'free' };
    
    db.prepare('INSERT INTO users (id, email, password, name, plan) VALUES (?, ?, ?, ?, ?)')
      .run(newUser.id, newUser.email, newUser.password, newUser.name, newUser.plan);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, plan: newUser.plan }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name, plan: newUser.plan } });
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000 });
    if (user.github_token) {
      res.cookie("github_token", user.github_token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("github_token");
    res.json({ success: true });
  });

  // Get Current User
  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.json({ user: null });
      
      // Fetch fresh user data from DB to include API key and custom rules
      const dbUser: any = db.prepare('SELECT id, email, name, plan, api_key, custom_rules, github_token FROM users WHERE id = ?').get(user.id);
      res.json({ user: dbUser });
    });
  });

  // Generate API Key
  app.post("/api/auth/api-key", authenticateToken, (req: any, res) => {
    const apiKey = `cs_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    db.prepare('UPDATE users SET api_key = ? WHERE id = ?').run(apiKey, req.user.id);
    res.json({ apiKey });
  });

  // Upgrade to Pro (Simulation)
  app.post("/api/auth/upgrade", authenticateToken, (req: any, res) => {
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('pro', req.user.id);
    user.plan = 'pro';
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  });

  // --- GitHub OAuth Routes ---

  app.get("/api/auth/github/url", (req, res) => {
    const clientId = (req.query.clientId as string) || process.env.GITHUB_CLIENT_ID;
    const clientSecret = (req.query.clientSecret as string) || process.env.GITHUB_CLIENT_SECRET;
    const origin = (req.query.origin as string) || req.get('referer') || req.get('origin');
    
    let appUrl = process.env.APP_URL;
    if (origin) {
      try {
        const url = new URL(origin);
        appUrl = `${url.protocol}//${url.host}`;
      } catch (e) {}
    }
    appUrl = appUrl?.replace(/\/$/, '') || 'http://localhost:5173';
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: "GitHub Client ID and Client Secret are not configured in environment variables." });
    }

    if (!appUrl) {
      return res.status(400).json({ error: "App URL could not be determined. Please ensure APP_URL is set or origin is provided." });
    }

    // Store credentials in a temporary cookie for the callback
    res.cookie("github_config", JSON.stringify({ clientId, clientSecret, appUrl }), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${appUrl}/api/auth/github/callback`,
      scope: "repo,user",
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
  });

  app.get(["/api/auth/github/callback", "/api/auth/github/callback/"], async (req, res) => {
    const { code } = req.query;
    const configCookie = req.cookies.github_config;
    
    if (!configCookie) {
      return res.status(400).send("GitHub configuration missing or expired. Please try again.");
    }

    try {
      const { clientId, clientSecret, appUrl } = JSON.parse(configCookie);

      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${appUrl}/api/auth/github/callback`,
        },
        { headers: { Accept: "application/json" } }
      );

      const { access_token } = response.data;
      if (!access_token) throw new Error("No access token returned from GitHub");

      // Clear the config cookie after use
      res.clearCookie("github_config");

      res.cookie("github_token", access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Also try to save to DB if logged in
      const currentToken = req.cookies.token;
      if (currentToken) {
        try {
          const user: any = jwt.verify(currentToken, JWT_SECRET);
          if (user && user.id) {
            db.prepare('UPDATE users SET github_token = ? WHERE id = ?').run(access_token, user.id);
          }
        } catch (e) {
          console.error("Failed to link github token to user", e);
        }
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send("GitHub Authentication failed");
    }
  });

  // --- GitHub API Routes ---

  app.get("/api/github/repos", authenticateToken, async (req, res) => {
    const token = req.cookies.github_token;
    if (!token) return res.status(401).json({ error: "GitHub not connected" });

    try {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: { Authorization: `token ${token}` },
      });
      res.json({ repos: response.data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.get("/api/github/repo/:owner/:repo/contents", authenticateToken, async (req, res) => {
    const { owner, repo } = req.params;
    const path = req.query.path || "";
    const token = req.cookies.github_token;
    if (!token) return res.status(401).json({ error: "GitHub not connected" });

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` },
      });
      res.json({ contents: response.data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contents" });
    }
  });

  app.get("/api/github/repo/:owner/:repo/file", authenticateToken, async (req, res) => {
    const { owner, repo } = req.params;
    const path = req.query.path as string;
    const token = req.cookies.github_token;
    if (!token) return res.status(401).json({ error: "GitHub not connected" });

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` },
      });
      
      if (response.data.content) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.json({ content, fileName: response.data.name });
      } else {
        res.status(400).json({ error: "Not a file" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  app.get("/api/github/status", authenticateToken, (req, res) => {
    const token = req.cookies.github_token;
    res.json({ connected: !!token });
  });

  app.post("/api/github/disconnect", authenticateToken, (req: any, res) => {
    res.clearCookie("github_token");
    db.prepare('UPDATE users SET github_token = NULL WHERE id = ?').run(req.user.id);
    res.json({ success: true });
  });

  // Custom Rules Configuration
  app.post("/api/user/rules", authenticateToken, (req: any, res) => {
    const { customRules } = req.body;
    db.prepare('UPDATE users SET custom_rules = ? WHERE id = ?').run(customRules || null, req.user.id);
    res.json({ success: true });
  });

  // GitHub Auto-Fix Route
  app.post("/api/github/autofix", authenticateToken, async (req: any, res) => {
    const { owner, repo, path, branch, fixCode, message } = req.body;
    const token = req.cookies.github_token || req.user.github_token;
    
    if (!token) return res.status(401).json({ error: "GitHub not connected" });
    if (!owner || !repo || !path || !branch || !fixCode) return res.status(400).json({ error: "Missing required parameters" });

    try {
      // 1. Get current file SHA
      const fileRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: { Authorization: `token ${token}` },
      });
      const sha = fileRes.data.sha;

      // 2. Commit the new file
      const updateRes = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          message: message || `CodeSentinel AI Auto-Fix: ${path}`,
          content: Buffer.from(fixCode).toString('base64'),
          sha,
          branch
        },
        { headers: { Authorization: `token ${token}` } }
      );

      res.json({ success: true, commitUrl: updateRes.data.commit.html_url });
    } catch (error: any) {
      console.error("Autofix failed:", error.response?.data || error);
      res.status(500).json({ error: "Failed to push auto-fix to GitHub" });
    }
  });

  // Simple Webhook endpoint
  app.post("/api/webhooks/github", async (req, res) => {
    // In production, verify GitHub webhook signature here
    const event = req.headers['x-github-event'];
    
    if (event === 'pull_request') {
      const { action, pull_request, repository, sender } = req.body;
      if (action === 'opened' || action === 'synchronize') {
        const owner = repository.owner.login;
        const repo = repository.name;
        const prNumber = pull_request.number;
        
        console.log(`Received PR webhook for ${owner}/${repo}#${prNumber}`);
        
        // Find user by github_token (simplistic match for SaaS)
        // Usually you'd map installation_id from a GitHub App
        // But for this MVP, we just acknowledge receipt
      }
    }
    
    // Always respond 200 to GitHub
    res.status(200).send("Webhook received");
  });

  // GitHub Pull Requests
  app.get("/api/github/repo/:owner/:repo/pulls", authenticateToken, async (req, res) => {
    const { owner, repo } = req.params;
    const token = req.cookies.github_token;
    if (!token) return res.status(401).json({ error: "GitHub not connected" });

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: { Authorization: `token ${token}` },
      });
      res.json({ pulls: response.data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pull requests" });
    }
  });

  // Get Repo Live Metrics (Security & Tech Debt Dashboard)
  app.get("/api/github/repo/:owner/:repo/metrics", authenticateToken, async (req: any, res) => {
    const { owner, repo } = req.params;
    const token = req.cookies.github_token || req.user.github_token;
    if (!token) return res.status(401).json({ error: "GitHub not connected" });

    try {
      const safeGet = (url: string) => axios.get(url, { headers: { Authorization: `token ${token}` } }).catch(() => ({ data: [] }));
      const safeGetObj = (url: string) => axios.get(url, { headers: { Authorization: `token ${token}` } }).catch(() => ({ data: {} }));

      const [repoRes, prsRes, issuesRes, commitsRes] = await Promise.all([
        safeGetObj(`https://api.github.com/repos/${owner}/${repo}`),
        safeGet(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`),
        safeGet(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`),
        safeGet(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`)
      ]);

      const repoInfo = repoRes.data || {};
      const openPRs = prsRes.data.length || 0;
      
      const allIssues = (issuesRes.data || []).filter((iss: any) => !iss.pull_request);
      const openIssues = allIssues.filter((iss: any) => iss.state === 'open').length;

      let bugCount = 0;
      let securityCount = 0;
      
      allIssues.forEach((iss: any) => {
        const labels = (iss.labels || []).map((l: any) => typeof l === 'string' ? l.toLowerCase() : l.name?.toLowerCase() || '');
        const title = (iss.title || '').toLowerCase();
        const isBug = labels.some((l: string) => l.includes('bug') || l.includes('defect')) || title.includes('bug') || title.includes('fix');
        const isSecurity = labels.some((l: string) => l.includes('security') || l.includes('vuln') || l.includes('cve')) || title.includes('security') || title.includes('vulnerabilit');
        
        if (isBug && iss.state === 'open') bugCount++;
        if (isSecurity && iss.state === 'open') securityCount++;
      });

      let recentFixes = 0;
      let recentSecurityPatches = 0;
      (commitsRes.data || []).forEach((commit: any) => {
         const msg = (commit.commit?.message || '').toLowerCase();
         if (msg.includes('fix') || msg.includes('bug') || msg.includes('patch')) recentFixes++;
         if (msg.includes('security') || msg.includes('cve') || msg.includes('vuln')) recentSecurityPatches++;
      });

      if (bugCount === 0 && recentFixes > 0) bugCount = Math.max(1, Math.floor(recentFixes / 3));
      if (securityCount === 0 && recentSecurityPatches > 0) securityCount = 1;

      let securityScore = 100;
      securityScore -= (securityCount * 25);
      securityScore -= (recentSecurityPatches * 5); 
      
      let techDebtScore = 100;
      if (openIssues > 0) techDebtScore -= (openIssues * 2);
      if (openPRs > 0) techDebtScore -= (openPRs * 3);
      
      if (repoInfo.updated_at) {
        const daysSinceUpdate = (new Date().getTime() - new Date(repoInfo.updated_at).getTime()) / (1000 * 3600 * 24);
        if (daysSinceUpdate > 30) techDebtScore -= Math.min(25, Math.floor(daysSinceUpdate / 10));
      }
      
      if (repoInfo.size) {
        const sizeMb = repoInfo.size / 1024;
        if (sizeMb > 5) techDebtScore -= Math.min(20, Math.floor(sizeMb));
      }
      
      res.json({
        metrics: {
          openPRs,
          openIssues: openIssues || bugCount, 
          bugCount,
          securityCount,
          securityScore: Math.max(15, Math.min(100, Math.round(securityScore))),
          techDebtScore: Math.max(10, Math.min(100, Math.round(techDebtScore)))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Get Review History
  app.get("/api/reviews", authenticateToken, (req: any, res) => {
    const userReviews: any[] = db.prepare('SELECT * FROM reviews WHERE userId = ? ORDER BY timestamp DESC').all(req.user.id);
    
    // Parse result JSON strings back to objects
    const formattedReviews = userReviews.map(r => ({
      ...r,
      result: JSON.parse(r.result)
    }));
    
    res.json({ reviews: formattedReviews });
  });

  // Code Review API
  app.post("/api/review", authenticateToken, async (req: any, res) => {
    const { code, fileName, profile = 'Standard' } = req.body;
    
    // Usage Limits (e.g., 10 reviews for free tier)
    const stats: any = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE userId = ?').get(req.user.id);
    const userReviewCount = stats.count;
    
    if (req.user.plan === 'free' && userReviewCount >= 10) {
      return res.status(403).json({ 
        error: "Usage limit reached. Upgrade to Pro for unlimited reviews.", 
        isLimitReached: true 
      });
    }

    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({ error: "Cohere API key not configured" });
    }

    const profileInstructions = {
      'Standard': 'Provide a balanced review of security, performance, and code quality.',
      'Security': 'Focus primarily on security vulnerabilities, OWASP Top 10, data protection, SQL injection, and secrets. Check for known CVE patterns. Treat any hardcoded credentials as Critical.',
      'Performance': 'Focus on algorithmic efficiency, memory usage, and execution speed.',
      'Clean Code': 'Focus on readability, maintainability, naming conventions, and SOLID principles.'
    };

    let customRulesStr = "";
    if (req.user.plan !== 'free') {
      const dbUser: any = db.prepare('SELECT custom_rules FROM users WHERE id = ?').get(req.user.id);
      if (dbUser && dbUser.custom_rules) {
        customRulesStr = `\nCOMPANY CUSTOM RULES TO ENFORCE:\n${dbUser.custom_rules}\n(If the code violates these rules, mark as Warning or Critical)`;
      }
    }

    const prompt = `You are an elite Senior AI Code Reviewer. Review the following code from file "${fileName}" using the "${profile}" profile.
    
    Profile Focus: ${profileInstructions[profile as keyof typeof profileInstructions]}${customRulesStr}
    
    CRITICAL INSTRUCTION: If the code is well-written, secure, and has no significant issues, DO NOT invent issues. You MUST return an empty array [] for "issues". 
    Only report genuine, impactful problems. Do not report trivial stylistic preferences as "Warning" or "Critical".
    
    Provide a review focusing ONLY on real:
    1. Security vulnerabilities (include CVE references if applicable)
    2. Severe Performance issues
    3. Major Code smells that impact maintainability
    
    For each issue, provide a "fix" property containing the corrected code snippet.
    
    Format your response EXACTLY as a JSON object with a single "issues" array property:
    {
      "issues": [
        {
          "line": number,
          "severity": "Critical" | "Warning" | "Info",
          "title": "string",
          "description": "string",
          "fix": "string (The corrected code snippet for this specific issue)",
          "cve": "string (Optional, e.g., 'CVE-2023-1234')"
        }
      ]
    }
    
    Code to review:
    \n\n${code}`;

    try {
      const response = await cohere.chat({
        model: "command-a-03-2025",
        message: prompt,
        responseFormat: { type: "json_object" }
      });

      if (!response.text) {
        throw new Error("Empty response from Cohere");
      }

      const reviewResult = JSON.parse(response.text);
      
      // Save to history
      const newReview = {
        id: Date.now().toString(),
        userId: req.user.id,
        fileName,
        codeSnippet: code.substring(0, 200) + (code.length > 200 ? "..." : ""),
        result: JSON.stringify(reviewResult),
        profile,
        timestamp: Date.now()
      };
      
      db.prepare('INSERT INTO reviews (id, userId, fileName, codeSnippet, result, profile, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(newReview.id, newReview.userId, newReview.fileName, newReview.codeSnippet, newReview.result, newReview.profile, newReview.timestamp);

      res.json({ review: reviewResult });
    } catch (error: any) {
      console.error("Cohere Error:", error.message || error);
      res.status(500).json({ error: "Failed to process code review: " + (error.message || "Unknown error") });
    }
  });

  // File Upload Endpoint
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const code = req.file.buffer.toString("utf-8");
    const fileName = req.file.originalname;
    res.json({ code, fileName });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite server in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
