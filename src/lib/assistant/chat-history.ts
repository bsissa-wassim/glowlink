export type ChatExchange = {
  question: string;
  answer: string;
};

export function getChatHistory(value: unknown = []): ChatExchange[] {
  if (!Array.isArray(value)) {
    throw new Error("Historique invalide");
  }

  const history: ChatExchange[] = value.slice(-2).map((exchange) => {
    if (
      exchange === null || typeof exchange !== "object" ||
      typeof exchange.question !== "string" ||
      typeof exchange.answer !== "string" ||
      !exchange.question.trim() || exchange.question.length > 1000 ||
      !exchange.answer.trim()
    ) {
      throw new Error("Historique invalide");
    }

    return { question: exchange.question.trim(), answer: exchange.answer.trim() };
  });

  let size = history.reduce((total, exchange) => total + exchange.question.length + exchange.answer.length, 0);
  while (size > 6000 && history.length) {
    const oldest = history.shift()!;
    size -= oldest.question.length + oldest.answer.length;
  }

  return history;
}
