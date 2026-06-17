export type PieceOption = {
  pieces: number;
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  age: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
  colorLabel?: string;
  colorLabels?: string[];
  showColor?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  sprite: number;
  stock: number;
  piecesCount?: number;
  pieceOptions?: PieceOption[];
  showPieces?: boolean;
  description: string;
  descriptionAr?: string;
  skills: string[];
};

export const products: Product[] = [];

export const ageGroups = ["Tous les âges", "0-2 ans", "3-5 ans", "6-8 ans", "9 ans +"];
