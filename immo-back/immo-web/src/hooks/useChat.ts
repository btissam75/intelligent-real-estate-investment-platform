import { useState } from "react";

type Message = { role: "system" | "user" | "assistant"; content: string };

export function useChat(apiUrl = "http://localhost:3000/api/chat"){
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Tu es un assistant utile." },
  ]);
  const [partial, setPartial] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setPartial("");
    setLoading(true);

    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await resp.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Erreur de génération" }]);
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Erreur serveur" }]);
    }

    setLoading(false);
  }

  return { messages, partial, send, loading };
}
