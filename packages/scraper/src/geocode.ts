import { readFile } from "node:fs/promises";
import type { Location } from "@horadamissa/schema";
import { request } from "./http.ts";
import { writeJson } from "./output.ts";
import { clean, fold } from "./text.ts";

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const RETRY_MISSES_AFTER_DAYS = 30;
const DIOCESE_VIEWBOX = "-49.6,-17.4,-46.9,-20.1";
const UNLOCATABLE = /^(?:nas casas|em residencias|celebracoes nas casas)/;

const ABBREVIATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^r\.\s*:?\s*/i, "Rua "],
  [/^rua:\s*/i, "Rua "],
  [/^av\.?\s+/i, "Avenida "],
  [/^al(?:\.|amenda)\s*/i, "Alameda "],
  [/^p[cç]\.\s*/i, "Praça "],
  [/^pça\.?\s*/i, "Praça "],
];

const STREET = /^((?:rua|avenida|alameda|praca|travessa|rodovia|estrada)\b[^,–\d]*?)\s*,?\s*(?:n[ºo°]\.?\s*)?(\d+[a-z]?)?(?=\s*(?:[,–-]|$))/i;

type CacheEntry = { location: Location | null; checkedAt: string };
type Attempt = { key: string; query: Record<string, string>; precision: Location["precision"] };
type NominatimHit = { lat: string; lon: string; category?: string; type?: string; addresstype?: string };

export class Geocoder {
  readonly #path: string;
  readonly #cache: Record<string, CacheEntry>;
  #dirty = false;
  lookups = 0;

  private constructor(path: string, cache: Record<string, CacheEntry>) {
    this.#path = path;
    this.#cache = cache;
  }

  static async open(path: string): Promise<Geocoder> {
    try {
      return new Geocoder(path, JSON.parse(await readFile(path, "utf8")));
    } catch {
      return new Geocoder(path, {});
    }
  }

  static attempts(address: string, city: string | null): Attempt[] {
    let head = clean(address.split(/\s+[–-]\s+/)[0] ?? address).replace(/\s*\([^)]*\)/g, "");
    for (const [pattern, replacement] of ABBREVIATIONS) head = head.replace(pattern, replacement);
    const place = { state: "Minas Gerais", country: "Brasil", ...(city ? { city } : {}) };
    const street = STREET.exec(fold(head).replace(/ç/g, "c"));
    const attempts: Attempt[] = [];

    if (street) {
      const name = clean(head.slice(0, street[1]!.length));
      const number = street[2];
      if (number) attempts.push({ key: `${number} ${name} | ${city}`, query: { ...place, street: `${number} ${name}` }, precision: "address" });
      attempts.push({ key: `${name} | ${city}`, query: { ...place, street: name }, precision: "street" });
      const q = [name, city, "Minas Gerais", "Brasil"].filter(Boolean).join(", ");
      attempts.push({ key: q, query: { q }, precision: "street" });
    } else {
      const label = head.replace(/,?\s*\d+(?:[.,]\d+)?\s*km de terra.*$/i, "").trim();
      const q = [label, city, "Minas Gerais", "Brasil"].filter(Boolean).join(", ");
      attempts.push({ key: q, query: { q }, precision: "place" });
    }
    return attempts;
  }

  async #search(attempt: Attempt): Promise<Location | null> {
    const cached = this.#cache[attempt.key];
    if (cached && (cached.location || Date.now() - Date.parse(cached.checkedAt) < RETRY_MISSES_AFTER_DAYS * 86_400_000)) {
      return cached.location;
    }
    this.lookups++;
    const { body } = await request(ENDPOINT, {
      minIntervalMs: 1100,
      query: { ...attempt.query, format: "jsonv2", limit: "1", countrycodes: "br", viewbox: DIOCESE_VIEWBOX, bounded: "1" },
    });
    const [hit] = JSON.parse(body) as NominatimHit[];
    const precision = attempt.precision === "address" && hit?.category === "highway" ? "street" : attempt.precision;
    const location = hit ? { lat: Number(Number(hit.lat).toFixed(6)), lng: Number(Number(hit.lon).toFixed(6)), precision } : null;
    this.#cache[attempt.key] = { location, checkedAt: new Date().toISOString() };
    this.#dirty = true;
    return location;
  }

  async locate(address: string | null, city: string | null): Promise<Location | null> {
    if (!address || UNLOCATABLE.test(fold(address))) return null;
    for (const attempt of Geocoder.attempts(address, city)) {
      const location = await this.#search(attempt);
      if (location) return location;
    }
    return null;
  }

  async save(): Promise<void> {
    if (!this.#dirty) return;
    const sorted = Object.fromEntries(Object.entries(this.#cache).sort(([a], [b]) => a.localeCompare(b)));
    await writeJson(this.#path, sorted);
    this.#dirty = false;
  }
}
