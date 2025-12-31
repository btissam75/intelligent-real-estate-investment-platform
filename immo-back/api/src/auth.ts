import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db";

/* ------------------ Types ------------------ */
type JwtPayload = { uid: string; role: string };

// on étend Request pour typer req.user
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

/* ------------------ Setup ------------------ */
const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // fail fast pour éviter "possibly undefined"
  throw new Error("JWT_SECRET is missing in environment");
}

/* ------------------ Schemas ------------------ */
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).optional(),
});

const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/* ------------------ Helpers ------------------ */
function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

/* Middleware protect */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = String(req.headers.authorization || "");
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });
  try {
    const dec = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    // garde de type : on vérifie que dec.uid existe
    if (!dec || typeof dec.uid !== "string") {
      return res.status(401).json({ error: "invalid_token" });
    }
    req.user = dec;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

/* ------------------ Routes ------------------ */

// POST /auth/signup
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = SignupSchema.parse(req.body);
    const emailNorm = email.trim().toLowerCase();

    // email unique ?
    const exists = await query("SELECT 1 FROM immo.users WHERE email=$1 LIMIT 1", [emailNorm]);
    if ((exists.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "email_exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const ins = await query<{ id: string; role: string }>(
      `INSERT INTO immo.users (email, password_hash, full_name)
       VALUES ($1,$2,$3)
       RETURNING id, role`,
      [emailNorm, hash, full_name || null]
    );

    const row = ins.rows?.[0];
    if (!row) return res.status(500).json({ error: "insert_failed" });

    const token = signToken({ uid: row.id, role: row.role });
    return res.json({ token });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "bad_request" });
  }
});

// POST /auth/signin
authRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = SigninSchema.parse(req.body);
    const emailNorm = email.trim().toLowerCase();

    const r = await query<{ id: string; password_hash: string; role: string }>(
      "SELECT id, password_hash, role FROM immo.users WHERE email=$1 LIMIT 1",
      [emailNorm]
    );

    if ((r.rowCount ?? 0) === 0) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const row = r.rows?.[0];
    if (!row || !row.password_hash) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = signToken({ uid: row.id, role: row.role });
    return res.json({ token });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "bad_request" });
  }
});

// GET /auth/me (protected)
authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  const uid = req.user!.uid; // sûr car requireAuth a validé et défini req.user
  const r = await query(
    "SELECT id, email, full_name, role, is_verified, created_at FROM immo.users WHERE id=$1",
    [uid]
  );
  return res.json({ user: r.rows?.[0] ?? null });
});

export { authRouter };
export default authRouter;
