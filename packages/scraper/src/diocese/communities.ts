import type { CommunityType } from "@horadamissa/schema";
import { clean, fold, titleCase } from "../text.ts";
import type { PageLine } from "./page.ts";
import { startsWithSchedule } from "./schedule.ts";

export type DraftCommunity = {
  name: string;
  type: CommunityType;
  address: string | null;
  lines: string[];
  notes: string[];
};

export type GroupedSchedule = { communities: DraftCommunity[]; office: string[] };

const HEADER = /^(?:\d+\s*[.)–-]?\s*)?(?:igreja|matriz|comunidade|capela|catedral|santuario|mosteiro|cemiterio)\b/;
const NAME_FRAGMENT = /^(?:\d+\s*[.)–-]?\s*)?(?:igreja|matriz|comunidade|capela)?\s*$/;
const OFFICE = /^(?:secretaria|atendimento)\b/;
const ADDRESS = /\b(?:rua|r\.|av\.?|avenida|praca|pc\.|pç|alameda|al\.|travessa|rodovia|rodvia|estrada|fazenda|bairro|distrito|povoado|chacaras?|setor|assentamento|vilarejo|quadra|km\s?\d+|s\/n|br\s?\d{3}|mgc?\s?\d{3}|lmg\s?\d{3})\b/;
const NUMBERING = /^\d+\s*[.)–-]?\s*/;

const TYPE_RULES: ReadonlyArray<readonly [RegExp, CommunityType]> = [
  [/^(?:igreja |comunidade )?matriz\b/, "matriz"],
  [/^catedral\b/, "catedral"],
  [/^santuario\b/, "santuario"],
  [/^capela\b/, "capela"],
  [/^mosteiro\b/, "mosteiro"],
  [/^cemiterio\b/, "cemiterio"],
  [/^igreja\b/, "igreja"],
];

function communityName(text: string): string {
  return titleCase(clean(text.replace(NUMBERING, "").replace(/:$/, "")));
}

function communityType(name: string): CommunityType {
  const folded = fold(name);
  for (const [pattern, type] of TYPE_RULES) if (pattern.test(folded)) return type;
  return "comunidade";
}

function looksLikeAddress(text: string): boolean {
  const folded = fold(text);
  return ADDRESS.test(folded) || /,\s*\d+/.test(text);
}

export function groupCommunities(lines: PageLine[], parishName: string): GroupedSchedule {
  const communities: DraftCommunity[] = [];
  const office: string[] = [];
  const schedule = new Map<PageLine, boolean>(lines.map((line) => [line, startsWithSchedule(line.text)]));
  const boldHeaders = lines.some((line) => line.bold && !schedule.get(line));
  let current: DraftCommunity | null = null;
  let inOffice = false;

  const open = (name: string): DraftCommunity => {
    const community: DraftCommunity = { name, type: communityType(name), address: null, lines: [], notes: [] };
    communities.push(community);
    return community;
  };

  for (const line of lines) {
    const folded = fold(line.text);
    const isSchedule = schedule.get(line) ?? false;
    const isHeader = !isSchedule && (boldHeaders ? line.bold : HEADER.test(folded));

    if (OFFICE.test(folded) && !isSchedule) {
      inOffice = true;
      continue;
    }

    if (isHeader && !OFFICE.test(folded)) {
      inOffice = false;
      if (current && current.lines.length === 0 && !current.address && NAME_FRAGMENT.test(fold(current.name))) {
        current.name = communityName(`${current.name} ${line.text}`);
        current.type = communityType(current.name);
      } else {
        current = open(communityName(line.text));
      }
      continue;
    }

    if (inOffice) {
      office.push(line.text);
      continue;
    }

    if (isSchedule) {
      current ??= open(`Matriz ${parishName}`);
      current.lines.push(line.text);
      continue;
    }

    if (!current) {
      current = open(`Matriz ${parishName}`);
      if (looksLikeAddress(line.text)) current.address = line.text;
      else current.notes.push(line.text);
      continue;
    }

    const bracketed = /^[[(].*[\])]$/.test(line.text);
    if (!current.address && !bracketed && (current.lines.length === 0 || looksLikeAddress(line.text))) {
      current.address = line.text;
    } else {
      current.lines.push(line.text);
    }
  }

  return { communities, office };
}
