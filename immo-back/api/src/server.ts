// // import "dotenv/config";
// // import express from "express";

// import cors from "cors";
// import { walletRouter } from "./routes/wallet.route";

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// app.get("/health", (_, res) => res.json({ ok: true }));
// app.get("/", (_, res) => {
//   res.type("text").send("Invest-Immo API is running. Try /health or /wallets/:address/eth");
// });

// app.use("/wallets", walletRouter);

// const port = process.env.PORT || 8000;
// app.listen(port, () => console.log(`API on http://localhost:${port}`));

// // //========================


// // // ⚠️ même si le fichier est chat.ts, on importe en .js côté runtime ESM

// // app.use(cors());
// // app.use(express.json());

// // app.post("/api/chat", async (req, res) => {
// //   const { message } = req.body;

// //   // ⚠️ ici tu peux appeler ton moteur IA (OpenAI, HuggingFace, etc.)
// //   // pour l’instant on fait simple :
// //   if (message.toLowerCase().includes("hello")) {
// //     return res.json({ reply: "Salut 👋! Comment puis-je t’aider ?" });
// //   }
// //   res.json({ reply: "Je suis ton assistant collaboratif 🚀" });
// // });

// // app.listen(8000, () => console.log("Chatbot API running on http://localhost:8000"));
// // import "dotenv/config";
// // import express from "express";


// // app.use(cors()); // en dev, autorise tout
// // app.use(express.json({ limit: "1mb" }));

// // // route santé pour test
// // app.get("/ping", (_req, res) => res.json({ ok: true }));

// // // === route chat simple de test (sans OpenAI) ===
// // app.post("/chat", (req, res) => {
// //   const lastUser = [...(req.body?.messages ?? [])]
// //     .reverse()
// //     .find((m: any) => m.role === "user")?.content ?? "";
// //   res.json({ answer: `Echo: ${lastUser}` });
// // });

// // const PORT = Number(process.env.PORT || 3000);
// // app.listen(PORT, "0.0.0.0", () => {
// //   console.log(`API up on http://localhost:${PORT}`);
// // });
// // api/src/server.ts
// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// import nftRouter from "./routes/nft.route";

// const app = express();

// /* Middlewares */
// app.use(
//   cors({
//     origin: true,          // autorise localhost:5173 etc.
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "2mb" }));

// /* Santé */
// app.get("/ping", (_req, res) => {
//   res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
// });

// /* Echo simple de test */
// app.post("/chat", (req, res) => {
//   const lastUser =
//     [...(req.body?.messages ?? [])]
//       .reverse()
//       .find((m: any) => m.role === "user")?.content ?? "";
//   res.json({ answer: "Echo: " + lastUser });
// });

// /* Routes métier */
// app.use("/api/nft", nftRouter);

// /* 404 */
// app.use((_req, res) => {
//   res.status(404).json({ ok: false, error: "not_found" });
// });

// /* Error handler (sécurité) */
// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   console.error(err);
//   res.status(500).json({ ok: false, error: "server_error" });
// });

// /* Démarrage */
// const PORT = Number(process.env.PORT || 3000);
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`API up on http://localhost:${PORT}`);
// });
// api/src/server.ts
// src/server.ts
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import session from "express-session";

// // Routes
// import authRouter from "./routes/auth.route";
// import investmentsRouter from "./routes/investments.route";
// import paymentsRouter from "./routes/payments.route";
// import { walletRouter } from "./routes/wallet.route";
// import nftRouter from "./routes/nft.route";

// const app = express();

// /* Middlewares globaux (ordre important) */
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//   credentials: true,                       // indispensable pour envoyer les cookies
// }));
// app.use(express.json({ limit: "2mb" }));

// // La session DOIT être avant toutes les routes qui l'utilisent
// app.use(session({
//   name: "sid",                             // nom du cookie (optionnel mais clair)
//   secret: process.env.SESSION_SECRET || "dev",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,                        // protège contre XSS
//     sameSite: "lax",                       // OK pour http://localhost
//     secure: false,                         // mettre true si HTTPS
//     path: "/",                             // visible sur tout le site
//   },
// }));

// /* Santé + home */
// app.get("/health", (_req, res) => res.json({ ok: true }));
// app.get("/", (_req, res) =>
//   res
//     .type("text")
//     .send("Invest-Immo API is running. Try /health or /wallets/:address/eth")
// );

// /* Routes métier (montage UNE SEULE FOIS chacune) */
// app.use("/auth", authRouter);                   // /auth/nonce, /auth/verify, /auth/me
// app.use("/wallets", walletRouter);
// app.use("/api/investments", investmentsRouter); // lit req.session.siwe/address
// app.use("/api/payments", paymentsRouter);
// app.use("/api/nft", nftRouter);                 // /api/nft/created, /owned, /mint, etc.

// /* 404 & erreurs */
// app.use((_req, res) => res.status(404).json({ ok: false, error: "not_found" }));
// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   console.error(err);
//   res.status(500).json({ ok: false, error: "server_error" });
// });

// /* Démarrage */
// const PORT = Number(process.env.PORT || 3000);
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`API up on http://localhost:${PORT}`);
// });



// import chatRoute from "./routes/chat";




// app.use(cors());
// app.use(express.json());

// // autres routes...
// app.use("/api/chat", chatRoute); // 👈 ajoute ceci

// app.listen(process.env.PORT || 8787, () =>
//   console.log("Server running on port " + (process.env.PORT || 8787))
// );

// src/server.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
//-----dashboard---
import portfolioRouter from "./routes/portfolio.route";


// --- Routes métier ---
import authRouter from "./routes/auth.route";
import investmentsRouter from "./routes/investments.route";
import paymentsRouter from "./routes/payments.route";
import { walletRouter } from "./routes/wallet.route";
import nftRouter from "./routes/nft.route";
// Chatbot (assure-toi que chat.ts fait `export default router`)
import chatRouter from "./routes/chat";

const app = express();

/* ----------------------------- Middlewares globaux ----------------------------- */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true, // indispensable si tu utilises les cookies de session côté front
  })
);

app.use(express.json({ limit: "2mb" }));

// La session doit être enregistrée AVANT les routes qui l'utilisent
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // protège contre XSS (le cookie n’est pas lisible en JS)
      sameSite: "lax", // OK pour http://localhost
      secure: false, // mets true en prod derrière HTTPS
      path: "/", // sur tout le site
    },
  })
);

/* ----------------------------------- Santé ----------------------------------- */
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.get("/", (_req: Request, res: Response) => {
  res
    .type("text")
    .send("Invest-Immo API is running. Try /health or /api/chat");
});

/* ----------------------------------- Routes ---------------------------------- */
// NOTE: garde les préfixes cohérents, surtout pour le front.
app.use("/auth", authRouter);                     // /auth/nonce, /auth/verify, /auth/me
app.use("/wallets", walletRouter);                // /wallets/:address/eth ...
app.use("/api/investments", investmentsRouter);   // /api/investments/*
app.use("/api/payments", paymentsRouter);         // /api/payments/*
app.use("/api/nft", nftRouter);                   // /api/nft/*
app.use("/api/chat", chatRouter);                 // /api/chat (POST)

/* ---------------------------------- 404 & err -------------------------------- */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: "not_found" });
});

app.use((
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[API ERROR]:", err);
  res.status(500).json({ ok: false, error: "server_error" });
});

/* --------------------------------- Démarrage --------------------------------- */
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API up on http://localhost:${PORT}`);
});


app.use(express.json());
