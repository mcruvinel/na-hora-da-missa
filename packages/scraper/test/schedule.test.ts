import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSchedule } from "../src/diocese/schedule.ts";

const summarize = (lines: string[]) =>
  parseSchedule(lines).celebrations.map(({ recurrence, time, end, kind, note }) => ({ recurrence, time, end, kind, note }));

describe("parseSchedule", () => {
  it("lê dias da semana com vários horários", () => {
    assert.deepEqual(summarize(["Domingo: 7h, 9h e 19h30"]), [
      { recurrence: { type: "weekly", weekdays: [0] }, time: "07:00", end: undefined, kind: "missa", note: undefined },
      { recurrence: { type: "weekly", weekdays: [0] }, time: "09:00", end: undefined, kind: "missa", note: undefined },
      { recurrence: { type: "weekly", weekdays: [0] }, time: "19:30", end: undefined, kind: "missa", note: undefined },
    ]);
  });

  it("expande intervalos e listas de dias", () => {
    assert.deepEqual(summarize(["Segunda à Sexta-feira: 7h"])[0]?.recurrence, { type: "weekly", weekdays: [1, 2, 3, 4, 5] });
    assert.deepEqual(summarize(["Terça, quarta, quinta e sexta-feira: 19h"])[0]?.recurrence, { type: "weekly", weekdays: [2, 3, 4, 5] });
    assert.deepEqual(summarize(["Segunda a domingo: 7h"])[0]?.recurrence, { type: "weekly", weekdays: [0, 1, 2, 3, 4, 5, 6] });
    assert.deepEqual(summarize(["Todos os dias: 7h"])[0]?.recurrence, { type: "weekly", weekdays: [0, 1, 2, 3, 4, 5, 6] });
  });

  it("distingue ordinal de dia da semana", () => {
    assert.deepEqual(summarize(["Segunda quarta-feira do Mês: 15h (Missa da Saúde)"])[0]?.recurrence, {
      type: "monthly-weekday",
      weekday: 3,
      weeks: [2],
    });
    assert.deepEqual(summarize(["Segunda, quarta e sexta: 7h"])[0]?.recurrence, { type: "weekly", weekdays: [1, 3, 5] });
    assert.deepEqual(summarize(["2ª e 4ª Sexta-feira do mês: 19h30"])[0]?.recurrence, {
      type: "monthly-weekday",
      weekday: 5,
      weeks: [2, 4],
    });
    assert.deepEqual(summarize(["Último sábado do mês às 20h"])[0]?.recurrence, { type: "monthly-weekday", weekday: 6, weeks: [-1] });
  });

  it("converte o ordinal entre parênteses em recorrência mensal", () => {
    assert.deepEqual(summarize(["Sábado: 20h (terceiro do mês)"])[0]?.recurrence, { type: "monthly-weekday", weekday: 6, weeks: [3] });
  });

  it("lê dia fixo do mês com observação", () => {
    const [celebration] = summarize(["Todo dia 19: Missa votiva a São José às 19h"]);
    assert.deepEqual(celebration, {
      recurrence: { type: "monthly-day", day: 19 },
      time: "19:00",
      end: undefined,
      kind: "missa",
      note: "Missa votiva a São José",
    });
  });

  it("separa adoração com intervalo da missa na mesma linha", () => {
    assert.deepEqual(
      summarize(["Quinta-feira: Adoração ao Santíssimo Sacramento, das 7h às 19h e Missa com comunhão em duas espécies, às 19h30;"]),
      [
        { recurrence: { type: "weekly", weekdays: [4] }, time: "07:00", end: "19:00", kind: "adoracao", note: "Adoração ao Santíssimo Sacramento" },
        { recurrence: { type: "weekly", weekdays: [4] }, time: "19:30", end: undefined, kind: "missa", note: "Missa com comunhão em duas espécies" },
      ],
    );
  });

  it("associa a observação entre parênteses ao horário anterior", () => {
    const result = summarize(["Domingo: 8h30 (Celebração da Palavra) e 17h30"]);
    assert.equal(result[0]?.kind, "celebracao-palavra");
    assert.equal(result[1]?.kind, "missa");
    assert.equal(result[1]?.note, undefined);
  });

  it("usa o rótulo antes do dia como tipo da celebração", () => {
    const [celebration] = summarize(["Terço dos Homens: segundas–feiras às 20h"]);
    assert.equal(celebration?.kind, "terco");
    assert.equal(celebration?.note, "Terço dos Homens");
    assert.deepEqual(celebration?.recurrence, { type: "weekly", weekdays: [1] });
  });

  it("aplica a regra de uma linha sem horário às linhas seguintes", () => {
    const result = summarize(["Todo dia 18 de cada mês", "18h30: Adoração ao Santíssimo Sacramento", "19h30: Missa da Saúde."]);
    assert.deepEqual(
      result.map((c) => [c.recurrence, c.time, c.kind]),
      [
        [{ type: "monthly-day", day: 18 }, "18:30", "adoracao"],
        [{ type: "monthly-day", day: 18 }, "19:30", "missa"],
      ],
    );
  });

  it("aceita formatos irregulares de horário", () => {
    assert.equal(summarize(["Quarta-feira:12h00"])[0]?.time, "12:00");
    assert.equal(summarize(["Terça-feira às 19:30h"])[0]?.time, "19:30");
    assert.equal(summarize(["Todo Domingo às 19 horas"])[0]?.time, "19:00");
    assert.equal(summarize(["Segunda-feira: 18"])[0]?.time, "18:00");
  });

  it("divide linhas com mais de um dia", () => {
    assert.deepEqual(
      summarize(["– Quarta-feira: 19h – Sábado: 19h"]).map((c) => c.recurrence),
      [
        { type: "weekly", weekdays: [3] },
        { type: "weekly", weekdays: [6] },
      ],
    );
  });

  it("guarda como observação o que não tem regra clara", () => {
    const result = parseSchedule(["Santa Missa uma vez por mês às 19h30 / Data Móvel (Consultar Secretaria)"]);
    assert.equal(result.celebrations.length, 0);
    assert.equal(result.notes.length, 1);
  });
});
