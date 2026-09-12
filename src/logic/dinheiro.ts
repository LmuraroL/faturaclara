export function parseBRL(texto: string): number {
  const limpo = texto.replace(/[R$\s]/gi, "");
  if (!limpo) return NaN;
  const normal = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  return Number(normal);
}

export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarPct(valor: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((valor / total) * 100)}%`;
}

export function soma(valores: number[]): number {
  return valores.reduce((acc, n) => acc + n, 0);
}
