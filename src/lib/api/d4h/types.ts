export type D4hCategory = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  serviceCount: number;
  nameAr?: string;
  href: string;
  slug: string;
  screenType: number;
};

export type D4hCategoryData = {
  categories: D4hCategory[];
  available: boolean;
};

export type D4hService = {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  priceLabel: string | null;
  providerName: string | null;
  rating: number | null;
};
