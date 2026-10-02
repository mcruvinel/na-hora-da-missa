import type { ParishKind } from "@horadamissa/schema";
import { load } from "cheerio";
import { request } from "../http.ts";
import { clean } from "../text.ts";

export const DIOCESE_URL = "https://diocesedeuberlandia.org.br";
export const PARISHES_URL = `${DIOCESE_URL}/paroquias/`;

const API = `${DIOCESE_URL}/wp-json/wp/v2`;

type WpParish = {
  id: number;
  slug: string;
  link: string;
  modified_gmt: string;
  title: { rendered: string };
  cidade: number[];
  forania: number[];
  padroeiro: number[];
  "tipo-de-organizacao": number[];
};

type WpTerm = { id: number; name: string; slug: string };

export type ParishRef = {
  wpId: number;
  slug: string;
  url: string;
  name: string;
  updatedAt: string;
  kind: ParishKind;
  city: string | null;
  forania: string | null;
  patron: string | null;
};

async function collect<T>(resource: string, fields: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const { body, headers } = await request(`${API}/${resource}`, {
      query: { per_page: "100", page: String(page), _fields: fields },
    });
    pages = Number(headers.get("x-wp-totalpages") ?? "1");
    items.push(...(JSON.parse(body) as T[]));
  }
  return items;
}

function decode(html: string): string {
  return clean(load(html).text());
}

function terms(list: WpTerm[]): Map<number, WpTerm> {
  return new Map(list.map((term) => [term.id, { ...term, name: decode(term.name) }]));
}

export async function listParishes(): Promise<ParishRef[]> {
  const [parishes, cities, foranias, patrons, kinds] = await Promise.all([
    collect<WpParish>("paroquia", "id,slug,link,modified_gmt,title,cidade,forania,padroeiro,tipo-de-organizacao"),
    collect<WpTerm>("cidade", "id,name,slug").then(terms),
    collect<WpTerm>("forania", "id,name,slug").then(terms),
    collect<WpTerm>("padroeiro", "id,name,slug").then(terms),
    collect<WpTerm>("tipo-de-organizacao", "id,name,slug").then(terms),
  ]);

  const first = (map: Map<number, WpTerm>, ids: number[]) => (ids[0] !== undefined ? map.get(ids[0]) ?? null : null);

  return parishes
    .map((parish): ParishRef => {
      const kind = first(kinds, parish["tipo-de-organizacao"])?.slug;
      return {
        wpId: parish.id,
        slug: parish.slug,
        url: parish.link,
        name: decode(parish.title.rendered),
        updatedAt: `${parish.modified_gmt}Z`,
        kind: kind === "capelania" || kind === "santuario" ? kind : "paroquia",
        city: first(cities, parish.cidade)?.name ?? null,
        forania: first(foranias, parish.forania)?.name ?? null,
        patron: first(patrons, parish.padroeiro)?.name ?? null,
      };
    })
    .sort((a, b) => a.wpId - b.wpId);
}
