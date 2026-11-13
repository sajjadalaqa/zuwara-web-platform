// Contact details supplied in the Zuwara information sheet (November 2026).
export const SITE_CONTACT = {
  "phone": "+966 55 543 4123",
  "phoneHref": "tel:+966555434123",
  "email": "contact@zuwara.com",
  "website": "https://www.zuwara.sa",
  "linkedin": "https://www.linkedin.com/in/zuwara",
  "socialHandle": "@zuwaraCom",
  "mapLink": "https://share.google/1LDtSEhULxt7gjqIg",
  "company": {
    "en": "Alaqa Business Services Company",
    "ar": "شركة علاقة لخدمات الأعمال"
  },
  "address": {
    "en": {
      "street": "Building 4964, Prince Ahmed Bin Abdulaziz Road",
      "cityLine": "Laban - Al Ahmadiyah District, Riyadh 12935, Secondary No. 6446, Kingdom of Saudi Arabia",
      "full": "Building 4964, Prince Ahmed Bin Abdulaziz Road, Laban - Al Ahmadiyah District, Riyadh 12935, Secondary No. 6446, Kingdom of Saudi Arabia"
    },
    "ar": {
      "street": "مبنى 4964، طريق الأمير أحمد بن عبدالعزيز",
      "cityLine": "حي لبن - الأحمدية، الرياض 12935، الرقم الفرعي 6446، المملكة العربية السعودية",
      "full": "مبنى 4964، طريق الأمير أحمد بن عبدالعزيز، حي لبن - الأحمدية، الرياض 12935، الرقم الفرعي 6446، المملكة العربية السعودية"
    }
  },
  "hours": {
    "en": "Contact us to confirm opening hours.",
    "ar": "تواصل معنا لتأكيد ساعات العمل."
  }
} as const;

export function contactAddress(locale: string) {
  return SITE_CONTACT.address[locale === "ar" ? "ar" : "en"];
}
