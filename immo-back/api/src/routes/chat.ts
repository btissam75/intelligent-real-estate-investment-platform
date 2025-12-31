// // src/routes/chat.ts
// import { Router, Request, Response } from "express";
// import dotenv from "dotenv";
// dotenv.config();

// type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// // Réponse attendue de ton modèle (Colab / ngrok)
// interface ModelReply {
//   answer?: string;
//   // ...ajoute d'autres champs si ton API en renvoie
// }

// // Réponse attendue de l'API Chat Completions d'OpenAI
// interface OpenAIChatResponse {
//   id: string;
//   choices: Array<{
//     index: number;
//     finish_reason: string | null;
//     message: { role: string; content: string };
//   }>;
// }

// const chatRouter = Router();

// chatRouter.post("/", async (req: Request, res: Response) => {
//   try {
//     const { messages } = req.body as { messages?: ChatMessage[] };

//     if (!Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "messages must be a non-empty array" });
//     }

//     // ---- Mode A: ton modèle (Colab/ngrok) ----
//     const MODEL_URL = process.env.MODEL_URL?.replace(/\/$/, "");
//     if (MODEL_URL) {
//       const r = await fetch(`${MODEL_URL}/predict`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(process.env.MODEL_API_KEY ? { "x-api-key": process.env.MODEL_API_KEY } : {}),
//         },
//         body: JSON.stringify({ messages }),
//       });

//       if (!r.ok) {
//         const text = await r.text();
//         throw new Error(`Model error ${r.status}: ${text}`);
//       }

//       // ✅ CAST EXPLICITE
//       const data = (await r.json()) as ModelReply;
//       const answer = data.answer ?? "(pas de réponse du modèle)";
//       return res.json({ answer });
//     }

//     // ---- Mode B: OpenAI ----
//     const OPENAI_KEY = process.env.OPENAI_API_KEY;
//     const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
//     if (!OPENAI_KEY) {
//       return res.status(500).json({ error: "Missing OPENAI_API_KEY or MODEL_URL" });
//     }

//     const sys: ChatMessage = {
//       role: "system",
//       content:
//         "Tu es Invest-Assistant, spécialisé en investissement immobilier/crypto. Réponds concrètement.",
//     };

//     const r = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENAI_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: OPENAI_MODEL,
//         messages: [sys, ...messages],
//         temperature: 0.3,
//       }),
//     });

//     if (!r.ok) {
//       const text = await r.text();
//       throw new Error(`OpenAI error ${r.status}: ${text}`);
//     }

//     // ✅ CAST EXPLICITE
//     const data = (await r.json()) as OpenAIChatResponse;

//     // ✅ ACCÈS TYPÉ À choices
//     const answer =
//       data?.choices?.[0]?.message?.content ?? "(pas de réponse du modèle OpenAI)";
//       return res.json({ answer });
//     } catch (e: any) {
//       console.error("[/api/chat] error:", e);
//       return res.status(500).json({ error: e?.message || "server_error" });
//     }
// });

//  export default chatRouter;
// src/routes/chat.ts
import { Router } from "express";
import { askLLM } from "../services/llm";
import { detectIntent } from "../services/intents";
import { simulateRent } from "../services/knowledge";

const router = Router();

const SYSTEM = `Tu es un assistant pour une plateforme d’investissement immo/crypto.
- Explique clairement, pas de conseil financier personnalisé.
- Si on parle de paiement, renvoie un objet {action:"open_payment", amountEth, toAddress} en JSON dans un bloc triple backticks.
- Si on demande une simulation immo (location), renvoie un tableau simple et une explication.`;

router.post("/", async (req, res) => {
  try {
    const messages = req.body?.messages ?? [];
    const last = messages.at(-1)?.content ?? "";
    const intent = detectIntent(last);

    if (intent.type === "FAQ") {
      return res.json({ ok: true, reply: intent.hit.a });
    }

    if (intent.type === "SIM_RENT") {
      const r = simulateRent(intent.input);
      const reply = [
        `• Revenu net mensuel ≈ ${r.net.toFixed(2)} €`,
        `• Net annuel ≈ ${r.yearly.toFixed(2)} €`,
        `• Payback ≈ ${r.paybackYears.toFixed(1)} ans`,
      ].join("\n");
      return res.json({ ok: true, reply });
    }

    if (intent.type === "PAYMENT_INIT") {
      // renvoyer une "action" à l’UI
      const payload = `\`\`\`json
{ "action": "open_payment", "amountEth": "${intent.payload.amountEth}", "toAddress": "${intent.payload.toAddress}" }
\`\`\``;
      return res.json({ ok: true, reply: `Je prépare le paiement.\n${payload}` });
    }

    // Fallback vers LLM
    const reply = await askLLM(SYSTEM, messages);
    res.json({ ok: true, reply });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

export default router;
