
import type { APIRoute } from "astro";
// @ts-expect-error cloudflare:workers is a Workers runtime module.
import { env } from "cloudflare:workers";

import { generateChatResponse } from "../../lib/assistant/chat-service";
import { getChatHistory, type ChatExchange } from "../../lib/assistant/chat-history";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Vérifier le format de la requête
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return Response.json(
      { error: "Content-Type doit être application/json" },
      { status: 415 }
    );
  }

  // 2. Lire et valider les données
  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 32768) {
      return Response.json(
        { error: "Requête trop volumineuse" },
        { status: 413 }
      );
    }

    body = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: "JSON invalide" },
      { status: 400 }
    );
  }

  const question =
    body !== null &&
    typeof body === "object" &&
    "question" in body
      ? body.question
      : undefined;

  if (
    typeof question !== "string" ||
    question.trim().length < 2 ||
    question.length > 1000
  ) {
    return Response.json(
      { error: "Question invalide (2 à 1000 caractères)" },
      { status: 400 }
    );
  }

  let history: ChatExchange[];
  try {
    history = getChatHistory(
      body !== null && typeof body === "object" && "history" in body
        ? body.history
        : undefined
    );
  } catch {
    return Response.json({ error: "Historique invalide" }, { status: 400 });
  }

  // 3. Appeler le service RAG + LLM
  try {
    const key = request.headers.get("CF-Connecting-IP") || clientAddress;
    const { success } = await env.CHAT_RATE_LIMITER.limit({ key });

    if (!success) {
      return Response.json(
        { success: false, error: "Trop de questions. Veuillez réessayer dans une minute." },
        {
          status: 429,
          headers: { "Retry-After": "60", "Cache-Control": "no-store" },
        }
      );
    }

    const stream = request.headers.get("accept")?.includes("text/event-stream") ?? false;
    const result = await generateChatResponse(question.trim(), stream, history);

    if (result.stream) {
      return new Response(result.stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store, no-transform",
        },
      });
    }

    return Response.json(
      {
        success: true,
        answer: result.answer,
        sources: result.sources,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GlowLink chat error:", error);

    return Response.json(
      {
        success: false,
        error: "Assistant temporairement indisponible",
      },
      { status: 502 }
    );
  }
};
