// api/src/services/providerFactory.ts
import { LLMProvider } from "./llm";
import { OpenAIProvider } from "./providers/openai";
import { LocalHTTPProvider } from "./providers/localHttp";

export function makeProvider(): LLMProvider {
  const kind = process.env.LLM_PROVIDER || "openai"; // "openai" | "local"
  if (kind === "local") return new LocalHTTPProvider(process.env.LOCAL_LLM_URL!, process.env.LOCAL_LLM_KEY);
  return new OpenAIProvider();
}
