import { LiturgyFile, SCHEMA_VERSION, type LiturgicalColor, type ReadingKind, type ReadingLine, type Segment } from "@horadamissa/schema";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { fetchText } from "./http.ts";
import { isoWithOffset, saoPauloTimestamp } from "./output.ts";
import { clean, fold } from "./text.ts";

export const LITURGY_URL = "https://liturgia.cancaonova.com/pb/";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const COLORS: Record<string, LiturgicalColor> = {
  verde: "verde",
  roxo: "roxo",
  roxa: "roxo",
  branco: "branco",
  branca: "branco",
  vermelho: "vermelho",
  vermelha: "vermelho",
  rosa: "rosa",
  rosaceo: "rosa",
  preto: "preto",
};
const HEADING = /^(?:primeira leitura|segunda leitura|responsorio|salmo|evangelho)\b/;
const VERSE = /^\d{1,3}[a-z]?$/;

function readingKind(label: string): ReadingKind | null {
  const folded = fold(label);
  if (folded.startsWith("1") || folded.includes("primeira")) return "first";
  if (folded.startsWith("2") || folded.includes("segunda")) return "second";
  if (folded.includes("salmo")) return "psalm";
  if (folded.includes("evangelho")) return "gospel";
  return null;
}

function textOf(node: AnyNode): string {
  if (node.type === "text") return (node as { data: string }).data;
  return "children" in node ? (node.children as AnyNode[]).map(textOf).join("") : "";
}

function segmentsOf(paragraph: Element): Segment[] {
  const segments: Segment[] = [{ text: "" }];
  const walk = (node: AnyNode) => {
    if (node.type === "text") {
      segments.at(-1)!.text += (node as { data: string }).data;
      return;
    }
    if (node.type !== "tag") return;
    const tag = node as Element;
    if (tag.name === "br") {
      segments.at(-1)!.text += " ";
      return;
    }
    const content = clean(textOf(tag));
    if ((tag.name === "strong" || tag.name === "b" || tag.name === "sup") && VERSE.test(content)) {
      segments.push({ verse: content, text: "" });
      return;
    }
    tag.children.forEach(walk);
  };
  paragraph.children.forEach(walk);
  return segments
    .map((segment) => ({ ...segment, text: clean(segment.text).replace(/^[-–—]\s*/, "") }))
    .filter((segment) => segment.text || segment.verse);
}

function isBold($: CheerioAPI, paragraph: Element): boolean {
  if (/font-weight:\s*(?:bold|[6-9]00)/.test(paragraph.attribs.style ?? "")) return true;
  const total = clean($(paragraph).text()).length;
  const bold = clean($(paragraph).find("strong, b").text()).length;
  return total > 0 && bold >= total * 0.8;
}

function parseLines($: CheerioAPI, panel: Element): { title: string | null; lines: ReadingLine[] } {
  let title: string | null = null;
  const lines: ReadingLine[] = [];
  for (const paragraph of $(panel).children("p").toArray()) {
    if ($(paragraph).find("iframe, .embeds-audio").length > 0) continue;
    const text = clean($(paragraph).text());
    if (!text) continue;
    if (title === null && HEADING.test(fold(text))) {
      title = clean(text.replace(/\(.*$/, "").replace(/\b(?:Sl|Salmo)\b.*$/, ""));
      continue;
    }
    const segments = segmentsOf(paragraph);
    if (segments.length === 0) continue;
    const dialogue = /^[-–—]/.test(text);
    const hasVerses = segments.some((segment) => segment.verse);
    const role: ReadingLine["role"] = dialogue
      ? isBold($, paragraph) ? "response" : "versicle"
      : hasVerses || text.length > 140 ? "text" : "rubric";
    lines.push({ role, segments });
  }
  return { title, lines };
}

function pageDate($: CheerioAPI, fallback: Date): string {
  const day = Number(clean($("#dia-calendar").text()));
  const month = MONTHS.indexOf(fold(clean($("#mes-calendar").text())).slice(0, 3));
  const year = Number(clean($("#ano-calendar").text()));
  if (day && month >= 0 && year) return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return saoPauloTimestamp(fallback).slice(0, 10);
}

export function parseLiturgy(html: string, now: Date): LiturgyFile {
  const $ = load(html);
  const celebration = clean($(".entry-title").first().text()).split(" | ")[0]!.replace(/\s+-\s+/, " – ");
  const colorName = fold(clean($(".cor-liturgica").first().text()).replace(/^.*:/, "")).trim();

  const readings = $("[id^=liturgia-]")
    .toArray()
    .flatMap((panel) => {
      const id = panel.attribs.id!;
      const tab = $(`a[href="#${id}"]`).first();
      const label = clean(tab.find("label").text());
      const kind = readingKind(label);
      if (!kind) return [];
      const { title, lines } = parseLines($, panel);
      if (lines.length === 0) return [];
      return [{ kind, title: title ?? label, reference: clean(tab.find(".referencia").text()), lines }];
    });

  return LiturgyFile.parse({
    version: SCHEMA_VERSION,
    generatedAt: isoWithOffset(now),
    source: LITURGY_URL,
    date: pageDate($, now),
    celebration,
    color: COLORS[colorName] ?? null,
    readings,
  });
}

export async function scrapeLiturgy(now = new Date()): Promise<LiturgyFile> {
  return parseLiturgy(await fetchText(LITURGY_URL), now);
}
