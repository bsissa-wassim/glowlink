
// `cloudflare:workers` is provided by the Workers runtime; its declarations
// may not be available to the local TypeScript resolver.
// @ts-expect-error Runtime-only Cloudflare module.
import { env } from "cloudflare:workers";
import { documents } from "./document-catalog";

type CatalogDocument = (typeof documents)[number];

type RetrievalReason = "semantic" | "rule" | "policy";

type SelectedDocument = {
  doc: CatalogDocument;
  score: number | null;
  reason: RetrievalReason;
};

export async function retrieveKnowledge(question: string) {
  const query = question.trim();

  if (!query || query.length > 1000) {
    throw new Error("Question invalide");
  }

  // 1. Transformer la question en embedding BGE-M3
  const result = await env.AI.run("@cf/baai/bge-m3", {
    text: [query],
  });

  const embedding = result.data?.[0];

  if (!embedding || embedding.length !== 1024) {
    throw new Error("Embedding invalide");
  }

  // 2. Rechercher les documents les plus pertinents
  const search = await env.VECTORIZE.query(embedding, {
    topK: 3,
    returnMetadata: "none",
  });

  const selected = new Map<string, SelectedDocument>();

  function addDocument(
    id: string,
    reason: RetrievalReason,
    score: number | null = null
  ) {
    const doc = documents.find((item) => item.id === id);

    if (doc && !selected.has(id)) {
      selected.set(id, { doc, reason, score });
    }
  }

  // 3. Garantir le catalogue complet pour les demandes
  // concernant les interventions
  const interventionIntent =
    /interventions?|chirurgies?|op[eé]rations?|rhinoplastie|bl[eé]pharoplastie|lifting|lipofilling|otoplastie/i;

  if (interventionIntent.test(query)) {
    addDocument("interventions", "rule");
  }

  // 4. Ajouter les résultats sémantiques
  for (const match of search.matches ?? []) {
    addDocument(match.id, "semantic", match.score);
  }

  // 5. Toujours inclure les règles de GlowLink
  addDocument("orientation", "policy");

  // 6. Récupérer les documents complets depuis Workers KV
  const retrieved = await Promise.all(
    [...selected.values()].map(async ({ doc, score, reason }) => {
      const content = await env.KNOWLEDGE.get(doc.key);

      if (content === null) {
        throw new Error(`Document KV introuvable : ${doc.key}`);
      }

      return {
        id: doc.id,
        key: doc.key,
        score,
        reason,
        content,
      };
    })
  );

  // 7. Construire le contexte intégral pour le futur LLM
  const context = retrieved
    .map(
      (doc) =>
        `--- SOURCE: ${doc.key} ---\n` +
        doc.content +
        `\n--- FIN SOURCE ---`
    )
    .join("\n\n");

  return {
    documents: retrieved,
    context,
  };
}
