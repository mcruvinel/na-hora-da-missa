import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { clean, fold } from "../text.ts";

export type PageLine = { text: string; bold: boolean };

export type ParishPage = {
  address: string | null;
  contact: {
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    youtube: string | null;
  };
  clergy: { pastor: string | null; vicars: string[]; deacons: string[] };
  office: string[];
  schedule: PageLine[];
};

const BLOCK_TAGS = new Set(["p", "div", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "section", "blockquote"]);
const BOLD_TAGS = new Set(["strong", "b", "h1", "h2", "h3", "h4", "h5", "h6"]);
const PHONE = /\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/;
const NO_INFO = /^nao ha (?:informac|horario)/;

export function extractLines(element: AnyNode): PageLine[] {
  const lines: PageLine[] = [];
  let text = "";
  let total = 0;
  let bold = 0;

  const flush = () => {
    const value = clean(text);
    if (value) lines.push({ text: value, bold: bold > 0 && bold >= total * 0.6 });
    text = "";
    total = 0;
    bold = 0;
  };

  const walk = (node: AnyNode, inBold: boolean) => {
    if (node.type === "text") {
      const data = (node as { data: string }).data;
      text += data;
      const size = data.replace(/\s/g, "").length;
      total += size;
      if (inBold) bold += size;
      return;
    }
    if (node.type !== "tag") return;
    const tag = node as Element;
    if (tag.name === "br") return flush();
    if (tag.name === "script" || tag.name === "style" || tag.name === "iframe") return;
    const style = tag.attribs.style ?? "";
    const isBold = inBold || BOLD_TAGS.has(tag.name) || /font-weight:\s*(?:bold|[6-9]00)/.test(style);
    const isBlock = BLOCK_TAGS.has(tag.name);
    if (isBlock) flush();
    for (const child of tag.children) walk(child, isBold);
    if (isBlock) flush();
  };

  walk(element, false);
  flush();
  return lines;
}

function panelLines($: CheerioAPI, panel: Element): PageLine[] {
  return $(panel)
    .find(".elementor-widget-text-editor .elementor-widget-container")
    .toArray()
    .flatMap((container) => extractLines(container))
    .filter((line) => !NO_INFO.test(fold(line.text)));
}

function parseClergy(lines: PageLine[]): ParishPage["clergy"] {
  const clergy: ParishPage["clergy"] = { pastor: null, vicars: [], deacons: [] };
  let role: "pastor" | "vicars" | "deacons" | null = null;
  for (const { text } of lines) {
    const folded = fold(text);
    if (/^(?:paroco|reitor|administrador|capelao)/.test(folded)) role = "pastor";
    else if (folded.startsWith("vigario")) role = "vicars";
    else if (folded.startsWith("diacono")) role = "deacons";
    else if (role === "pastor") clergy.pastor ??= text;
    else if (role) clergy[role].push(text);
  }
  return clergy;
}

function socialHandle(url: URL): "instagram" | "facebook" | "youtube" | null {
  if (url.hostname.endsWith("instagram.com")) return "instagram";
  if (url.hostname.endsWith("facebook.com")) return "facebook";
  if (url.hostname.endsWith("youtube.com") || url.hostname === "youtu.be") return "youtube";
  return null;
}

export function parseParishPage(html: string): ParishPage {
  const $ = load(html);
  const root = $('[data-elementor-type="single-post"]').first();
  const scope = root.length > 0 ? root : $("body");

  const page: ParishPage = {
    address: null,
    contact: { phone: null, email: null, whatsapp: null, website: null, instagram: null, facebook: null, youtube: null },
    clergy: { pastor: null, vicars: [], deacons: [] },
    office: [],
    schedule: [],
  };

  scope
    .find(".elementor-widget-icon-list")
    .first()
    .find(".elementor-icon-list-item")
    .each((_, item) => {
      const text = clean($(item).text());
      const href = $(item).find("a").attr("href") ?? "";
      const folded = fold(text);
      if (href.startsWith("mailto:")) page.contact.email ??= href.slice(7).trim();
      else if (/whatsapp|wa\.me/.test(href)) {
        const phone = /phone=(\d+)/.exec(href)?.[1] ?? /wa\.me\/(\d+)/.exec(href)?.[1];
        page.contact.whatsapp ??= phone ?? null;
      } else if (folded.includes("visite o site") && /^https?:/.test(href)) page.contact.website ??= href;
      else if (PHONE.test(text) && text.length < 40) page.contact.phone ??= text;
      else if (!/^(?:data de fundacao|fundad[ao])/.test(folded) && /\d/.test(text) && /[a-z]{3}/.test(folded)) page.address ??= text;
    });

  scope.find("a[href]").each((_, anchor) => {
    try {
      const url = new URL($(anchor).attr("href")!);
      const network = socialHandle(url);
      if (network) page.contact[network] ??= url.href;
    } catch {}
  });

  const tabs = scope.find(".elementor-widget-n-tabs").first();
  const titles = tabs.find('[role="tab"]').toArray().map((tab) => fold(clean($(tab).text())));
  tabs.find('[role="tabpanel"]').each((index, panel) => {
    const title = titles[index] ?? "";
    const lines = panelLines($, panel);
    if (title.startsWith("administracao")) page.clergy = parseClergy(lines);
    else if (title.startsWith("atendimento")) page.office = lines.map((line) => line.text);
    else if (title.startsWith("horario")) page.schedule = lines;
  });

  return page;
}
