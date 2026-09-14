export interface ShowcaseAuthor {
  id: string;
  name: string;
  username: string;
  image?: string | null;
}

export interface ShowcaseComment {
  id: string;
  content: string;
  createdAt: string | Date;
  author: ShowcaseAuthor;
}

export type ShowcaseSpan = "normal" | "tall" | "wide";

export type ShowcaseStyle =
  | "Nature Aquarium"
  | "Iwagumi"
  | "Dutch Style"
  | "Biotope"
  | "Jungle Style"
  | "Nano Paludarium"
  | "Wabi-Kusa"
  | "Custom / Other";

export interface ShowcaseItem {
  id: string;
  title: string;
  style: string;
  description?: string | null;
  imageUrl: string;
  sizeSpan: ShowcaseSpan;
  dimensions: string; // e.g. "60x30x36 cm"
  lighting?: string | null;
  co2System?: string | null;
  hardscape?: string | null;
  plants: string[];
  fauna: string[];
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  createdAt: string | Date;
  author: ShowcaseAuthor;
  comments?: ShowcaseComment[];
}

export interface ShowcaseFilterParams {
  search?: string;
  style?: string;
  sizeCategory?: "all" | "nano" | "medium" | "large" | "custom";
  span?: "all" | "normal" | "tall" | "wide";
  sort?: "popular" | "latest" | "comments";
}

export interface CreateShowcaseInput {
  title: string;
  style?: string;
  description?: string;
  imageUrl: string;
  sizeSpan?: ShowcaseSpan;
  dimensions: string;
  lighting?: string;
  co2System?: string;
  hardscape?: string;
  plants?: string[];
  fauna?: string[];
}
