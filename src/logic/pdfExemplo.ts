import { textoFaturaExemplo } from "./demo";

function escapar(texto: string): string {
  return texto.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function streamDaFatura(): string {
  const linhas = textoFaturaExemplo().split("\n");
  const cmds = ["BT", "/F1 9 Tf", "50 780 Td"];
  linhas.forEach((linha, i) => {
    if (i > 0) cmds.push("0 -12 Td");
    cmds.push(`(${escapar(linha.slice(0, 92))}) Tj`);
  });
  cmds.push("ET");
  return cmds.join("\n");
}

export function blobPdfExemplo(): Blob {
  const stream = streamDaFatura();
  const objs = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj",
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objs) {
    offsets.push(body.length);
    body += `${obj}\n`;
  }
  const xrefPos = body.length;
  body += `xref\n0 ${objs.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (let i = 1; i <= objs.length; i++) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return new Blob([body], { type: "application/pdf" });
}

export function baixarPdfExemplo(): void {
  const url = URL.createObjectURL(blobPdfExemplo());
  const a = document.createElement("a");
  a.href = url;
  a.download = "fatura-exemplo-faturaclara.pdf";
  a.click();
  URL.revokeObjectURL(url);
}
