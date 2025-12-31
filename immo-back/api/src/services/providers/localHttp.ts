// api/src/services/providers/localHttp.ts
import axios from "axios";
import { LLMProvider, ChatMessage } from "../llm";

export class LocalHTTPProvider implements LLMProvider {
  constructor(private baseUrl: string, private apiKey?: string) {}
  async chat({ messages, system, temperature=0.7, maxTokens=512 }:{
    messages: ChatMessage[]; temperature?:number; maxTokens?:number; system?:string;
  }) {
    const { data } = await axios.post(`${this.baseUrl}/chat`, {
      messages, system, temperature, max_new_tokens: maxTokens, api_key: this.apiKey
    }, { timeout: 60000 });
    return { reply: data.reply, usage: data.usage };
  }
}
