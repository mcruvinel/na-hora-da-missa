import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { Parish } from "@horadamissa/schema";
import type { ParishRef } from "../src/diocese/api.ts";
import { buildParish } from "../src/parishes.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

const ref = (wpId: number, name: string): ParishRef => ({
  wpId,
  slug: "fixture",
  url: "https://diocesedeuberlandia.org.br/paroquias/fixture/",
  name,
  updatedAt: "2026-01-01T00:00:00Z",
  kind: "paroquia",
  city: "Uberlândia",
  forania: null,
  patron: null,
});

describe("buildParish", () => {
  it("extrai contato, clero, atendimento e comunidades", () => {
    const parish = Parish.parse(buildParish(ref(1355, "São José"), fixture("parish-sao-jose.html")));

    assert.equal(parish.id, "p1355");
    assert.match(parish.address ?? "", /^Rua Polidoro de Freitas Rodrigues, 736/);
    assert.equal(parish.contact.phone, "(34) 3224-0535");
    assert.equal(parish.contact.whatsapp, "5534996921409");
    assert.equal(parish.clergy.pastor, "Pe. Sérgio de Siqueira Camargo");
    assert.deepEqual(parish.clergy.vicars, ["Pe. João Pedro Rodrigues"]);
    assert.deepEqual(parish.office, ["SECRETARIA", "Segunda a sexta-feira das 13h às 18h"]);

    assert.deepEqual(
      parish.communities.map((c) => [c.id, c.type, c.address]),
      [
        ["p1355-matriz-sao-jose", "matriz", "Rua Polidoro de Freitas Rodrigues, 736 – Vigilato Pereira"],
        ["p1355-comunidade-nossa-senhora-das-gracas", "comunidade", "Rua Pirapuã, 391 – Jardim Karaíba"],
      ],
    );

    const matriz = parish.communities[0]!;
    const friday = matriz.celebrations.find((c) => c.recurrence.type === "weekly" && c.recurrence.weekdays.includes(5));
    assert.equal(friday?.time, "19:00");
    assert.ok(matriz.celebrations.some((c) => c.kind === "terco" && c.time === "20:00"));
    assert.ok(matriz.notes.includes("Batizados: 4º Domingo de cada mês"));
  });

  it("combina cabeçalhos de regra com as linhas de horário seguintes", () => {
    const parish = buildParish(ref(1365, "Sagrada Família"), fixture("parish-sagrada-familia.html"));
    const matriz = parish.communities.find((c) => c.type === "matriz")!;
    const firstFriday = matriz.celebrations.filter(
      (c) => c.recurrence.type === "monthly-weekday" && c.recurrence.weekday === 5 && c.recurrence.weeks.includes(1),
    );
    assert.deepEqual(
      firstFriday.map((c) => [c.time, c.kind]),
      [
        ["18:30", "adoracao"],
        ["19:30", "missa"],
      ],
    );
  });
});
