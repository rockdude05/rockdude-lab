import { describe, it, expect } from "vitest";
import { countWeightedPages } from "@/lib/page-count";
import { PDFDocument } from "pdf-lib";

describe("page-count", () => {
  it("이미지만 = 개수×2", async () => {
    const r = await countWeightedPages([
      { type: "image/png", bytes: new Uint8Array() },
      { type: "image/jpeg", bytes: new Uint8Array() },
    ]);
    expect(r).toBe(4); // 2 images * 2
  });
  it("빈 입력 = 0", async () => {
    expect(await countWeightedPages([])).toBe(0);
  });
  it("실제 PDF 페이지 수 카운트", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.addPage();
    doc.addPage();
    const bytes = await doc.save();
    expect(await countWeightedPages([{ type: "application/pdf", bytes }])).toBe(3);
  });
  it("PDF + 이미지 혼합 = 페이지 + 이미지×2", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const r = await countWeightedPages([
      { type: "application/pdf", bytes },
      { type: "image/png", bytes: new Uint8Array() },
    ]);
    expect(r).toBe(3); // 1 page + 1 image*2
  });
  it("깨진 PDF = 1쪽 보수 처리", async () => {
    const r = await countWeightedPages([
      { type: "application/pdf", bytes: new Uint8Array([1, 2, 3, 4]) },
    ]);
    expect(r).toBe(1);
  });
});
