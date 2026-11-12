
// `cloudflare:workers` is provided by the Workers runtime but may be absent
// from the project's TypeScript module declarations.
// @ts-ignore
import { env } from "cloudflare:workers";
import { documents } from "./document-catalog";

export async function indexKnowledge() {
  // 1. Récupérer les descriptions
  const descriptions = documents.map(
    (doc) => doc.description
  );

  // 2. Générer tous les embeddings avec BGE-M3
  const result = await env.AI.run("@cf/baai/bge-m3", {
    text: descriptions,
  });

  const embeddings = result.data;

  if (!embeddings || embeddings.length !== documents.length) {
    throw new Error("Erreur lors de la génération des embeddings");
  }

  // 3. Préparer les vecteurs
  const vectors = documents.map((doc, index) => {
    const values = embeddings[index];

    if (!values || values.length !== 1024) {
      throw new Error(`Embedding invalide : ${doc.id}`);
    }

    return {
      id: doc.id,
      values,
      metadata: {
        kvKey: doc.key,
      },
    };
  });

  // 4. Enregistrer dans Vectorize
  await env.VECTORIZE.upsert(vectors);

  return {
    indexed: vectors.length,
    documents: documents.map((doc) => doc.id),
  };
}
