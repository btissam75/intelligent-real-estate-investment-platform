import OpenAI from "openai";
import { LLMProvider, ChatMessage } from "../llm";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async chat({
    messages,
    system,
    temperature = 0.7,
    maxTokens = 512,
  }: {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    system?: string;
  }) {
    const fullMessages = system
      ? [{ role: "system", content: system }, ...messages]
      : messages;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: fullMessages as any,
      temperature,
      max_tokens: maxTokens,
    });

    const reply = response.choices?.[0]?.message?.content ?? "";
    return {
      reply,
      usage: response.usage,
    };
  }
}
