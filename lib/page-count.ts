import "server-only";
import { PDFDocument } from "pdf-lib";
import { IMAGE_PAGE_WEIGHT } from "@/lib/coins";
import { IMAGE_MIME } from "@/lib/run-schema";

// 📚 Phase 3: 가중 페이지 카운트(서버 권위, spec §6).
// Vercel 서버리스엔 pdfinfo 없어 순수 JS(pdf-lib)로 카운트. 이미지=2쪽, PDF=실제 페이지.
// 깨진/암호화 PDF는 1쪽 보수 처리(런너가 pdfinfo로 재카운트·백스톱).
export async function countWeightedPages(
  files: { type: string; bytes: Uint8Array }[],
): Promise<number> {
  let pdfPages = 0;
  let imageCount = 0;
  for (const f of files) {
    if (IMAGE_MIME.has(f.type)) {
      imageCount++;
      continue;
    }
    try {
      const doc = await PDFDocument.load(f.bytes, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      pdfPages += doc.getPageCount();
    } catch {
      pdfPages += 1; // 파싱 실패 보수 처리
    }
  }
  return pdfPages + imageCount * IMAGE_PAGE_WEIGHT;
}
