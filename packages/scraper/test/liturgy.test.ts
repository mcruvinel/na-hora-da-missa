import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseLiturgy } from "../src/liturgy.ts";

const html = readFileSync(new URL("./fixtures/liturgy.html", import.meta.url), "utf8");

describe("parseLiturgy", () => {
  const liturgy = parseLiturgy(html, new Date("2026-10-02T12:00:00-03:00"));

  it("lê data, celebração e cor litúrgica", () => {
    assert.equal(liturgy.date, "2026-10-02");
    assert.equal(liturgy.celebration, "Santos Anjos da Guarda – Memória");
    assert.equal(liturgy.color, "branco");
  });

  it("lê as leituras com referência", () => {
    assert.deepEqual(
      liturgy.readings.map((r) => [r.kind, r.reference]),
      [
        ["first", "Ex 23,20-23"],
        ["psalm", "Sl 90(91),1-2.3-4.5-6.10-11 (R. 11)"],
        ["gospel", "Mt 18,1-5.10"],
      ],
    );
  });

  it("separa versículos numerados e respostas da assembleia", () => {
    const first = liturgy.readings[0]!;
    const text = first.lines.find((line) => line.role === "text")!;
    assert.deepEqual(text.segments.slice(0, 2), [
      { text: "Assim diz o Senhor:" },
      { verse: "20", text: '"Vou enviar um anjo que vá à tua frente, que te guarde pelo caminho e te conduza ao lugar que te preparei.' },
    ]);
    assert.deepEqual(first.lines.at(-1), { role: "response", segments: [{ text: "Graças a Deus." }] });
    assert.equal(first.lines[0]?.role, "rubric");
  });
});
