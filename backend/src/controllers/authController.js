import crypto from "crypto";
import { tokenStore } from "../middleware/authMiddleware.js";

const DEFAULT_USER = process.env.ADMIN_USER || "admin";
const DEFAULT_PASS = process.env.ADMIN_PASS || "password";

export const AuthController = {
  async login(req, res) {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    if (username !== DEFAULT_USER || password !== DEFAULT_PASS) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // create token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
    tokenStore.set(token, { username, expiresAt });

    res.json({ token, expiresAt });
  },

  async validate(req, res) {
    const auth = req.get("authorization") || "";
    const [, token] = auth.split(" ");
    if (!token || !tokenStore.has(token)) return res.status(401).json({ valid: false });
    const info = tokenStore.get(token);
    if (info.expiresAt < Date.now()) return res.status(401).json({ valid: false });
    res.json({ valid: true, username: info.username, expiresAt: info.expiresAt });
  },
};
