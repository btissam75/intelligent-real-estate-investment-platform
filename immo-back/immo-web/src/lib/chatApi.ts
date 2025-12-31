export type ChatRole = "user" | "assistant" | "system";
export type ChatMsg = { role: ChatRole; content: string };

const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function sendToChatAPI(messages: ChatMsg[]) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // si tu utilises des sessions
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return (await res.json()) as { ok: boolean; reply?: string; error?: string };
}
