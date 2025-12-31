import React, { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    // 1) on pousse le message utilisateur sans élargir le type
    setMessages((prev) => [...prev, { role: "user" as const, content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2) on envoie le contexte au backend avec le typage correct
        body: JSON.stringify({ messages: [...messages, { role: "user", content: text } as Msg] }),
      });

      // si tu veux typer la réponse :
      const data: { ok?: boolean; reply?: string } = await res.json();
      const reply = data?.reply ?? "Désolé, je n’ai pas compris.";

      // 3) on pousse la réponse en gardant le literal type
      setMessages((prev) => [...prev, { role: "assistant" as const, content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Impossible de joindre l’API pour le moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", height: "100%" }}>
      <div ref={scrollerRef} style={{ overflow: "auto", padding: "8px 0 96px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "10px 0" }}>
            <div
              style={{
                maxWidth: "76%",
                padding: "12px 14px",
                borderRadius: 16,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "#1c2546" : "#121a33",
                color: "#e6e9ff",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#121a33", color: "#e6e9ff", borderRadius: 16, padding: "12px 14px" }}>…</div>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "grid", gridTemplateColumns: "1fr 46px", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Écrivez un message…"
          style={{ background: "#0d1330", color: "#e8ebff", border: "1px solid #1d2440", borderRadius: 10, padding: "10px 12px" }}
        />
        <button onClick={send} style={{ borderRadius: 10, border: "1px solid #1d2440", background: "linear-gradient(135deg,#7c3aed,#ef4444)", color: "white", fontWeight: 800 }}>
          ➤
        </button>
      </div>
    </div>
  );
}
