import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function askLLM(system: string, messages: {role:"user"|"assistant"|"system", content:string}[]) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role:"system", content: system }, ...messages],
    temperature: 0.2,
  });
  return resp.choices[0]?.message?.content ?? "";
}
