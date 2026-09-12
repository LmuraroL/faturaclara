import type { Lancamento } from "../types";
import { classificar } from "./classificar";

export type BrutoDemo = {
  data: string;
  descricao: string;
  valor: number;
};

export const LANCAMENTOS_BRUTOS_DEMO: BrutoDemo[] = [
  { data: "08/08", descricao: "SUPERMERCADO EXTRA", valor: 186.4 },
  { data: "09/08", descricao: "IFOOD *BURGER HOUSE", valor: 54.9 },
  { data: "09/08", descricao: "UBER *TRIP", valor: 18.4 },
  { data: "10/08", descricao: "DROGARIA SAO PAULO", valor: 47.8 },
  { data: "11/08", descricao: "NETFLIX.COM", valor: 55.9 },
  { data: "12/08", descricao: "PADARIA SAO JOSE", valor: 28.5 },
  { data: "13/08", descricao: "IFOOD *PIZZA NAPOLI", valor: 89.0 },
  { data: "14/08", descricao: "POSTO IPIRANGA", valor: 182.3 },
  { data: "15/08", descricao: "SPOTIFY BRASIL", valor: 21.9 },
  { data: "16/08", descricao: "CARREFOUR HIPER", valor: 221.15 },
  { data: "16/08", descricao: "UBER *TRIP", valor: 12.7 },
  { data: "17/08", descricao: "OUTBACK STEAKHOUSE", valor: 189.0 },
  { data: "18/08", descricao: "IFOOD *COMIDA CASEIRA", valor: 42.5 },
  { data: "19/08", descricao: "DISNEY PLUS", valor: 27.9 },
  { data: "20/08", descricao: "MERCADO LIVRE *ML", valor: 96.0 },
  { data: "21/08", descricao: "IFOOD *ACAI E CIA", valor: 38.0 },
  { data: "22/08", descricao: "STARBUCKS COFFEE", valor: 22.4 },
  { data: "23/08", descricao: "PAO DE ACUCAR", valor: 97.6 },
  { data: "24/08", descricao: "UBER *TRIP", valor: 24.1 },
  { data: "25/08", descricao: "CINEMA UCI", valor: 48.0 },
  { data: "26/08", descricao: "IFOOD *JAPA EXPRESS", valor: 73.8 },
  { data: "27/08", descricao: "FARMACIA DROGASIL", valor: 32.9 },
  { data: "28/08", descricao: "ZARA BRASIL", valor: 259.0 },
  { data: "29/08", descricao: "IFOOD *LANCHES", valor: 41.2 },
  { data: "30/08", descricao: "ASSAI ATACADISTA", valor: 312.45 },
  { data: "31/08", descricao: "MADERO STEAK HOUSE", valor: 78.0 },
  { data: "01/09", descricao: "UBER *TRIP", valor: 15.6 },
  { data: "02/09", descricao: "IFOOD *RESTAURANTE", valor: 63.4 },
  { data: "03/09", descricao: "ENEL SP", valor: 164.2 },
  { data: "04/09", descricao: "STARBUCKS COFFEE", valor: 18.9 },
  { data: "05/09", descricao: "99APP *99", valor: 19.5 },
  { data: "06/09", descricao: "IFOOD *HAMBURGUERIA", valor: 47.0 },
  { data: "07/09", descricao: "IOF COMPRA INTERNACIONAL", valor: 12.3 },
];

export function montarLancamentos(brutos: BrutoDemo[], prefixo = "ln"): Lancamento[] {
  return brutos.map((item, i) => {
    const classe = classificar(item.descricao);
    return {
      id: `${prefixo}-${i}-${item.data}-${item.valor}`,
      data: item.data,
      descricao: item.descricao,
      valor: item.valor,
      categoria: classe.categoria,
      natureza: classe.natureza,
      regra: classe.regra,
      tipo: "saida",
    };
  });
}

export const LANCAMENTOS_DEMO = montarLancamentos(LANCAMENTOS_BRUTOS_DEMO, "demo");

export function textoFaturaExemplo(): string {
  const cabeca = [
    "FATURA DE CARTAO - EXEMPLO ACADEMICO FATURACLARA",
    "Nao e uma fatura real. Uso educacional.",
    "Titular: Lauro (exemplo)",
    "Periodo: 08/08/2026 a 07/09/2026",
    "Vencimento: 15/09/2026",
    "",
    "DATA  DESCRICAO                              VALOR",
  ];
  const corpo = LANCAMENTOS_BRUTOS_DEMO.map((l) => {
    const valor = l.valor.toFixed(2).replace(".", ",");
    return `${l.data}  ${l.descricao.padEnd(36)}  ${valor.padStart(8)}`;
  });
  const total = LANCAMENTOS_BRUTOS_DEMO.reduce((a, l) => a + l.valor, 0)
    .toFixed(2)
    .replace(".", ",");
  return [...cabeca, ...corpo, "", `TOTAL DA FATURA                    ${total}`, ""].join("\n");
}
