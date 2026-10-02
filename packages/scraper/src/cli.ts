import { resolve } from "node:path";
import { parseArgs } from "node:util";
import type { ParishesFile } from "@horadamissa/schema";
import { Geocoder } from "./geocode.ts";
import { toLegacyChurches } from "./legacy.ts";
import { scrapeLiturgy } from "./liturgy.ts";
import { readJson, writeJson } from "./output.ts";
import { scrapeParishes } from "./parishes.ts";

const ROOT = resolve(import.meta.dirname, "../../..");
const DATA = resolve(ROOT, "data");
const PATHS = {
  parishes: resolve(DATA, "v1/parishes.json"),
  liturgy: resolve(DATA, "v1/liturgy/today.json"),
  legacyChurches: resolve(DATA, "churches.json"),
  geocodeCache: resolve(import.meta.dirname, "../cache/geocode.json"),
};

const MIN_PARISHES = 40;
const MIN_CELEBRATIONS = 300;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { "no-geocode": { type: "boolean", default: false } },
});

const command = positionals[0] ?? "all";
if (!["all", "parishes", "liturgy"].includes(command)) {
  console.error(`Comando desconhecido: ${command}. Use all, parishes ou liturgy.`);
  process.exit(2);
}

const log = (message: string) => console.log(message);
const now = new Date();
let failed = false;

if (command === "all" || command === "parishes") {
  try {
    const geocoder = values["no-geocode"] ? null : await Geocoder.open(PATHS.geocodeCache);
    const previous = await readJson<ParishesFile>(PATHS.parishes);
    const { file, stats } = await scrapeParishes({ previous, geocoder, now, log });
    await geocoder?.save();

    const parsed = stats.scheduleLines - stats.unparsedLines;
    const coverage = stats.scheduleLines ? Math.round((parsed / stats.scheduleLines) * 100) : 0;
    log(
      `Paróquias: ${stats.parishes} · comunidades: ${stats.communities} · celebrações: ${stats.celebrations} · ` +
        `linhas estruturadas: ${coverage}% · consultas de geocodificação: ${geocoder?.lookups ?? 0}`,
    );

    if (stats.parishes < MIN_PARISHES || stats.celebrations < MIN_CELEBRATIONS) {
      throw new Error(`resultado abaixo do mínimo esperado (${MIN_PARISHES} paróquias, ${MIN_CELEBRATIONS} celebrações); nada foi gravado`);
    }
    await writeJson(PATHS.parishes, file);
    await writeJson(PATHS.legacyChurches, toLegacyChurches(file, now));
    if (stats.failed.length > 0) log(`Falharam: ${stats.failed.join(", ")}`);
  } catch (error) {
    failed = true;
    console.error(`Paróquias: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (command === "all" || command === "liturgy") {
  try {
    const liturgy = await scrapeLiturgy(now);
    await writeJson(PATHS.liturgy, liturgy);
    log(`Liturgia de ${liturgy.date}: ${liturgy.celebration} · ${liturgy.readings.map((r) => r.reference).join(" · ")}`);
  } catch (error) {
    failed = true;
    console.error(`Liturgia: ${error instanceof Error ? error.message : String(error)}`);
  }
}

process.exitCode = failed ? 1 : 0;
