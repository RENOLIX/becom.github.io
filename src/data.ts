export type Product = {
  id: string;
  name: string;
  category: string;
  age: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
  imageUrl?: string;
  sprite: number;
  stock: number;
  description: string;
  skills: string[];
};

export const products: Product[] = [
  { id: "fusee-explorateur", name: "Fusée explorateur", category: "Imagination", age: "3-5 ans", price: 4490, oldPrice: 5190, rating: 4.9, reviews: 84, badge: "Best-seller", color: "#dfeeff", sprite: 0, stock: 18, description: "Une fusée en bois robuste pour inventer des missions spatiales à l'infini.", skills: ["Imagination", "Motricité fine", "Jeu libre"] },
  { id: "anneaux-arc-en-ciel", name: "Anneaux arc-en-ciel", category: "Éveil", age: "0-2 ans", price: 2890, rating: 4.8, reviews: 62, badge: "Dès 12 mois", color: "#effbe9", sprite: 1, stock: 26, description: "Des anneaux faciles à saisir pour découvrir les tailles, l'équilibre et les couleurs.", skills: ["Coordination", "Couleurs", "Logique"] },
  { id: "puzzle-safari", name: "Puzzle Safari", category: "Puzzles", age: "3-5 ans", price: 3290, rating: 4.9, reviews: 47, badge: "Nouveau", color: "#fff3cb", sprite: 2, stock: 12, description: "Un puzzle animalier en bois aux pièces épaisses, pensé pour les petites mains.", skills: ["Observation", "Animaux", "Patience"] },
  { id: "camera-petit-reporter", name: "Caméra petit reporter", category: "Imagination", age: "6-8 ans", price: 5990, oldPrice: 6490, rating: 4.7, reviews: 39, color: "#e8edff", sprite: 3, stock: 9, description: "Une caméra-jouet tactile pour cadrer le monde et inventer ses propres reportages.", skills: ["Créativité", "Expression", "Jeu de rôle"] },
  { id: "blocs-architecte", name: "Blocs petit architecte", category: "Construction", age: "3-5 ans", price: 3990, rating: 4.8, reviews: 71, color: "#ffe9e7", sprite: 4, stock: 21, description: "Des formes colorées à empiler pour construire des villes, ponts et histoires.", skills: ["Construction", "Équilibre", "Créativité"] },
  { id: "ours-nino", name: "Ours Nino", category: "Peluches", age: "0-2 ans", price: 3790, rating: 5, reviews: 93, badge: "Coup de cœur", color: "#edf5ff", sprite: 5, stock: 15, description: "Un compagnon très doux, avec une écharpe bleue et un rembourrage moelleux.", skills: ["Réconfort", "Émotions", "Histoires"] },
  { id: "cube-des-decouvertes", name: "Cube des découvertes", category: "Éveil", age: "0-2 ans", price: 7290, rating: 4.9, reviews: 55, badge: "Montessori", color: "#f3f0ff", sprite: 6, stock: 7, description: "Cinq faces d'activités pour manipuler, tourner, trier et recommencer.", skills: ["Motricité", "Formes", "Concentration"] },
  { id: "draisienne-comete", name: "Draisienne Comète", category: "Plein air", age: "3-5 ans", price: 11900, rating: 4.8, reviews: 31, color: "#fff0e6", sprite: 7, stock: 6, description: "Une première draisienne légère et stable pour développer l'équilibre en confiance.", skills: ["Équilibre", "Confiance", "Plein air"] },
];

export const ageGroups = ["Tous les âges", "0-2 ans", "3-5 ans", "6-8 ans", "9 ans +"];
