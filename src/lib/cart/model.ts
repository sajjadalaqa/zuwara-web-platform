export const CART_LIMIT = 20;
export const QUANTITY_LIMIT = 20;
export type CartSelection = { serviceId: number; quantity: number };
export type CartItem = CartSelection & { name: string; nameAr?: string; unitHalalas: number | null };
export type CartState = { items: CartItem[]; completed: string[] };
export const EMPTY_CART: CartState = { items: [], completed: [] };
export const CART_KEY = "zuwara.home-service-cart.v1";
const positive = (n: unknown): n is number => Number.isSafeInteger(n) && Number(n) > 0;
export function cartSelection(value: unknown): CartSelection[] {
  if (!Array.isArray(value) || !value.length || value.length > CART_LIMIT) throw new Error("INVALID_CART");
  const seen = new Set<number>();
  return value.map(row => {
    if (!row || !positive(row.serviceId) || !positive(row.quantity) || row.quantity > QUANTITY_LIMIT || seen.has(row.serviceId)) throw new Error("INVALID_CART");
    seen.add(row.serviceId);
    return { serviceId: row.serviceId, quantity: row.quantity };
  });
}
export function moneyHalalas(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, part = ""] = value.split(".");
  const n = Number(whole) * 100 + Number(part.padEnd(2, "0"));
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}
export function selectionKey(items: readonly CartSelection[]): string {
  return [...items].sort((a,b) => a.serviceId-b.serviceId).map(i => i.serviceId + ":" + i.quantity).join(",");
}
export function readCart(raw: string | null): CartState {
  try {
    if (!raw || raw.length > 100000) return EMPTY_CART;
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.items) || value.items.length > CART_LIMIT) return EMPTY_CART;
    const items: CartItem[] = [], seen = new Set<number>();
    for (const row of value.items) {
      if (!row || !positive(row.serviceId) || !positive(row.quantity) || row.quantity > QUANTITY_LIMIT || seen.has(row.serviceId) || typeof row.name !== "string") continue;
      seen.add(row.serviceId);
      items.push({ serviceId: row.serviceId, quantity: row.quantity, name: row.name.slice(0,200), ...(typeof row.nameAr === "string" ? {nameAr:row.nameAr.slice(0,200)} : {}), unitHalalas: Number.isSafeInteger(row.unitHalalas) && row.unitHalalas >= 0 ? row.unitHalalas : null });
    }
    const completed = Array.isArray(value.completed) ? value.completed.filter((id: unknown): id is string => typeof id === "string" && /^[a-f0-9-]{36}$/i.test(id)).slice(-100) : [];
    return {items, completed};
  } catch { return EMPTY_CART; }
}
export function changeQuantity(state: CartState, item: CartItem, quantity: number): CartState {
  if (!positive(item.serviceId) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > QUANTITY_LIMIT) throw new Error("INVALID_CART");
  const existing = state.items.some(i => i.serviceId === item.serviceId);
  if (!existing && quantity > 0 && state.items.length >= CART_LIMIT) throw new Error("CART_FULL");
  return { ...state, items: quantity === 0 ? state.items.filter(i=>i.serviceId!==item.serviceId) : existing ? state.items.map(i=>i.serviceId===item.serviceId?{...i,quantity}:i) : [...state.items,{...item,quantity}] };
}
export function removeBooked(state: CartState, groupId: string, lines: CartSelection[]): CartState {
  if (state.completed.includes(groupId)) return state;
  if (!/^[a-f0-9-]{36}$/i.test(groupId)) throw new Error("INVALID_GROUP");
  const booked = new Map(cartSelection(lines).map(i=>[i.serviceId,i.quantity]));
  return { items: state.items.map(i=>({...i,quantity:Math.max(0,i.quantity-(booked.get(i.serviceId)??0))})).filter(i=>i.quantity>0), completed:[...state.completed,groupId].slice(-100) };
}
export function visitMinutes(duration: unknown): number {
  if (typeof duration !== "string" && typeof duration !== "number") throw new Error("SERVICE_UNAVAILABLE");
  const value = String(duration), match = /^(\d{1,2}):([0-5]\d)$/.exec(value);
  const minutes = match ? Number(match[1])*60+Number(match[2]) : /^\d+$/.test(value) ? Number(value) : 0;
  if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 480) throw new Error("SERVICE_UNAVAILABLE");
  return minutes;
}
export function todayInRiyadh(offset = 0): string {
  const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Riyadh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const date = new Date(today+"T00:00:00Z"); date.setUTCDate(date.getUTCDate()+offset);
  return date.toISOString().slice(0,10);
}
