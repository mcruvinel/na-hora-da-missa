# Hora da Missa

Mass times for the parishes of the Diocese of Uberlândia (Brazil) and the daily readings. It is a static website today; iOS and Android apps are next.

## How it works

Every day at 03:00 (UTC-3) a GitHub Actions job runs the scraper, which:

1. lists the parishes through the public API of the Diocese website;
2. reads each parish page and turns the free-text schedules into structured data (day, time, kind of celebration and notes);
3. looks up an approximate location for each church on OpenStreetMap, with a cache;
4. reads the daily readings;
5. validates everything against the schema and only writes complete results.

The data is versioned in `data/` and served with the site.

## Data

| File | Content |
| --- | --- |
| `data/v1/parishes.json` | Parishes, communities, structured celebrations, contact and location |
| `data/v1/liturgy/today.json` | Celebration, liturgical color and readings of the day |
| `data/churches.json` | Legacy format used by the current website |

The `v1` format is defined in `packages/schema` (zod) and shared with the app.

## Running locally

Requires Node 24 or newer.

```
npm install
npm test
npm run scrape
```

See the Portuguese README for more commands.

## Contact

contato.nahoradamissa@gmail.com

Non-commercial project with no official ties to the Diocese of Uberlândia. Schedules belong to their parishes and are gathered here only to make public information easier to find.
