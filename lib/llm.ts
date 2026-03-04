import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";
export type Message = { role: Role; content: string | any[]; name?: string; tool_call_id?: string; };
export type InvokeParams = { messages: Message[]; tools?: any[]; toolChoice?: any; maxTokens?: number; };
export type InvokeResult = {
  id: string; created: number; model: string;
  choices: Array<{ index: number; message: { role: Role; content: string | any[]; tool_calls?: any[]; }; finish_reason: string | null; }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
};

const resolveApiUrl = () => ENV.forgeApiUrl ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.forgeApiKey) throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: params.messages.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : m.content })),
    max_tokens: params.maxTokens || 32768,
    thinking: { budget_tokens: 128 }
  };
  if (params.tools?.length) payload.tools = params.tools;
  if (params.toolChoice) payload.tool_choice = params.toolChoice;
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${ENV.forgeApiKey}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`LLM invoke failed: ${response.status} ${await response.text()}`);
  return await response.json() as InvokeResult;
}
