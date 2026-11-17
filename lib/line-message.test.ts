import { describe, expect, it } from "vitest";
import { contact } from "@/content/contact";
import { buildQuery, parseFrom } from "@/lib/params";

const { quoteRequest, from } = contact.messages;

describe("advisor LINE message (quoteRequest)", () => {
  it("puts one detail per line, with blanks for the customer", () => {
    expect(
      quoteRequest({ car: "Toyota Corolla Cross", year: 2022, trim: "1.8 Hybrid Premium", from: from.model("Toyota Corolla Cross") }),
    ).toBe(
      [
        "ขอราคาประกันรถยนต์ (จากเว็บไซต์)",
        "รถ: Toyota Corolla Cross",
        "ปีรถ: 2022",
        "รุ่นย่อย/เครื่องยนต์: 1.8 Hybrid Premium",
        "ประเภทประกัน: (ชั้น 1 / 2+ / 3+)",
        "รูปแบบการซ่อม: (ซ่อมห้าง / ซ่อมอู่)",
        "ประกันเดิมหมดอายุ: (ระบุวันที่ / ยังไม่มี)",
        "(จากหน้า: Toyota Corolla Cross)",
      ].join("\n"),
    );
  });

  it("marks EV cars and leaves unknown fields blank", () => {
    const text = quoteRequest({ car: "BYD Atto 3", ev: true, year: null, trim: null, from: from.home });
    expect(text).toContain("รถ: BYD Atto 3 (EV)\nปีรถ: \nรุ่นย่อย/เครื่องยนต์: \n");
    expect(text.endsWith("(จากหน้า: หน้าแรก)")).toBe(true);
  });

  it("works with no car at all and no source page", () => {
    const text = quoteRequest({});
    expect(text.split("\n")[1]).toBe("รถ: ");
    expect(text).not.toContain("(EV)");
    expect(text).not.toContain("จากหน้า");
  });

  it("adds plan lines only when there are plans", () => {
    expect(quoteRequest({ plans: ["แผน A"] })).toContain("แผนที่สนใจ: แผน A");
    expect(quoteRequest({ plans: [] })).not.toContain("แผนที่สนใจ");
  });
});

describe("from param", () => {
  it("accepts only known pages", () => {
    expect(parseFrom({ from: "home" })).toBe("home");
    expect(parseFrom({ from: "model" })).toBe("model");
    expect(parseFrom({ from: "evil<script>" })).toBeUndefined();
    expect(parseFrom({})).toBeUndefined();
  });

  it("is written to the URL", () => {
    expect(buildQuery({ from: "home" })).toBe("?from=home");
  });
});
