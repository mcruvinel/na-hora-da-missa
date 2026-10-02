import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const Weekday = z.number().int().min(0).max(6);
export type Weekday = z.infer<typeof Weekday>;

export const WEEKDAY_NAMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"] as const;

export const Recurrence = z.discriminatedUnion("type", [
  z.object({ type: z.literal("weekly"), weekdays: z.array(Weekday).min(1) }),
  z.object({
    type: z.literal("monthly-weekday"),
    weekday: Weekday,
    weeks: z.array(z.union([z.number().int().min(1).max(5), z.literal(-1)])).min(1),
  }),
  z.object({ type: z.literal("monthly-day"), day: z.number().int().min(1).max(31) }),
]);
export type Recurrence = z.infer<typeof Recurrence>;

export const CelebrationKind = z.enum([
  "missa",
  "celebracao-palavra",
  "adoracao",
  "confissao",
  "terco",
  "novena",
  "outro",
]);
export type CelebrationKind = z.infer<typeof CelebrationKind>;

const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const Celebration = z.object({
  recurrence: Recurrence,
  time: Time,
  end: Time.optional(),
  kind: CelebrationKind,
  note: z.string().optional(),
  source: z.string(),
});
export type Celebration = z.infer<typeof Celebration>;

export const Location = z.object({
  lat: z.number(),
  lng: z.number(),
  precision: z.enum(["address", "street", "place"]),
});
export type Location = z.infer<typeof Location>;

export const CommunityType = z.enum([
  "matriz",
  "catedral",
  "santuario",
  "igreja",
  "capela",
  "comunidade",
  "mosteiro",
  "cemiterio",
]);
export type CommunityType = z.infer<typeof CommunityType>;

export const Community = z.object({
  id: z.string(),
  name: z.string(),
  type: CommunityType,
  address: z.string().nullable(),
  location: Location.nullable(),
  celebrations: z.array(Celebration),
  notes: z.array(z.string()),
  raw: z.array(z.string()),
});
export type Community = z.infer<typeof Community>;

export const ParishKind = z.enum(["paroquia", "capelania", "santuario"]);
export type ParishKind = z.infer<typeof ParishKind>;

export const Parish = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  kind: ParishKind,
  city: z.string().nullable(),
  forania: z.string().nullable(),
  patron: z.string().nullable(),
  url: z.url(),
  address: z.string().nullable(),
  location: Location.nullable(),
  contact: z.object({
    phone: z.string().nullable(),
    email: z.string().nullable(),
    whatsapp: z.string().nullable(),
    website: z.string().nullable(),
    instagram: z.string().nullable(),
    facebook: z.string().nullable(),
    youtube: z.string().nullable(),
  }),
  clergy: z.object({
    pastor: z.string().nullable(),
    vicars: z.array(z.string()),
    deacons: z.array(z.string()),
  }),
  office: z.array(z.string()),
  communities: z.array(Community),
  updatedAt: z.string(),
});
export type Parish = z.infer<typeof Parish>;

export const ParishesFile = z.object({
  version: z.literal(SCHEMA_VERSION),
  generatedAt: z.iso.datetime({ offset: true }),
  source: z.url(),
  parishes: z.array(Parish),
});
export type ParishesFile = z.infer<typeof ParishesFile>;

export const Segment = z.object({ verse: z.string().optional(), text: z.string() });
export type Segment = z.infer<typeof Segment>;

export const ReadingLine = z.object({
  role: z.enum(["rubric", "text", "versicle", "response"]),
  segments: z.array(Segment).min(1),
});
export type ReadingLine = z.infer<typeof ReadingLine>;

export const ReadingKind = z.enum(["first", "psalm", "second", "gospel"]);
export type ReadingKind = z.infer<typeof ReadingKind>;

export const Reading = z.object({
  kind: ReadingKind,
  title: z.string(),
  reference: z.string(),
  lines: z.array(ReadingLine).min(1),
});
export type Reading = z.infer<typeof Reading>;

export const LiturgicalColor = z.enum(["verde", "roxo", "branco", "vermelho", "rosa", "preto"]);
export type LiturgicalColor = z.infer<typeof LiturgicalColor>;

export const LiturgyFile = z.object({
  version: z.literal(SCHEMA_VERSION),
  generatedAt: z.iso.datetime({ offset: true }),
  source: z.url(),
  date: z.iso.date(),
  celebration: z.string(),
  color: LiturgicalColor.nullable(),
  readings: z.array(Reading).min(3),
});
export type LiturgyFile = z.infer<typeof LiturgyFile>;
