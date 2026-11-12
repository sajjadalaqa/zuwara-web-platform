export type HeroSlide = {
  id?: number;
  label: { en: string; ar: string };
  href?: string; // without locale prefix
  image: string;
  fit?: "cover" | "contain";
  ratio: string; // desktop/tablet image: "width / height"
  mobileImage?: string;
  mobileRatio?: string; // phone image: "width / height" (falls back to ratio)
  alt: { en: string; ar: string };
  position?: string;
};

export const defaultHeroSlides: HeroSlide[] = [
  {
    label: { en: "Welcome to Zuwara", ar: "مرحباً بك في زوارة" },
    href: "/healthcare",
    image: "/images/hero-1.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Welcome to Zuwara. Care for your health and your home.",
      ar: "مرحباً بك في زوارة. نعتني بصحتك ومنزلك.",
    },
  },
  {
    label: { en: "Healthcare", ar: "الرعاية الصحية" },
    href: "/healthcare/doctors",
    image: "/images/hero-2.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Find the right healthcare consultant for you.",
      ar: "اعثر على المستشار الصحي المناسب لك.",
    },
  },
  {
    label: { en: "Home services", ar: "الخدمات المنزلية" },
    href: "/home-services",
    image: "/images/hero-3.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Explore trusted home services in your area.",
      ar: "استكشف الخدمات المنزلية الموثوقة في منطقتك.",
    },
  },
];
