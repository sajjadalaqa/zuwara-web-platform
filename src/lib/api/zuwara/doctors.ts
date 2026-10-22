import "server-only";
import { consultantCategories, consultantDirectory, doctorView, discovery, calendar, type V2Doctor } from "./discovery";
import { ZuwaraV2Error } from "./v2";
import type { ZuwaraDoctorProfile, ZuwaraDoctorSearch, ZuwaraSlot } from "./types";
export type DoctorSearchOptions = { query?: string; categoryId?: number | null; durationMinutes?: number | null; date?: string | null; availableToday?: boolean; consultationType?: string | null; gender?: number | null; sortType?: number | null; start?: number; count?: number };
export function riyadhToday() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
function slots(rows: { start_time: string; end_time: string; period: string }[]): ZuwaraSlot[] {
  return rows.map(s => ({ startTime: s.start_time, endTime: s.end_time, period: s.period, available: true, booked: false, reserved: false, status: "available" }));
}
export async function searchZuwaraDoctors(options: DoctorSearchOptions = {}): Promise<ZuwaraDoctorSearch> {
  const query = new URLSearchParams();
  if (options.query?.trim()) query.set("q", options.query.trim());
  if (options.categoryId) query.set("category_id", String(options.categoryId));
  if (options.gender !== null && options.gender !== undefined) query.set("gender", String(options.gender));
  if (options.consultationType) query.set("consultation_type", options.consultationType === "offline" ? "clinic" : options.consultationType);
  const sort: Record<number, string> = { 1: "price_low", 2: "price_high", 3: "rating" };
  if (options.sortType && sort[options.sortType]) query.set("sort", sort[options.sortType]);
  try {
    const [rows, categories] = await Promise.all([consultantDirectory(query), consultantCategories().catch(() => [])]);
    const date = options.date || (options.availableToday ? riyadhToday() : null);
    const scheduled = Boolean(date || options.durationMinutes);
    const doctors = [];
    // Bound concurrent calendar requests to avoid an unbounded per-directory burst.
    for (let start = 0; start < rows.length; start += 4) {
      const batch = await Promise.all(rows.slice(start, start + 4).map(async row => {
        const doctor = doctorView(row);
        if (!scheduled) return doctor;
        const duration = options.durationMinutes ?? row.duration_options[0]?.minutes;
        if (!duration || !row.duration_options.some(d=>d.minutes === duration)) return null;
        let data;
        try { data = (await calendar(row.id, date ?? riyadhToday(), duration)).data; }
        catch { return { ...doctor, scheduleStatus: "unavailable", scheduleMessage: "Availability could not be loaded. Please retry." }; }
        const day = data.dates[0];
        if (options.availableToday && !day?.is_available) return null;
        return { ...doctor, slots: slots(day?.slots ?? []), scheduleStatus: day?.status ?? "closed", scheduleMessage: null };
      }));
      doctors.push(...batch.filter(row=>row !== null));
    }
    return { doctors, categories, date, durationMinutes: options.durationMinutes ?? null, available: true, mode: scheduled ? "schedule" : options.query ? "keyword" : "catalog" };
  } catch (error) {
    if (error instanceof ZuwaraV2Error || error instanceof TypeError) return { doctors: [], categories: [], date: options.date ?? null, durationMinutes: options.durationMinutes ?? null, available: false, mode: "catalog" };
    throw error;
  }
}
export async function getZuwaraDoctorProfile(id: number, date = riyadhToday(), duration?: number | null): Promise<ZuwaraDoctorProfile | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  try {
    const { data: row } = await discovery<V2Doctor>("/consultants/" + id);
    const doctor = doctorView(row), selected = duration ?? row.duration_options[0]?.minutes ?? null;
    let scheduleFailed = false;
    const available = selected && row.duration_options.some(d=>d.minutes === selected) ? await calendar(id, date, selected).then(result => result.data).catch(() => { scheduleFailed = true; return null; }) : null;
    const day = available?.dates[0];
    const items = (rows: NonNullable<V2Doctor["services"]>) => rows.map(i=>({ id: i.id, title: i.title, titleAr: i.title_ar }));
    return { ...doctor, serviceLocations: (row.service_locations ?? []).map(location => ({ id: location.id, title: location.title, titleAr: location.title_ar, address: location.address, addressAr: location.address_ar })), about: row.biography ?? row.about?.en ?? null, aboutAr: row.about?.ar ?? null, degrees: null, degreeAr: null,
      languagesSpoken: null, educationalJourney: null, educationalJourneyAr: null, selectedDate: date, selectedDurationMinutes: selected,
      scheduleAvailable: day?.is_available ?? false, services: items(row.services ?? []), experience: [], expertise: items(row.expertise ?? []), awards: [],
      slots: slots(day?.slots ?? []), scheduleStatus: scheduleFailed ? "unavailable" : day?.status ?? "closed", scheduleMessage: scheduleFailed ? "Availability could not be loaded. Please retry." : null, durationAvailability: [] };
  } catch (error) { if (error instanceof ZuwaraV2Error && error.status === 404) return null; throw error; }
}
