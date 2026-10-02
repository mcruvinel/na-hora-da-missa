import { ParishesFile, SCHEMA_VERSION, type Community, type Parish } from "@horadamissa/schema";
import { listParishes, PARISHES_URL, type ParishRef } from "./diocese/api.ts";
import { groupCommunities } from "./diocese/communities.ts";
import { parseParishPage } from "./diocese/page.ts";
import { parseSchedule } from "./diocese/schedule.ts";
import type { Geocoder } from "./geocode.ts";
import { fetchText } from "./http.ts";
import { isoWithOffset } from "./output.ts";
import { slugify } from "./text.ts";

export type ParishStats = {
  parishes: number;
  communities: number;
  celebrations: number;
  scheduleLines: number;
  unparsedLines: number;
  failed: string[];
  reused: string[];
};

export function buildParish(ref: ParishRef, html: string): Parish {
  const page = parseParishPage(html);
  const id = `p${ref.wpId}`;
  const grouped = groupCommunities(page.schedule, ref.name);
  const usedIds = new Set<string>();

  const communities = grouped.communities.map((draft): Community => {
    const { celebrations, notes } = parseSchedule(draft.lines);
    let communityId = `${id}-${slugify(draft.name) || "comunidade"}`;
    for (let n = 2; usedIds.has(communityId); n++) communityId = `${id}-${slugify(draft.name)}-${n}`;
    usedIds.add(communityId);
    return {
      id: communityId,
      name: draft.name,
      type: draft.type,
      address: draft.address ?? (grouped.communities.length === 1 && draft.type === "matriz" ? page.address : null),
      location: null,
      celebrations,
      notes: [...draft.notes, ...notes],
      raw: [draft.address, ...draft.notes, ...draft.lines].filter((line): line is string => Boolean(line)),
    };
  });

  return {
    id,
    slug: ref.slug,
    name: ref.name,
    kind: ref.kind,
    city: ref.city,
    forania: ref.forania,
    patron: ref.patron,
    url: ref.url,
    address: page.address,
    location: null,
    contact: page.contact,
    clergy: page.clergy,
    office: [...page.office, ...grouped.office],
    communities,
    updatedAt: ref.updatedAt,
  };
}

async function locate(parish: Parish, geocoder: Geocoder): Promise<void> {
  for (const community of parish.communities) {
    community.location = await geocoder.locate(community.address, parish.city);
  }
  const main = parish.communities.find((community) => community.location && ["matriz", "catedral", "santuario"].includes(community.type));
  parish.location = main?.location ?? (await geocoder.locate(parish.address, parish.city)) ?? parish.communities.find((c) => c.location)?.location ?? null;
}

export async function scrapeParishes(options: {
  previous: ParishesFile | null;
  geocoder: Geocoder | null;
  now?: Date;
  log?: (message: string) => void;
}): Promise<{ file: ParishesFile; stats: ParishStats }> {
  const log = options.log ?? (() => {});
  const previous = new Map(options.previous?.parishes.map((parish) => [parish.id, parish]));
  const refs = await listParishes();
  log(`${refs.length} paróquias na API da Diocese`);

  const parishes: Parish[] = [];
  const stats: ParishStats = { parishes: 0, communities: 0, celebrations: 0, scheduleLines: 0, unparsedLines: 0, failed: [], reused: [] };

  for (const [index, ref] of refs.entries()) {
    const label = `[${index + 1}/${refs.length}] ${ref.name}`;
    try {
      const parish = buildParish(ref, await fetchText(ref.url));
      if (options.geocoder) await locate(parish, options.geocoder);
      else {
        const old = previous.get(parish.id);
        parish.location = old?.location ?? null;
        for (const community of parish.communities) {
          community.location = old?.communities.find((c) => c.id === community.id)?.location ?? null;
        }
      }
      parishes.push(parish);
      const count = parish.communities.reduce((sum, c) => sum + c.celebrations.length, 0);
      log(`${label}: ${parish.communities.length} comunidades, ${count} celebrações`);
    } catch (error) {
      const old = previous.get(`p${ref.wpId}`);
      if (old) {
        parishes.push(old);
        stats.reused.push(ref.name);
      }
      stats.failed.push(ref.name);
      log(`${label}: falhou (${error instanceof Error ? error.message : String(error)})${old ? ", mantendo dados anteriores" : ""}`);
    }
  }

  for (const parish of parishes) {
    stats.parishes++;
    for (const community of parish.communities) {
      stats.communities++;
      stats.celebrations += community.celebrations.length;
      const sources = new Set(community.celebrations.map((c) => c.source));
      stats.scheduleLines += sources.size + community.notes.length;
      stats.unparsedLines += community.notes.length;
    }
  }

  const file = ParishesFile.parse({
    version: SCHEMA_VERSION,
    generatedAt: isoWithOffset(options.now ?? new Date()),
    source: PARISHES_URL,
    parishes,
  });
  return { file, stats };
}
