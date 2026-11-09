import type { InterventionPhotoKey } from "./interventionPhotos";

export type CategoryId = "visage" | "corps" | "reparatrice";

export interface Intervention {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  zone: string;
  photo: InterventionPhotoKey;
}

export const interventionCategories = [
  { id: "visage", label: "Visage", heading: "Interventions du visage" },
  { id: "corps", label: "Corps", heading: "Interventions du corps" },
  { id: "reparatrice", label: "Réparatrice", heading: "Chirurgie réparatrice / malformations" },
] as const;

export const consultationResources = {
  cosmetic: "https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/advice/before-you-have-a-cosmetic-procedure/",
  reconstructive: "https://www.nhs.uk/conditions/cleft-lip-and-palate/treatment/",
} as const;

export const interventions: readonly Intervention[] = [
  {
    id: "rhinoplastie", category: "visage", name: "Rhinoplastie", zone: "Nez et profil",
    description: "Intervention visant à harmoniser la forme du nez tout en respectant l’équilibre du visage.",
    photo: "rhinoplastie",
  },
  {
    id: "blepharoplastie", category: "visage", name: "Blépharoplastie", zone: "Paupières",
    description: "Correction des paupières pour rafraîchir le regard et atténuer l’aspect fatigué.",
    photo: "blepharoplastie",
  },
  {
    id: "liposuccion-double-menton", category: "visage", name: "Liposuccion du double menton", zone: "Menton et ovale du visage",
    description: "Affinement de l’ovale du visage par retrait ciblé de l’excès graisseux sous le menton.",
    photo: "liposuccion-double-menton",
  },
  {
    id: "bichectomie", category: "visage", name: "Bichectomie", zone: "Joues",
    description: "Réduction du volume des joues pour redessiner les contours du visage.",
    photo: "bichectomie",
  },
  {
    id: "lifting-cervico-facial", category: "visage", name: "Lifting cervico-facial", zone: "Bas du visage et cou",
    description: "Correction du relâchement du bas du visage et du cou pour un aspect plus tonique.",
    photo: "lifting-cervico-facial",
  },
  {
    id: "lifting-temporal", category: "visage", name: "Lifting temporal", zone: "Tempes et regard",
    description: "Remonte légèrement la partie externe du regard pour un effet plus ouvert et plus frais.",
    photo: "lifting-temporal",
  },
  {
    id: "lifting-frontal", category: "visage", name: "Lifting frontal", zone: "Front",
    description: "Atténue les signes de relâchement du front et redonne de la douceur à l’expression.",
    photo: "lifting-frontal",
  },
  {
    id: "fox-eyes", category: "visage", name: "Fox Eyes", zone: "Contour du regard",
    description: "Technique destinée à allonger visuellement le regard avec un effet étiré et élégant.",
    photo: "fox-eyes",
  },
  {
    id: "otoplastie", category: "visage", name: "Otoplastie", zone: "Oreilles",
    description: "Correction de la forme ou de la position des oreilles décollées.",
    photo: "otoplastie",
  },
  {
    id: "lipofilling-visage", category: "visage", name: "Lipofilling du visage", zone: "Volumes du visage",
    description: "Réinjection de graisse autologue pour restaurer les volumes du visage naturellement.",
    photo: "lipofilling-visage",
  },
  {
    id: "prothese-mammaire", category: "corps", name: "Prothèse mammaire", zone: "Poitrine",
    description: "Augmentation du volume de la poitrine à l’aide d’implants mammaires.",
    photo: "decollete",
  },
  {
    id: "lifting-seins", category: "corps", name: "Lifting des seins", zone: "Poitrine",
    description: "Remonte et redessine la poitrine en corrigeant son relâchement.",
    photo: "epaules",
  },
  {
    id: "lifting-seins-prothese", category: "corps", name: "Lifting des seins avec prothèse", zone: "Poitrine",
    description: "Associe remise en tension et augmentation du volume mammaire.",
    photo: "decollete",
  },
  {
    id: "lifting-bras", category: "corps", name: "Lifting des bras", zone: "Bras",
    description: "Retend la peau des bras en cas de relâchement cutané marqué.",
    photo: "bras",
  },
  {
    id: "lifting-cuisses", category: "corps", name: "Lifting des cuisses", zone: "Cuisses",
    description: "Améliore la fermeté et le galbe de la face interne ou externe des cuisses.",
    photo: "jambes",
  },
  {
    id: "lipoedeme", category: "corps", name: "Lipœdème", zone: "Zones concernées par le lipœdème",
    description: "Prise en charge chirurgicale ciblée pour améliorer le confort et la silhouette.",
    photo: "jambes",
  },
  {
    id: "lifting-fesses", category: "corps", name: "Lifting des fesses", zone: "Fesses",
    description: "Retend et repositionne les tissus pour redessiner le contour des fesses.",
    photo: "bassin",
  },
  {
    id: "bodylift", category: "corps", name: "Bodylift", zone: "Tronc et ceinture corporelle",
    description: "Intervention globale pour retendre les tissus du tronc après une perte de poids importante.",
    photo: "silhouette",
  },
  {
    id: "lipofilling-mollets", category: "corps", name: "Lipofilling des mollets", zone: "Mollets",
    description: "Augmentation harmonieuse du volume des mollets par transfert de graisse.",
    photo: "mollets",
  },
  {
    id: "labiaplastie", category: "corps", name: "Labiaplastie / Nymphoplastie", zone: "Chirurgie intime",
    description: "Intervention de chirurgie intime visant à corriger une gêne fonctionnelle ou esthétique.",
    photo: "consultation",
  },
  {
    id: "fente-labiale", category: "reparatrice", name: "Fente labiale", zone: "Lèvre",
    description: "Prise en charge chirurgicale visant à restaurer l’esthétique et la fonction de la lèvre.",
    photo: "famille",
  },
  {
    id: "fente-palatine", category: "reparatrice", name: "Fente palatine", zone: "Palais",
    description: "Intervention réparatrice destinée à corriger l’ouverture du palais et améliorer la fonction.",
    photo: "enfant",
  },
];

export function interventionDetailPath(id: Intervention["id"]): string {
  return `/interventions/${id}`;
}
