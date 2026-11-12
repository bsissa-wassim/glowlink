
import type { APIRoute } from "astro";
// @ts-ignore -- Provided by the Cloudflare Workers runtime.
import { env } from "cloudflare:workers";
import { retrieveKnowledge } from "../../../lib/assistant/knowledge-retriever";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get("Authorization");
  const indexAdminToken = env.INDEX_ADMIN_TOKEN;

  if (
    !indexAdminToken ||
    token !== `Bearer ${indexAdminToken}`
  ) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json() as {
      question?: unknown;
    };

    if (
      typeof body.question !== "string" ||
      !body.question.trim() ||
      body.question.length > 1000
    ) {
      return Response.json(
        { error: "Question invalide" },
        { status: 400 }
      );
    }

    const result = await retrieveKnowledge(body.question);

    return Response.json({
      success: true,
      documents: result.documents.map((doc) => ({
        id: doc.id,
        key: doc.key,
        score: doc.score,
        reason: doc.reason,
        characters: doc.content.length,
      })),
      context: result.context,
    });
  } catch (error) {
    console.error("Retrieval failed", error);

    return Response.json(
      { error: "Retrieval failed" },
      { status: 500 }
    );
  }
};
