import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { doctorSlug, specialtySlug } from "@/lib/api/zuwara/slugs";

const routes = [
  ["", 1, "weekly"],
  ["/healthcare", 0.9, "daily"],
  ["/healthcare/doctors", 0.9, "daily"],
  ["/healthcare/specialties", 0.85, "weekly"],
  ["/home-services", 0.9, "daily"],
  ["/how-it-works", 0.8, "monthly"],
  ["/insights", 0.75, "weekly"],
  ["/about", 0.7, "monthly"],
  ["/contact", 0.65, "monthly"],
  ["/help", 0.7, "monthly"],
  ["/download", 0.65, "monthly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
  ["/ar", 0.75, "weekly"],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = routes.map(([path, priority, changeFrequency]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
  const healthcare = await getZuwaraHomeData();
  const specialties: MetadataRoute.Sitemap = healthcare.categories.map((item) => ({
    url: `${SITE_URL}/healthcare/specialties/${specialtySlug(item.title, item.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));
  const doctors: MetadataRoute.Sitemap = healthcare.doctors.map((doctor) => ({
    url: `${SITE_URL}/healthcare/doctors/${doctorSlug(doctor.name, doctor.id)}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.8,
  }));
  return [...staticRoutes, ...specialties, ...doctors];
}
