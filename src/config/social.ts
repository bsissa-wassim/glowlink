interface SocialAccount {
  id: "instagram" | "facebook" | "tiktok";
  label: string;
  url: string | null;
}

// Ajouter les URL officielles pour activer les liens.
export const socialAccounts: readonly SocialAccount[] = [
  { id: "instagram", label: "Instagram", url: null },
  { id: "facebook", label: "Facebook", url: null },
  { id: "tiktok", label: "TikTok", url: null },
];
