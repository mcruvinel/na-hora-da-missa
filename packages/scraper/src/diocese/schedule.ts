import type { Celebration, CelebrationKind, Recurrence, Weekday } from "@horadamissa/schema";
import { capitalize, clean, fold } from "../text.ts";

type Spec = {
  start: number;
  end: number;
  recurrences: Recurrence[];
  notes: string[];
};

type TimeHit = { start: number; end: number; time: string; until?: string };

type Slot = { time: string; until?: string; kind: CelebrationKind; note?: string };

type Clause = {
  times: TimeHit[];
  kind: CelebrationKind | null;
  text: string;
};

export type ScheduleResult = { celebrations: Celebration[]; notes: string[] };

const WEEKDAYS: ReadonlyArray<readonly [RegExp, Weekday]> = [
  [/^domingos?(?![a-z])/, 0],
  [/^segundas?(?:\s*-?\s*feiras?)?(?![a-z])/, 1],
  [/^tercas?(?:\s*-?\s*feiras?)?(?![a-z])/, 2],
  [/^quartas?(?:\s*-?\s*feiras?)?(?![a-z])/, 3],
  [/^quintas?(?:\s*-?\s*feiras?)?(?![a-z])/, 4],
  [/^sextas?(?:\s*-?\s*feiras?)?(?![a-z])/, 5],
  [/^sabados?(?![a-z])/, 6],
];

const ORDINAL_WORDS: Record<string, number> = {
  primeir: 1,
  segund: 2,
  terceir: 3,
  quart: 4,
  quint: 5,
  ultim: -1,
};

const ORDINAL_WORD = /^(primeir|segund|terceir|quart|quint|ultim)[oa]s?(?![a-z])/;
const ORDINAL_NUMBER = /^([1-5])\s?[ªº°ao]\.?(?![a-z0-9])/;
const DAY_OF_MONTH = /^dias?\s+(\d{1,2})(?!\d)/;
const DAILY = /^todos\s+os\s+dias(?![a-z])/;
const RANGE_WORD = /^(?:a|ate)(?![a-z])/;
const FILLER = /^(?:e|ao|as|aos|o|os|toda|todo|todas|todos|de|do|da|dos|das|cada|mes|no|na|nos|nas|feiras?)(?![a-z])|^[,.;]|^-(?!\d)/;
const PARENTHESIS = /^\([^)]*\)/;

const TIME = /(?<!\d)(\d{1,2})\s*horas?(?![a-z])|(?<!\d)(\d{1,2})\s*(?:h|:)\s*(\d{2})?(?:\s*h(?![a-z]))?/g;
const RANGE_LINK = /^\s*(?:as|a|ao|ate|-)\s*/;
const BARE_RANGE_START = /(?<![\d:])(\d{1,2})\s*(?:as|a|ao|ate)\s*$/;
const TIME_LED = /^\s*\d{1,2}\s*(?:h|:)/;

const KIND_RULES: ReadonlyArray<readonly [RegExp, CelebrationKind]> = [
  [/celebracao da palavra/, "celebracao-palavra"],
  [/\bmissas?\b/, "missa"],
  [/\badoracao\b/, "adoracao"],
  [/\bbencao\b/, "outro"],
  [/\bs(?:antissi)?mo\.?\s+sacramento\b|\bsantissimo\b/, "adoracao"],
  [/\bconfiss/, "confissao"],
  [/\bterco\b/, "terco"],
  [/\bnovena\b/, "novena"],
  [/\bbatiz|\bgrupo de oracao|\bescola de oracao|\bcelebrac/, "outro"],
];

const MONTH_ORDINAL_NOTE = /^(primeir|segund|terceir|quart|ultim)[oa] do mes$/;
const MULTI_SPEC_SPLIT = /\s-\s(?=(?:domingo|segunda|terca|quarta|quinta|sexta|sabado))/g;
const TRAILING_REMARK = /\.\s+(?=caso\b|exceto\b|obs\b)/;
const PLAIN_MASS = /^(?:santa\s+)?missas?$/;

function matchWeekday(text: string): { weekday: Weekday; length: number } | null {
  for (const [pattern, weekday] of WEEKDAYS) {
    const match = pattern.exec(text);
    if (match) return { weekday, length: match[0].length };
  }
  return null;
}

function weekdayFollows(folded: string, index: number): boolean {
  const rest = folded.slice(index).replace(/^\s+/, "");
  return matchWeekday(rest) !== null;
}

function readSpec(original: string, folded: string, start: number): Spec | null {
  const items: Array<{ weekday: Weekday; weeks: number[] }> = [];
  const days: number[] = [];
  const notes: string[] = [];
  let pendingWeeks: number[] = [];
  let rangePending = false;
  let daily = false;
  let index = start;
  let end = start;

  const pushWeekday = (weekday: Weekday) => {
    const last = items.at(-1);
    if (rangePending && last) {
      let current = last.weekday;
      while (current !== weekday) {
        current = ((current + 1) % 7) as Weekday;
        items.push({ weekday: current, weeks: [] });
      }
    } else {
      items.push({ weekday, weeks: pendingWeeks });
    }
    pendingWeeks = [];
    rangePending = false;
  };

  while (index < folded.length) {
    const whitespace = /^\s+/.exec(folded.slice(index));
    if (whitespace) index += whitespace[0].length;
    const rest = folded.slice(index);
    if (!rest) break;

    let match: RegExpExecArray | null;
    if ((match = DAILY.exec(rest))) {
      daily = true;
    } else if ((match = DAY_OF_MONTH.exec(rest))) {
      days.push(Number(match[1]));
    } else if ((match = ORDINAL_NUMBER.exec(rest))) {
      pendingWeeks.push(Number(match[1]));
    } else if ((match = ORDINAL_WORD.exec(rest)) && (!matchWeekday(rest) || weekdayFollows(folded, index + match[0].length))) {
      pendingWeeks.push(ORDINAL_WORDS[match[1]!]!);
    } else {
      const weekday = matchWeekday(rest);
      if (weekday) {
        pushWeekday(weekday.weekday);
        index += weekday.length;
        end = index;
        continue;
      }
      if ((match = RANGE_WORD.exec(rest))) {
        rangePending = items.length > 0 && weekdayFollows(folded, index + match[0].length);
      } else if ((match = PARENTHESIS.exec(rest))) {
        notes.push(clean(original.slice(index + 1, index + match[0].length - 1)));
      } else if (!(match = FILLER.exec(rest))) {
        break;
      }
    }
    index += match[0].length;
    end = index;
  }

  if (!daily && items.length === 0 && days.length === 0) return null;

  const recurrences: Recurrence[] = [];
  const weekly = new Set<Weekday>(daily ? [0, 1, 2, 3, 4, 5, 6] : []);
  const monthly = new Map<Weekday, Set<number>>();
  for (const item of items) {
    if (item.weeks.length === 0) weekly.add(item.weekday);
    else {
      const weeks = monthly.get(item.weekday) ?? new Set<number>();
      item.weeks.forEach((week) => weeks.add(week));
      monthly.set(item.weekday, weeks);
    }
  }
  if (weekly.size > 0) recurrences.push({ type: "weekly", weekdays: [...weekly].sort((a, b) => a - b) });
  for (const [weekday, weeks] of monthly) {
    recurrences.push({
      type: "monthly-weekday",
      weekday,
      weeks: [...weeks].sort((a, b) => (a === -1 ? 1 : b === -1 ? -1 : a - b)) as Array<1 | 2 | 3 | 4 | 5 | -1>,
    });
  }
  for (const day of new Set(days)) recurrences.push({ type: "monthly-day", day });

  return { start, end, recurrences, notes };
}

function scanForSpec(original: string, folded: string): Spec | null {
  const wordStart = /(?<![a-z0-9])[a-z0-9]/g;
  for (const match of folded.matchAll(wordStart)) {
    if (match.index === 0) continue;
    const spec = readSpec(original, folded, match.index);
    if (spec && findTimes(folded.slice(spec.end)).length > 0) return spec;
  }
  return null;
}

function formatTime(hours: string, minutes = "0"): string | null {
  const h = Number(hours);
  const m = Number(minutes);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function findTimes(folded: string): TimeHit[] {
  const hits: TimeHit[] = [];
  for (const match of folded.matchAll(TIME)) {
    const time = formatTime(match[1] ?? match[2]!, match[3]);
    if (time) hits.push({ start: match.index, end: match.index + match[0].length, time });
  }

  const merged: TimeHit[] = [];
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i]!;
    const next = hits[i + 1];
    const link = next ? folded.slice(hit.end, next.start) : "";
    if (next && RANGE_LINK.test(link) && link.replace(RANGE_LINK, "") === "" && next.time > hit.time) {
      merged.push({ start: hit.start, end: next.end, time: hit.time, until: next.time });
      i++;
      continue;
    }
    const bare = BARE_RANGE_START.exec(folded.slice(0, hit.start));
    const startTime = bare ? formatTime(bare[1]!) : null;
    if (bare && startTime && startTime < hit.time) {
      merged.push({ start: bare.index, end: hit.end, time: startTime, until: hit.time });
      continue;
    }
    merged.push(hit);
  }
  return merged;
}

function detectKind(folded: string): CelebrationKind | null {
  for (const [pattern, kind] of KIND_RULES) if (pattern.test(folded)) return kind;
  return null;
}

function trimConnectors(value: string): string {
  let text = clean(value);
  let previous: string;
  do {
    previous = text;
    text = text
      .replace(/^(?:[,.:;–\-/]+|(?:e|às|as|das|a partir das|do mês|de cada mês)(?:\s+|$))/i, "")
      .replace(/(?:[,.:;–\-/]+|(?:^|\s+)(?:e|às|as|das|com))$/i, "")
      .trim();
  } while (text !== previous);
  return text;
}

function blank(value: string, start: number, end: number): string {
  return value.slice(0, start) + " ".repeat(end - start) + value.slice(end);
}

function splitRanges(folded: string, cuts: RegExp, keep: (left: string) => boolean = () => true): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let start = 0;
  for (const match of folded.matchAll(cuts)) {
    if (!keep(folded.slice(start, match.index))) continue;
    ranges.push([start, match.index]);
    start = match.index + match[0].length;
  }
  ranges.push([start, folded.length]);
  return ranges;
}

function splitClauses(folded: string): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (const [a, b] of splitRanges(folded, /\s*(?:;|\s\/\s|\s-\s)\s*/g)) {
    const segment = folded.slice(a, b);
    for (const [c, d] of splitRanges(segment, /,\s*(?=[a-z])/g, (left) => findTimes(left).length > 0)) {
      const piece = segment.slice(c, d);
      const keyword = /\s+e\s+(?=(?:a\s+|o\s+)?(?:santa\s+)?(?:missa|adoracao|bencao|terco|novena|confiss|celebracao))/g;
      for (const [e, f] of splitRanges(piece, keyword)) result.push([a + c + e, a + c + f]);
    }
  }
  return result.filter(([start, end]) => folded.slice(start, end).trim().length > 0);
}

function parseSlots(original: string, hint: CelebrationKind | null): { slots: Slot[]; notes: string[]; monthOrdinal: number | null } {
  const notes: string[] = [];
  let text = original;
  const remark = TRAILING_REMARK.exec(fold(text));
  if (remark) {
    notes.push(clean(text.slice(remark.index + 1)));
    text = text.slice(0, remark.index);
  }

  let folded = fold(text);
  let working = text;
  const timeNotes = new Map<number, string>();
  let monthOrdinal: number | null = null;
  const parentheses = [...folded.matchAll(/\(([^)]*)\)/g)];

  for (const match of parentheses) {
    const inner = clean(text.slice(match.index + 1, match.index + match[0].length - 1)).replace(/^obs\.?:?\s*/i, "");
    const foldedInner = fold(inner);
    const ordinal = MONTH_ORDINAL_NOTE.exec(foldedInner);
    if (ordinal) monthOrdinal = ORDINAL_WORDS[ordinal[1]!]!;
    else {
      const before = findTimes(folded.slice(0, match.index)).at(-1);
      const gap = before ? folded.slice(before.end, match.index) : null;
      if (before && gap !== null && gap.trim() === "") timeNotes.set(before.start, inner);
      else notes.push(inner);
    }
    working = blank(working, match.index, match.index + match[0].length);
  }
  folded = fold(working);

  const bare = /^\s*:?\s*(\d{1,2})\s*$/.exec(folded);
  if (bare) {
    const time = formatTime(bare[1]!);
    return { slots: time ? [{ time, kind: hint ?? "missa" }] : [], notes, monthOrdinal };
  }

  const clauses: Clause[] = splitClauses(folded).map(([start, end]) => {
    const clauseFolded = folded.slice(start, end);
    const times = findTimes(clauseFolded).map((hit) => ({ ...hit, start: hit.start + start, end: hit.end + start }));
    let remainder = working;
    for (const hit of times) remainder = blank(remainder, hit.start, hit.end);
    const clauseText = trimConnectors(remainder.slice(start, end));
    return {
      times,
      kind: detectKind(clauseFolded),
      text: PLAIN_MASS.test(fold(clauseText)) ? "" : clauseText,
    };
  });

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i]!;
    if (clause.times.length > 0 || (!clause.text && !clause.kind)) continue;
    const next = clauses.slice(i + 1).find((candidate) => candidate.times.length > 0);
    const previous = clauses.slice(0, i).findLast((candidate) => candidate.times.length > 0);
    if (next && clauses.indexOf(next) === i + 1) {
      next.kind ??= clause.kind;
      next.text = [clause.text, next.text].filter(Boolean).join(" e ");
    } else if (previous) {
      previous.kind ??= clause.kind;
      previous.text = [previous.text, clause.text].filter(Boolean).join(" · ");
    } else if (clause.text) {
      notes.push(clause.text);
    }
  }

  const slots: Slot[] = [];
  for (const clause of clauses) {
    for (const hit of clause.times) {
      const timeNote = timeNotes.get(hit.start);
      const kind = (timeNote && detectKind(fold(timeNote)) === "celebracao-palavra" ? "celebracao-palavra" : null) ?? clause.kind ?? hint ?? "missa";
      const note = [clause.text, timeNote].filter(Boolean).map((value) => capitalize(value!)).join(" · ");
      slots.push({ time: hit.time, ...(hit.until ? { until: hit.until } : {}), kind, ...(note ? { note } : {}) });
    }
  }
  return { slots, notes, monthOrdinal };
}

function applyMonthOrdinal(recurrences: Recurrence[], ordinal: number | null): Recurrence[] {
  const only = recurrences[0];
  if (ordinal === null || recurrences.length !== 1 || only?.type !== "weekly" || only.weekdays.length !== 1) return recurrences;
  return [{ type: "monthly-weekday", weekday: only.weekdays[0]!, weeks: [ordinal as 1 | 2 | 3 | 4 | 5 | -1] }];
}

function normalizeLine(raw: string): string {
  return clean(raw)
    .replace(/^[–\-•*]\s*/, "")
    .replace(/^obs\.?:?\s+/i, "")
    .replace(/[;.]+$/, "");
}

export function splitScheduleLine(raw: string): string[] {
  const line = normalizeLine(raw);
  const folded = fold(line);
  const parts: string[] = [];
  let start = 0;
  for (const match of folded.matchAll(MULTI_SPEC_SPLIT)) {
    parts.push(line.slice(start, match.index));
    start = match.index + match[0].length;
  }
  parts.push(line.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

export function startsWithSchedule(raw: string): boolean {
  const line = normalizeLine(raw);
  const folded = fold(line);
  return readSpec(line, folded, 0) !== null || scanForSpec(line, folded) !== null;
}

export function parseSchedule(lines: string[]): ScheduleResult {
  const celebrations: Celebration[] = [];
  const notes: string[] = [];
  let pending: Spec | undefined;

  for (const line of lines.flatMap(splitScheduleLine)) {
    const folded = fold(line);
    let spec = readSpec(line, folded, 0);
    let label = "";

    if (spec) pending = undefined;
    else if (TIME_LED.test(folded) && pending) spec = { recurrences: pending.recurrences, notes: pending.notes, start: 0, end: 0 };
    else {
      spec = scanForSpec(line, folded);
      if (spec) label = trimConnectors(line.slice(0, spec.start).replace(/\b(?:aos?|às|nas?|nos?)\s*$/i, ""));
    }

    if (!spec) {
      notes.push(line);
      continue;
    }

    const hint = label ? detectKind(fold(label)) : null;
    const { slots, notes: lineNotes, monthOrdinal } = parseSlots(line.slice(spec.end), hint);

    if (slots.length === 0) {
      if (spec.start === 0 && spec.end > 0 && lineNotes.length === 0 && line.slice(spec.end).trim() === "") pending = spec;
      else notes.push(line);
      continue;
    }

    const recurrences = applyMonthOrdinal(spec.recurrences, monthOrdinal);
    const extra = [label, ...spec.notes, ...lineNotes].filter(Boolean).map(capitalize);
    for (const recurrence of recurrences) {
      for (const slot of slots) {
        const note = [slot.note, ...extra].filter(Boolean).join(" · ");
        celebrations.push({
          recurrence,
          time: slot.time,
          ...(slot.until ? { end: slot.until } : {}),
          kind: slot.kind,
          ...(note ? { note } : {}),
          source: line,
        });
      }
    }
  }

  return { celebrations, notes };
}
