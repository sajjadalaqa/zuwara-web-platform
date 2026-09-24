export type ZuwaraCategory = {
  id: number;
  title: string;
  titleAr: string | null;
  imageUrl: string | null;
};

export type ZuwaraDoctor = {
  id: number;
  doctorNumber: string;
  name: string;
  nameAr: string | null;
  imageUrl: string | null;
  designation: string | null;
  designationAr: string | null;
  experienceYears: number;
  rating: number;
  happyClients: number;
  startingPrice: string;
  currency: string;
  categoryId: number | null;
  categoryTitle: string | null;
  categoryTitleAr: string | null;
  classificationTitle: string | null;
  classificationTitleAr: string | null;
  consultationTypes: string[];
  enabledDurations: Array<{ minutes: number; price: string }>;
  durationOptions?: ZuwaraDurationOption[];
  slots?: ZuwaraSlot[];
  scheduleStatus?: string | null;
  scheduleMessage?: string | null;
};

export type ZuwaraDurationOption = {
  minutes: number;
  price: string | null;
  enabled: boolean;
  status: "enabled" | "closed" | string;
};

export type ZuwaraSlot = {
  startTime: string;
  endTime: string;
  period: "morning" | "evening" | string;
  available: boolean;
  booked: boolean;
  reserved: boolean;
  status: "available" | "booked" | "reserved" | "closed" | "past" | string;
};

export type ZuwaraProfileItem = {
  id: number;
  title: string;
  titleAr: string | null;
};

export type ZuwaraDoctorProfile = ZuwaraDoctor & {
  about: string | null;
  aboutAr: string | null;
  degrees: string | null;
  degreeAr: string | null;
  languagesSpoken: string | null;
  educationalJourney: string | null;
  educationalJourneyAr: string | null;
  selectedDate: string;
  selectedDurationMinutes: number | null;
  scheduleAvailable: boolean;
  services: ZuwaraProfileItem[];
  experience: ZuwaraProfileItem[];
  expertise: ZuwaraProfileItem[];
  awards: ZuwaraProfileItem[];
  durationAvailability: Array<ZuwaraDurationOption & {
    slots: ZuwaraSlot[];
    scheduleStatus: string | null;
    scheduleMessage: string | null;
  }>;
};

export type ZuwaraDoctorSearch = {
  doctors: ZuwaraDoctor[];
  categories: ZuwaraCategory[];
  date: string | null;
  durationMinutes: number | null;
  available: boolean;
  mode: "catalog" | "keyword" | "schedule";
};

export type ZuwaraHomeData = {
  categories: ZuwaraCategory[];
  doctors: ZuwaraDoctor[];
  available: boolean;
};
