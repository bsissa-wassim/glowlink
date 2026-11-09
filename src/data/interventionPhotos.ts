const rhinoplastie = "/images/interventions/rhinoplastie.webp";
const blepharoplastie = "/images/interventions/blepharoplastie.webp";
const doubleMenton = "/images/interventions/liposuccion-double-menton.webp";
const bichectomie = "/images/interventions/bichectomie.webp";
const liftingCervicoFacial = "/images/interventions/lifting-cervico-facial.webp";
const liftingTemporal = "/images/interventions/lifting-temporal.webp";
const liftingFrontal = "/images/interventions/lifting-frontal.webp";
const foxEyes = "/images/interventions/fox-eyes.webp";
const otoplastie = "/images/interventions/otoplastie.webp";
const lipofillingVisage = "/images/interventions/lipofilling-visage.webp";
const decollete = "/images/interventions/decollete.jpg";
const epaules = "/images/interventions/epaules.jpg";
const bras = "/images/interventions/bras.jpg";
const jambes = "/images/interventions/jambes.jpg";
const mollets = "/images/interventions/mollets.jpg";
const silhouette = "/images/interventions/silhouette.jpg";
const bassin = "/images/interventions/bassin.jpg";
const consultation = "/images/interventions/consultation.jpg";
const famille = "/images/interventions/consultation-famille.jpg";
const enfant = "/images/interventions/consultation-enfant.jpg";

export interface InterventionPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string | null;
  source: string | null;
  position: string;
  zoom?: number;
}

const suppliedPhoto = (src: string, alt: string): InterventionPhoto => ({
  src, alt, width: 1200, height: 900, credit: null, source: null, position: "center",
});

// Visage : visuels fournis. Autres photographies : https://www.pexels.com/license/.
export const interventionPhotos = {
  rhinoplastie: { ...suppliedPhoto(rhinoplastie, "Profil du visage mettant le nez en évidence."), position: "70% center" },
  blepharoplastie: { ...suppliedPhoto(blepharoplastie, "Visage de trois quarts avec les paupières fermées."), position: "60% center" },
  "liposuccion-double-menton": { ...suppliedPhoto(doubleMenton, "Profil du bas du visage, une main posée sous le menton."), position: "65% center" },
  bichectomie: suppliedPhoto(bichectomie, "Visage de trois quarts, une main posée sur la joue."),
  "lifting-cervico-facial": { ...suppliedPhoto(liftingCervicoFacial, "Profil mettant en valeur la mâchoire et le cou."), position: "65% center" },
  "lifting-temporal": suppliedPhoto(liftingTemporal, "Visage de trois quarts, une main posée sur la tempe."),
  "lifting-frontal": suppliedPhoto(liftingFrontal, "Portrait de face, une main posée au niveau du front."),
  "fox-eyes": { ...suppliedPhoto(foxEyes, "Gros plan du regard de trois quarts."), position: "60% center" },
  otoplastie: { ...suppliedPhoto(otoplastie, "Profil avec l’oreille dégagée et les cheveux relevés."), position: "35% center" },
  "lipofilling-visage": suppliedPhoto(lipofillingVisage, "Portrait du visage de trois quarts."),
  decollete: {
    src: decollete, width: 1400, height: 1867, alt: "Détail du décolleté d’un haut blanc en satin.", credit: "Анастасия",
    source: "https://www.pexels.com/photo/close-up-shot-of-a-woman-in-white-tank-top-10990102/", position: "center",
  },
  epaules: {
    src: epaules, width: 1400, height: 933, alt: "Femme enveloppée dans une serviette appliquant une crème sur son épaule.", credit: "Kaboompics",
    source: "https://www.pexels.com/photo/topless-woman-applying-lotion-on-arm-5240672/", position: "center",
  },
  bras: {
    src: bras, width: 1400, height: 933, alt: "Femme appliquant une lotion sur son bras près d’une fenêtre.", credit: "Yaroslav Shuraev",
    source: "https://www.pexels.com/photo/a-woman-applying-lotion-on-her-arm-6811383/", position: "center",
  },
  jambes: {
    src: jambes, width: 1400, height: 933, alt: "Mains appliquant une lotion sur les jambes dans un cadre lumineux.", credit: "Sora Shimazaki",
    source: "https://www.pexels.com/photo/woman-doing-leg-massage-with-cream-5938553/", position: "center",
  },
  mollets: {
    src: mollets, width: 1400, height: 2100, alt: "Soin hydratant appliqué sur une jambe.", credit: "Kaboompics",
    source: "https://www.pexels.com/photo/woman-hand-applying-a-cream-on-the-skin-of-her-leg-4735915/", position: "bottom",
  },
  silhouette: {
    src: silhouette, width: 1400, height: 935, alt: "Détail de la taille et de l’abdomen en tenue blanche.", credit: "cottonbro studio",
    source: "https://www.pexels.com/photo/close-up-of-a-woman-in-white-lingerie-8588428/", position: "center",
  },
  bassin: {
    src: bassin, width: 1400, height: 2096, alt: "Silhouette de dos au niveau des hanches, en tenue blanche.", credit: "Dziana Hasanbekava",
    source: "https://www.pexels.com/photo/woman-in-white-tank-top-and-white-leggings-with-her-hands-on-her-waist-6740607/", position: "bottom",
    zoom: 2,
  },
  consultation: {
    src: consultation, width: 1400, height: 933, alt: "Échange entre une médecin et une personne en consultation.", credit: "cottonbro studio",
    source: "https://www.pexels.com/photo/a-doctor-talking-the-patient-7579831/", position: "center",
  },
  famille: {
    src: famille, width: 1400, height: 935, alt: "Une mère et son enfant échangent avec une médecin en consultation.", credit: "Pavel Danilyuk",
    source: "https://www.pexels.com/photo/people-sitting-at-the-table-7653328/", position: "center",
  },
  enfant: {
    src: enfant, width: 1400, height: 935, alt: "Une médecin écoute une enfant et prend des notes.", credit: "Pavel Danilyuk",
    source: "https://www.pexels.com/photo/woman-in-white-lab-coat-listening-to-a-girl-and-writing-down-notes-5998448/", position: "center",
  },
} satisfies Record<string, InterventionPhoto>;

export type InterventionPhotoKey = keyof typeof interventionPhotos;

export function interventionImageSrcSet(photo: InterventionPhoto, format: "avif" | "webp"): string {
  const filename = photo.src.slice(photo.src.lastIndexOf("/") + 1);
  const stem = filename.replace(/\.[^.]+$/, "");
  return [480, 800, 1200].map((width) => `/images/interventions/responsive/${stem}-${width}.${format} ${width}w`).join(", ");
}
