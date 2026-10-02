import type { ParishesFile } from "@horadamissa/schema";
import { saoPauloTimestamp } from "./output.ts";

export function toLegacyChurches(file: ParishesFile, now: Date) {
  const churches = file.parishes
    .filter((parish) => parish.communities.some((community) => community.celebrations.length > 0))
    .map((parish) => ({
      name: parish.name,
      link: parish.url,
      address: parish.address,
      communities: parish.communities.map((community) => ({
        name: community.name,
        schedule: [community.raw.filter((line) => line !== community.address).join("\n")].filter(Boolean),
        address: community.address,
      })),
    }));
  return { collection_date: saoPauloTimestamp(now), total_churches: churches.length, churches };
}
