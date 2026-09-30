import type { CarouselDoctor } from "@/components/DoctorsCarousel";

/**
 * Manually added doctors (temporary, until the API returns real data).
 *
 * HOW TO ADD A DOCTOR
 * 1. Put the photo in:  public/images/doctors/   (e.g. dr-sara-ahmed.jpg)
 * 2. Copy one block below, change the values, and give it a unique `id`.
 * 3. `categoryTitle` becomes a filter button, so spell it the same way
 *    for every doctor in that specialty (e.g. always "Cardiology").
 *
 * Portrait photos work best (face in the upper half, roughly 800x660px or larger).
 * Remove `imageUrl` to show a placeholder icon instead.
 */
export const manualDoctors: CarouselDoctor[] = [
  {
    id: "m1",
    name: "Dr. Sara Ahmed",
    nameAr: "د. سارة أحمد",
    imageUrl: "/images/doctors/dr-sara-ahmed.jpg",
    categoryTitle: "Cardiology",
    role: "Senior consultant",
    rating: 4.8,
    experienceYears: 12,
    startingPrice: 200,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m2",
    name: "Dr. Omar Khan",
    nameAr: "د. عمر خان",
    imageUrl: "/images/doctors/dr-omar-khan.jpg",
    categoryTitle: "Cardiology",
    role: "Consultant",
    rating: 4.6,
    experienceYears: 8,
    startingPrice: 180,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m3",
    name: "Dr. Layla Noor",
    nameAr: "د. ليلى نور",
    imageUrl: "/images/doctors/dr-layla-noor.jpg",
    categoryTitle: "Dermatology",
    role: "Specialist",
    rating: 4.9,
    experienceYears: 10,
    startingPrice: 170,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m4",
    name: "Dr. Yusuf Rahman",
    nameAr: "د. يوسف رحمن",
    imageUrl: "/images/doctors/dr-yusuf-rahman.jpg",
    categoryTitle: "Psychiatry",
    role: "Consultant",
    rating: 4.7,
    experienceYears: 9,
    startingPrice: 220,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m5",
    name: "Dr. Hana Al-Farsi",
    nameAr: "د. هناء الفارسي",
    imageUrl: "/images/doctors/dr-hana-alfarsi.jpg",
    categoryTitle: "Pediatrics",
    role: "Senior consultant",
    rating: 4.9,
    experienceYears: 14,
    startingPrice: 160,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m6",
    name: "Dr. Khalid Mansour",
    nameAr: "د. خالد منصور",
    imageUrl: "/images/doctors/dr-khalid-mansour.jpg",
    categoryTitle: "Orthopedics",
    role: "Consultant",
    rating: 4.5,
    experienceYears: 11,
    startingPrice: 210,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m7",
    name: "Dr. Maryam Siddiqui",
    nameAr: "د. مريم صديقي",
    imageUrl: "/images/doctors/dr-maryam-siddiqui.jpg",
    categoryTitle: "Dermatology",
    role: "Consultant",
    rating: 4.7,
    experienceYears: 7,
    startingPrice: 150,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
  {
    id: "m8",
    name: "Dr. Faisal Al-Harbi",
    nameAr: "د. فيصل الحربي",
    imageUrl: "/images/doctors/dr-faisal-alharbi.jpg",
    categoryTitle: "Dentistry",
    role: "Specialist",
    rating: 4.6,
    experienceYears: 6,
    startingPrice: 140,
    currency: "SAR",
    href: "/healthcare/doctors",
  },
];