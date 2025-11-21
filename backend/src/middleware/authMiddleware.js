// Simple in-memory token store and middleware
export const tokenStore = new Map();

export function requireAuth(req, res, next) {
  const auth = req.get("authorization") || "";
  const [, token] = auth.split(" ");
  if (!token) return res.status(401).json({ error: "missing token" });
  const info = tokenStore.get(token);
  if (!info) return res.status(401).json({ error: "invalid token" });
  if (info.expiresAt < Date.now()) {
    tokenStore.delete(token);
    return res.status(401).json({ error: "token expired" });
  }
  // attach user info
  req.user = { username: info.username };
  next();
}
