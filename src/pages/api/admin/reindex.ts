
import type { APIRoute } from "astro";
// @ts-ignore -- Provided by the Cloudflare Workers runtime.
import { env } from "cloudflare:workers";
import { indexKnowledge } from "../../../lib/assistant/knowledge-indexer";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Autorisation obligatoire avant tout accès à Workers AI
  const secret = env.INDEX_ADMIN_TOKEN;
  const authorization = request.headers.get("Authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Générer les embeddings et mettre à jour Vectorize
    const result = await indexKnowledge();

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Knowledge indexing failed", error);

    return Response.json(
      { error: "Indexing failed" },
      { status: 500 }
    );
  }
};
