import {
  Car,
  Coffee,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PiggyBank,
  Plane,
  Repeat,
  ShoppingBag,
  Shirt,
  Tag,
  Users,
  Utensils,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";

/** Keyword → icon, checked in order, first substring match wins. Indonesian
 * terms come first since that's the app's primary language, with the English
 * equivalents alongside so either naming style resolves. */
const ICON_KEYWORDS: [string[], typeof Tag][] = [
  [["kopi", "coffee", "cafe", "kafe"], Coffee],
  [["makan", "food", "jajan", "kuliner", "restoran", "snack", "minum"], Utensils],
  [["tabungan", "saving", "nabung", "celengan"], PiggyBank],
  [["bensin", "bbm", "fuel", "pertalite", "pertamax", "solar"], Fuel],
  [["transport", "ojek", "grab", "gojek", "parkir", "bus", "kereta", "taksi", "mobil", "motor"], Car],
  [["belanja", "shopping", "mall", "groceries", "grocery", "pasar"], ShoppingBag],
  [["listrik", "air", "pln", "pdam", "tagihan", "utilit", "gas"], Zap],
  [["internet", "wifi", "pulsa", "kuota", "data", "telepon", "phone"], Wifi],
  [["langganan", "subscription", "subs", "netflix", "spotify"], Repeat],
  [["rumah", "kos", "sewa", "rent", "kontrakan", "home", "kpr"], House],
  [["sehat", "health", "obat", "dokter", "rumah sakit", "klinik", "bpjs"], HeartPulse],
  [["didik", "sekolah", "kuliah", "education", "kursus", "les", "buku"], GraduationCap],
  [["hadiah", "gift", "kado", "donasi", "sedekah", "zakat"], Gift],
  [["libur", "travel", "jalan-jalan", "tiket", "wisata", "hotel"], Plane],
  [["game", "top up", "topup", "gaming", "steam"], Gamepad2],
  [["baju", "pakaian", "fashion", "clothes", "sepatu"], Shirt],
  [["olahraga", "gym", "sport", "fitness"], Dumbbell],
  [["hiburan", "film", "movie", "nonton", "bioskop", "entertainment"], Film],
  [["gaji", "salary", "bonus", "thr", "upah", "penghasilan", "income", "freelance"], Wallet],
  [["orang tua", "ortu", "keluarga", "family", "anak", "istri", "suami"], Users],
];

/** djb2 — small, stable, and spreads short strings across the slots better
 * than a plain char-code sum would. */
function hash(value: string) {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  return h;
}

export interface CategoryVisual {
  /** CSS colour reference — resolves per theme via the --cat-* vars. */
  color: string;
  /** Same hue at low alpha, for the avatar's fill behind the icon. */
  tint: string;
  Icon: typeof Tag;
}

const SLOTS = 8;

export function getCategoryVisual(id: string | null | undefined, name?: string | null): CategoryVisual {
  const slot = (hash(id ?? name ?? "uncategorized") % SLOTS) + 1;
  const color = `var(--cat-${slot})`;

  const haystack = (name ?? "").toLowerCase();
  const match = ICON_KEYWORDS.find(([keywords]) => keywords.some((k) => haystack.includes(k)));

  return {
    color,
    tint: `color-mix(in oklab, ${color} 14%, transparent)`,
    Icon: match?.[1] ?? Tag,
  };
}
