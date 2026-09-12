import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

type ItemTexto = {
  str: string;
  x: number;
  y: number;
};

export async function extrairTextoPdf(arquivo: File): Promise<string> {
  const data = await arquivo.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const paginas: string[] = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const items: ItemTexto[] = [];
    for (const raw of content.items) {
      if (!("str" in raw) || !raw.str.trim()) continue;
      const t = raw.transform;
      items.push({ str: raw.str, x: t[4], y: t[5] });
    }
    paginas.push(linhasPorPosicao(items).join("\n"));
  }

  return paginas.join("\n");
}

function linhasPorPosicao(items: ItemTexto[]): string[] {
  const linhas = new Map<number, ItemTexto[]>();
  for (const item of items) {
    const y = Math.round(item.y / 3) * 3;
    const lista = linhas.get(y) ?? [];
    lista.push(item);
    linhas.set(y, lista);
  }
  const ys = [...linhas.keys()].sort((a, b) => b - a);
  return ys.map((y) =>
    (linhas.get(y) ?? [])
      .sort((a, b) => a.x - b.x)
      .map((i) => i.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}
