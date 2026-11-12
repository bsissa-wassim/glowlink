
// Cloudflare provides this module at runtime; it may be absent from the app's TypeScript declarations.
// @ts-expect-error cloudflare:workers is a Workers runtime module
import { env } from "cloudflare:workers";

import { retrieveKnowledge } from "./knowledge-retriever";
import { buildSystemPrompt } from "./prompt-builder";
import { getChatHistory, type ChatExchange } from "./chat-history";

const MODEL = "@cf/zai-org/glm-4.7-flash" as const;

const SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_knowledge",
    description: "Consulter les informations officielles de GlowLink sur les services, les interventions, le parcours patient et les offres. À utiliser pour toute question factuelle sur ces sujets.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "La question documentaire du visiteur, en conservant les sujets et les interventions mentionnés.",
          minLength: 2,
          maxLength: 1000,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

type ModelEvent = {
  error?: unknown;
  response?: string;
  choices?: {
    delta?: {
      content?: string;
      tool_calls?: {
        index: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }[];
    };
  }[];
};

async function* readModelEvents(stream: ReadableStream<Uint8Array>, signal: AbortSignal) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  let buffer = "";

  try {
    signal.throwIfAborted();
    while (true) {
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      buffer += decoder.decode(value, { stream: !done });
      let boundary: RegExpExecArray | null;

      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const event = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const data = event.split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""))
          .join("\n");
        if (!data) continue;
        if (data === "[DONE]") return;

        const chunk: ModelEvent = JSON.parse(data);
        if (chunk.error || /^event:\s*error\s*$/m.test(event)) {
          throw new Error("Erreur du flux LLM");
        }
        yield chunk;
      }

      if (done) throw new Error("Flux LLM interrompu");
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function generateChatResponse(question: string, stream = false, history: ChatExchange[] = []) {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...getChatHistory(history).flatMap<ChatMessage>((exchange) => [
      { role: "user", content: exchange.question },
      { role: "assistant", content: exchange.answer },
    ]),
    { role: "user", content: question },
  ];
  const options = {
    temperature: 0.2,
    max_completion_tokens: 900,
    chat_template_kwargs: { enable_thinking: false },
    tools: [SEARCH_TOOL],
    parallel_tool_calls: false,
  };

  const sources: string[] = [];
  const abortController = new AbortController();

  async function* generateAnswer() {
    let hasAnswer = false;
    for (let round = 0; round < 2; round++) {
      abortController.signal.throwIfAborted();
      const result = await env.AI.run(MODEL, {
        ...options,
        messages,
        tool_choice: round === 0 ? "auto" : "none",
        stream: true,
      });
      if (!(result instanceof ReadableStream)) throw new Error("Flux LLM invalide");

      let toolCall: ToolCall | undefined;
      let content = "";
      for await (const event of readModelEvents(result, abortController.signal)) {
        const delta = event.choices?.[0]?.delta;
        for (const fragment of delta?.tool_calls ?? []) {
          if (round !== 0 || fragment.index !== 0) {
            throw new Error("Recherche documentaire supplémentaire refusée");
          }
          toolCall ??= { id: "", type: "function", function: { name: "", arguments: "" } };
          toolCall.id += fragment.id ?? "";
          toolCall.function.name += fragment.function?.name ?? "";
          toolCall.function.arguments += fragment.function?.arguments ?? "";
        }

        const text = delta?.content ?? event.response;
        if (typeof text === "string" && text) {
          content += text;
          yield text;
        }
      }

      if (!toolCall) {
        hasAnswer = Boolean(content.trim());
        break;
      }
      if (!toolCall.id || toolCall.function.name !== SEARCH_TOOL.function.name) {
        throw new Error("Appel documentaire invalide");
      }
      const args: unknown = JSON.parse(toolCall.function.arguments);
      if (
        args === null || typeof args !== "object" ||
        !("query" in args) || typeof args.query !== "string" ||
        args.query.trim().length < 2 || args.query.length > 1000
      ) {
        throw new Error("Question documentaire invalide");
      }

      abortController.signal.throwIfAborted();
      const knowledge = await retrieveKnowledge(args.query.trim());
      sources.push(...knowledge.documents.map((doc) => doc.key));
      messages.push(
        { role: "assistant", content: content || null, tool_calls: [toolCall] },
        { role: "tool", tool_call_id: toolCall.id, content: knowledge.context }
      );
    }
    if (!hasAnswer) throw new Error("Réponse LLM vide ou invalide");
  }

  const answerChunks = generateAnswer();
  if (stream) {
    const encoder = new TextEncoder();
    let cancelled = false;
    const responseStream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await answerChunks.next();
          if (cancelled) return;
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } else {
            const event = JSON.stringify({ choices: [{ delta: { content: value } }] });
            controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          }
        } catch (error) {
          if (cancelled) return;
          console.error("GlowLink streaming error:", error);
          controller.enqueue(encoder.encode('event: error\ndata: {"error":"Assistant temporairement indisponible"}\n\n'));
          controller.close();
        }
      },
      async cancel() {
        cancelled = true;
        abortController.abort();
        await answerChunks.return(undefined);
      },
    });
    return { stream: responseStream, sources, model: MODEL };
  }

  let answer = "";
  for await (const text of answerChunks) answer += text;
  return { answer: answer.trim(), stream: null, sources, model: MODEL };
}
