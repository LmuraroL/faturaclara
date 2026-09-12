import type { Lancamento } from "../types";
import { classificar, deveIgnorar, eEntrada, normalizar } from "./classificar";
import { parseBRL } from "./dinheiro";

const MESES: Record<string, string> = {
  JAN: "01",
  FEV: "02",
  MAR: "03",
  ABR: "04",
  MAI: "05",
  JUN: "06",
  JUL: "07",
  AGO: "08",
  SET: "09",
  OUT: "10",
  NOV: "11",
  DEZ: "12",
};

const MESES_RE = "JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ";

const RE_DATA_LINHA = new RegExp(
  `^(\\d{2}[\\/\\-]\\d{2}(?:[\\/\\-]\\d{2,4})?|\\d{2}\\s+(?:${MESES_RE}))\\b`,
  "i",
);

const RE_VALOR_FIM =
  /([−–-])?\s*(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})(?:\s*[−–-])?\s*$/;

function formatarData(bruta: string): string {
  const m = bruta.trim().match(/^(\d{2})[\/\-](\d{2})(?:[\/\-](\d{2,4}))?$/);
  if (m) return `${m[1]}/${m[2]}`;
  const mes = bruta.trim().match(/^(\d{2})\s+([A-Z]{3})/i);
  if (mes) {
    const mm = MESES[mes[2].toUpperCase()];
    return mm ? `${mes[1]}/${mm}` : bruta.trim();
  }
  return bruta.trim();
}

function limparDescricao(texto: string): string {
  return texto
    .replace(/\s+/g, " ")
    .replace(/^[*\-–−]+\s*/, "")
    .replace(/[−–-]\s*$/, "")
    .trim();
}

function pularResumo(descricao: string): boolean {
  const n = normalizar(descricao);
  return [
    "LIMITE TOTAL",
    "LIMITE DISPONIVEL",
    "TOTAL A PAGAR",
    "TOTAL DE COMPRAS",
    "VALOR MAXIMO",
    "SALDO EM ABERTO",
    "SALDO RESTANTE",
    "FATURA ATUAL",
    "PROXIMAS FATURAS",
    "FECHAMENTO",
    "EMISSAO E ENVIO",
    "RESUMO DA FATURA",
  ].some((p) => n.includes(p));
}

function montarLancamento(
  indice: number,
  data: string,
  descricao: string,
  valor: number,
  negativo: boolean,
): Lancamento | null {
  const desc = limparDescricao(descricao);
  if (desc.length < 3) return null;
  if (!Number.isFinite(valor) || valor <= 0) return null;
  if (pularResumo(desc)) return null;
  const entrada = negativo || eEntrada(desc);
  if (!entrada && deveIgnorar(desc)) return null;
  const classe = entrada
    ? { categoria: "pagamento" as const, natureza: "essencial" as const, regra: "pagamento / crédito" }
    : classificar(desc);

  return {
    id: `pdf-${indice}-${data}-${valor}-${desc.slice(0, 16)}`,
    data,
    descricao: desc,
    valor,
    categoria: classe.categoria,
    natureza: classe.natureza,
    regra: classe.regra,
    tipo: entrada ? "entrada" : "saida",
  };
}

function recorteTransacoes(texto: string): string | null {
  const m = texto.match(/(?:^|\n)TRANSA[CÇ][OÕ]ES\s*\n([\s\S]*)/i);
  if (!m) return null;
  return m[1]
    .replace(/\nEm cumprimento[\s\S]*/i, "")
    .replace(/\nComo assegurado[\s\S]*/i, "");
}

function juntarDatasQuebradas(texto: string): string {
  const re = new RegExp(`(\\d{2}\\s+(?:${MESES_RE}))\\s*\\n+`, "gi");
  return texto.replace(re, "$1 ");
}

function extrairPorDataValor(texto: string): Lancamento[] {
  const re = new RegExp(
    `(\\d{2}\\s+(?:${MESES_RE}))(?!\\s+a\\s)[ \\t]+([\\s\\S]*?)([−–-])?\\s*R\\$\\s*(\\d{1,3}(?:\\.\\d{3})*,\\d{2})`,
    "gi",
  );
  const achados: Lancamento[] = [];
  const vistos = new Set<string>();
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(texto)) !== null) {
    const dataBruta = m[1];
    const desc = m[2];
    const negativo = Boolean(m[3]) || /[−–-]/.test(desc.slice(-3));
    const lanc = montarLancamento(
      i++,
      formatarData(dataBruta),
      desc,
      parseBRL(m[4]),
      negativo,
    );
    if (!lanc) continue;
    const chave = `${lanc.tipo}|${lanc.data}|${lanc.descricao}|${lanc.valor}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    achados.push(lanc);
  }
  return achados;
}

function tentarLinha(linha: string, indice: number): Lancamento | null {
  const t = linha.replace(/\s+/g, " ").trim();
  if (t.length < 8) return null;
  const dataMatch = t.match(RE_DATA_LINHA);
  const valorMatch = t.match(RE_VALOR_FIM);
  if (!dataMatch || !valorMatch) return null;

  const data = formatarData(dataMatch[1]);
  const valor = parseBRL(valorMatch[2]);
  const negativo = Boolean(valorMatch[1]);
  const meio = t.slice(dataMatch[0].length, t.length - valorMatch[0].length).trim();
  return montarLancamento(indice, data, meio, valor, negativo);
}

function extrairPorLinhas(texto: string): Lancamento[] {
  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const achados: Lancamento[] = [];
  const vistos = new Set<string>();

  for (let i = 0; i < linhas.length; i++) {
    const direto = tentarLinha(linhas[i], i);
    let candidato = direto;
    if (!candidato && i + 1 < linhas.length) {
      candidato = tentarLinha(`${linhas[i]} ${linhas[i + 1]}`, i);
    }
    if (!candidato) continue;
    const chave = `${candidato.tipo}|${candidato.data}|${candidato.descricao}|${candidato.valor}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    achados.push(candidato);
  }

  return achados;
}

export function extrairLancamentos(texto: string): Lancamento[] {
  const recorte = recorteTransacoes(texto);
  const alvo = juntarDatasQuebradas(recorte ?? texto);
  const porData = extrairPorDataValor(alvo);
  if (porData.length >= 2) return porData;
  return extrairPorLinhas(alvo);
}
