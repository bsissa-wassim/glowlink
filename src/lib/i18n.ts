import type { AstroGlobal } from "astro";

export type Language = "fr" | "en";

export function getLanguage({ url, cookies }: Pick<AstroGlobal, "url" | "cookies">): Language {
  const requested = url.searchParams.get("lang");
  if (requested === "fr" || requested === "en") return requested;
  return cookies.get("glowlink-lang")?.value === "en" ? "en" : "fr";
}

export const createTranslator = (lang: Language) => (fr: string, en: string) => lang === "en" ? en : fr;

export function localizedHref(href: string, lang: Language): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://glowlink.local");
  url.searchParams.set("lang", lang);
  return `${url.pathname}${url.search}${url.hash}`;
}
