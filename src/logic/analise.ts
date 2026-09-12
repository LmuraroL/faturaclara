import type { Categoria, Lancamento, Natureza } from "../types";
import { soma } from "./dinheiro";

export type Fatia = {
  chave: string;
  rotulo: string;
  valor: number;
};

export type Conselho = {
  id: string;
  titulo: string;
  texto: string;
  economiaMensal: number;
  redirecionar: string;
  gravidade: "alta" | "media" | "baixa";
};

export type Panorama = {
  total: number;
  totalEntradas: number;
  porNatureza: Record<Natureza, number>;
  porCategoria: Record<Categoria, number>;
  mercado: number;
  comidaFora: number;
  potencialEconomia: number;
  conselhos: Conselho[];
};

const CATS = [
  "mercado",
  "alimentacao_fora",
  "delivery",
  "transporte",
  "combustivel",
  "saude",
  "farmacia",
  "moradia",
  "contas",
  "educacao",
  "assinatura",
  "compras",
  "lazer",
  "cuidados",
  "tarifas",
  "pagamento",
  "outros",
] as const;

function vazioCategoria(): Record<Categoria, number> {
  return Object.fromEntries(CATS.map((c) => [c, 0])) as Record<Categoria, number>;
}

export function analisar(lancamentos: Lancamento[]): Panorama {
  const gastos = lancamentos.filter((l) => l.tipo !== "entrada" && l.valor > 0);
  const entradas = lancamentos.filter((l) => l.tipo === "entrada" && l.valor > 0);
  const total = soma(gastos.map((l) => l.valor));
  const totalEntradas = soma(entradas.map((l) => l.valor));
  const porNatureza: Record<Natureza, number> = {
    essencial: 0,
    flexivel: 0,
    dispensavel: 0,
  };
  const porCategoria = vazioCategoria();
  for (const l of gastos) {
    porNatureza[l.natureza] += l.valor;
    porCategoria[l.categoria] += l.valor;
  }

  const mercado = porCategoria.mercado;
  const comidaFora = porCategoria.alimentacao_fora + porCategoria.delivery;
  const potencialEconomia = Math.round(porNatureza.dispensavel * 0.5 * 100) / 100;
  const conselhos = montarConselhos({
    total,
    porNatureza,
    porCategoria,
    mercado,
    comidaFora,
    gastos,
    potencialEconomia,
  });

  return {
    total,
    totalEntradas,
    porNatureza,
    porCategoria,
    mercado,
    comidaFora,
    potencialEconomia,
    conselhos,
  };
}

function montarConselhos(args: {
  total: number;
  porNatureza: Record<Natureza, number>;
  porCategoria: Record<Categoria, number>;
  mercado: number;
  comidaFora: number;
  gastos: Lancamento[];
  potencialEconomia: number;
}): Conselho[] {
  const {
    total,
    porNatureza,
    porCategoria,
    mercado,
    comidaFora,
    gastos,
    potencialEconomia,
  } = args;
  const lista: Conselho[] = [];

  if (comidaFora > 0) {
    const corte = Math.round(comidaFora * 0.5 * 100) / 100;
    const maisQueMercado = mercado > 0 && comidaFora >= mercado * 0.45;
    lista.push({
      id: "comida-fora",
      gravidade: maisQueMercado || comidaFora > 300 ? "alta" : "media",
      titulo: maisQueMercado
        ? "Comer fora está quase no mesmo patamar do mercado"
        : "Delivery e restaurante são o maior atalho de folga",
      economiaMensal: corte,
      texto: maisQueMercado
        ? `Mercado (comida de casa) ficou em ${brl(mercado)} e restaurante + delivery em ${brl(comidaFora)}. O mercado é essencial; o restaurante não precisa ser. Trocar metade das refeições de fora por comida feita em casa libera cerca de ${brl(corte)} por mês, sem mexer no básico.`
        : `Você gastou ${brl(comidaFora)} em restaurante e delivery. Cortar metade — dois ou três pedidos a menos por semana — gera cerca de ${brl(corte)} no mês. O supermercado continua no essencial.`,
      redirecionar:
        "Junte esse valor numa reserva de emergência. Em 6 meses vira um colchão de imprevisto, não mais um hábito de aplicativo.",
    });
  }

  const assinaturas = gastos.filter((l) => l.categoria === "assinatura");
  if (assinaturas.length > 0) {
    const somaAss = soma(assinaturas.map((l) => l.valor));
    const nomes = [...new Set(assinaturas.map((l) => l.descricao.split(/[.*]/)[0].trim()))].slice(0, 4);
    const nAss = assinaturas.length;
    lista.push({
      id: "assinaturas",
      gravidade: somaAss > 80 ? "media" : "baixa",
      titulo: "Assinaturas pedem um inventário honesto",
      economiaMensal: Math.round(somaAss * 0.4 * 100) / 100,
      texto: `Há ${nAss} ${nAss === 1 ? "cobrança" : "cobranças"} de streaming ou app (${nomes.join(", ")}), somando ${brl(somaAss)}. Se você não abre dois deles toda semana, cancele. Quatro serviços raramente cabem no mesmo sábado.`,
      redirecionar: "O que sobrar pode ir para um tesouro Selic ou para abater o rotativo — rendimento certo, não série nova.",
    });
  }

  if (porCategoria.transporte > 120) {
    const uber = gastos.filter(
      (l) => l.categoria === "transporte" && l.natureza === "flexivel",
    );
    const somaUber = soma(uber.map((l) => l.valor));
    if (somaUber > 80) {
      lista.push({
        id: "uber",
        gravidade: "media",
        titulo: "Uber é flexível: trabalho ou deslocamento curto?",
        economiaMensal: Math.round(somaUber * 0.35 * 100) / 100,
        texto: `Corridas de app somaram ${brl(somaUber)}. Se parte for trajeto previsível, um passe mensal ou combinar duas pernas a pé/ônibus costuma ser mais barato. Se for volta de noite, mantenha — segurança também é essencial.`,
        redirecionar: "A diferença pode cobrir a recarga do transporte público do mês seguinte.",
      });
    }
  }

  if (porCategoria.tarifas > 0) {
    lista.push({
      id: "tarifas",
      gravidade: "alta",
      titulo: "Juros, IOF e anuidade são o gasto mais caro da fatura",
      economiaMensal: porCategoria.tarifas,
      texto: `Apareceram ${brl(porCategoria.tarifas)} em IOF, juros ou anuidade. Isso não compra nada: paga o atraso ou o rotativo. A orientação aqui é pagar o valor total da fatura e, se a anuidade for alta, pedir isenção ou trocar de cartão.`,
      redirecionar: "Cada real de juros evitado vale mais do que qualquer economia no café.",
    });
  }

  if (porCategoria.compras > 200) {
    lista.push({
      id: "compras",
      gravidade: "media",
      titulo: "Compras de varejo: o que era reposição e o que era impulso?",
      economiaMensal: Math.round(porCategoria.compras * 0.3 * 100) / 100,
      texto: `Varejo e e-commerce somaram ${brl(porCategoria.compras)}. Roupa e marketplace misturam necessidade e desejo. Marque na lista o que você usaria mesmo se o site estivesse fora do ar por uma semana.`,
      redirecionar: "Adie 30% para o próximo ciclo. Se ainda fizer falta, compra. Se esqueceu, era ruído.",
    });
  }

  const pctDisp = total > 0 ? porNatureza.dispensavel / total : 0;
  if (pctDisp >= 0.25) {
    lista.push({
      id: "folha",
      gravidade: "alta",
      titulo: "A fatura tem folga — e folga sem destino vira custo",
      economiaMensal: potencialEconomia,
      texto: `${Math.round(pctDisp * 100)}% desta fatura está classificado como dispensável (${brl(porNatureza.dispensavel)}). Cortar metade, sem tocar no mercado, na farmácia e nas contas, é uma meta realista: cerca de ${brl(potencialEconomia)} por mês.`,
      redirecionar: `Em um ano isso é cerca de ${brl(potencialEconomia * 12)}. Dá para montar reserva, amortizar dívida ou começar um aporte mensal — você escolhe o destino, o app só aponta a folga.`,
    });
  }

  if (lista.length === 0) {
    lista.push({
      id: "equilibrado",
      gravidade: "baixa",
      titulo: "Esta fatura está mais no essencial do que no ruído",
      economiaMensal: Math.round(porNatureza.dispensavel * 0.2 * 100) / 100,
      texto: "O classificador encontrou pouco gasto claramente dispensável. Ainda assim, revise os lançamentos flexíveis: um Uber ou uma padaria podem ser trabalho ou hábito. Você é quem decide.",
      redirecionar: "Se sobrar, o melhor redirecionamento é reserva de emergência até cobrir 3 a 6 meses do essencial.",
    });
  }

  const ordem = { alta: 0, media: 1, baixa: 2 };
  return lista.sort((a, b) => {
    const g = ordem[a.gravidade] - ordem[b.gravidade];
    if (g !== 0) return g;
    return b.economiaMensal - a.economiaMensal;
  });
}

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fatiasNatureza(p: Panorama): Fatia[] {
  return [
    { chave: "essencial", rotulo: "Essencial", valor: p.porNatureza.essencial },
    { chave: "flexivel", rotulo: "Flexível", valor: p.porNatureza.flexivel },
    { chave: "dispensavel", rotulo: "Dispensável", valor: p.porNatureza.dispensavel },
  ];
}

export function fatiasCategoria(p: Panorama): Fatia[] {
  const nomes: Record<Categoria, string> = {
    mercado: "Mercado",
    alimentacao_fora: "Restaurante",
    delivery: "Delivery",
    transporte: "Transporte",
    combustivel: "Combustível",
    saude: "Saúde",
    farmacia: "Farmácia",
    moradia: "Moradia",
    contas: "Contas",
    educacao: "Educação",
    assinatura: "Assinaturas",
    compras: "Compras",
    lazer: "Lazer",
    cuidados: "Cuidados",
    tarifas: "Tarifas",
    pagamento: "Pagamento",
    outros: "Outros",
  };
  return (Object.keys(p.porCategoria) as Categoria[])
    .map((chave) => ({ chave, rotulo: nomes[chave], valor: p.porCategoria[chave] }))
    .filter((f) => f.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}
