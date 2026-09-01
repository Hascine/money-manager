import { cookies } from "next/headers";
import { dictionaries, type Lang } from "./dictionaries";

export const LANGUAGE_COOKIE = "finora-lang";

export async function getLanguage(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_COOKIE)?.value;
  return value === "en" ? "en" : "id";
}

export async function getDictionary() {
  const lang = await getLanguage();
  return dictionaries[lang];
}
