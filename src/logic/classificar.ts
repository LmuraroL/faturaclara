import type { Categoria, Natureza } from "../types";

export const ROTULO_NATUREZA: Record<Natureza, string> = {
  essencial: "Essencial",
  flexivel: "Flexível",
  dispensavel: "Dispensável",
};

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  mercado: "Mercado e casa",
  alimentacao_fora: "Restaurante e café",
  delivery: "Delivery",
  transporte: "Transporte",
  combustivel: "Combustível",
  saude: "Saúde",
  farmacia: "Farmácia",
  moradia: "Moradia",
  contas: "Contas da casa",
  educacao: "Educação",
  assinatura: "Assinatura",
  compras: "Compras",
  lazer: "Lazer",
  cuidados: "Cuidados pessoais",
  tarifas: "Tarifa do cartão",
  pagamento: "Pagamento / crédito",
  outros: "Outros",
};

export const TEXTO_NATUREZA: Record<Natureza, string> = {
  essencial:
    "Sustenta saúde, moradia, trabalho e comida de casa. Cortar aqui costuma sair mais caro depois.",
  flexivel:
    "Pode ser necessidade ou hábito, conforme o contexto. O Uber até o trabalho é uma coisa; o Uber até o bar é outra.",
  dispensavel:
    "Dá para adiar sem comprometer o básico. Não é julgamento moral: é folga que pode virar reserva, dívida menor ou investimento.",
};

type Regra = {
  nome: string;
  inclui: string[];
  categoria: Categoria;
  natureza: Natureza;
};

const REGRAS: Regra[] = [
  {
    nome: "pagamento da fatura",
    inclui: ["PAGAMENTO RECEBIDO", "PAGTO FATURA", "PAGAMENTO FATURA", "CREDITO PAGAMENTO"],
    categoria: "outros",
    natureza: "essencial",
  },
  {
    nome: "delivery",
    inclui: [
      "IFOOD",
      "I FOOD",
      "RAPPI",
      "UBER EATS",
      "UBEREATS",
      "AIQFOME",
      "JAMES DELIVERY",
      "KEETA",
      "ZE DELIVERY",
      "ZÉ DELIVERY",
    ],
    categoria: "delivery",
    natureza: "dispensavel",
  },
  {
    nome: "restaurante e fast food",
    inclui: [
      "OUTBACK",
      "MADERO",
      "MCDONALD",
      "BURGER KING",
      "BK ",
      "HABIBS",
      "SUBWAY",
      "STARBUCKS",
      "PIZZA",
      "PIZZARIA",
      "RESTAURANTE",
      "REST ",
      "LANCHONETE",
      "PADARIA E CONFEITARIA",
      "KFC",
      "POPEYES",
      "GIRAFFAS",
      "BOB'S",
      "BOBS",
      "SPOLETO",
      "COCO BAMBU",
      "JERONIMO",
      "CAFE ",
      "COFFEE",
      "BAR E",
      "CERVEJARIA",
      "CERVEJA",
      "CHOPERIA",
      "SUSHI",
      "HAMBURGUER",
      "HAMBURGUERIA",
    ],
    categoria: "alimentacao_fora",
    natureza: "dispensavel",
  },
  {
    nome: "assinatura digital",
    inclui: [
      "NETFLIX",
      "SPOTIFY",
      "DISNEY",
      "PRIME VIDEO",
      "AMAZON PRIME",
      "HBO",
      "MAX.COM",
      "GLOBOPLAY",
      "PARAMOUNT",
      "YOUTUBE PREMIUM",
      "GOOGLE YOUTUBE",
      "APPLE.COM/BILL",
      "APPLE TV",
      "CRUNCHYROLL",
      "DEEZER",
      "TWITCH",
    ],
    categoria: "assinatura",
    natureza: "dispensavel",
  },
  {
    nome: "lazer",
    inclui: [
      "CINEMA",
      "CINESYSTEM",
      "UCI ",
      "KINOPLEX",
      "INGRESSO",
      "SYMPLA",
      "STEAM",
      "PLAYSTATION",
      "XBOX",
      "NINTENDO",
      "SHOW ",
      "TEATRO",
      "PARQUE",
    ],
    categoria: "lazer",
    natureza: "dispensavel",
  },
  {
    nome: "mercado e atacado",
    inclui: [
      "SUPERMERCADO",
      "SUPER MARKET",
      "ATACADAO",
      "ATACADÃO",
      "ASSAI",
      "ASSAÍ",
      "CARREFOUR",
      "PAO DE ACUCAR",
      "PAO DE AÇUCAR",
      "PAO DE ACUCAR",
      "EXTRA ",
      "HIPEREXTRA",
      "SAMS CLUB",
      "SAM'S",
      "ATACAREJO",
      "HORTIFRUTI",
      "ZONA SUL",
      "MUFFATO",
      "SAVEGNAGO",
      "BRETAS",
      "CONDOR SUPER",
      "SACOLAO",
      "SACOLÃO",
      "FEIRA ",
      "AÇOUGUE",
      "ACOUGUE",
      "QUITANDA",
      "DIA BRASIL",
      "OXXO",
      "COBASI",
      "PETZ",
    ],
    categoria: "mercado",
    natureza: "essencial",
  },
  {
    nome: "padaria",
    inclui: ["PADARIA", "PANIFICADORA", "BAKERY"],
    categoria: "mercado",
    natureza: "flexivel",
  },
  {
    nome: "farmácia",
    inclui: [
      "FARMACIA",
      "FARMÁCIA",
      "DROGARIA",
      "DROGASIL",
      "DROGARAIA",
      "RAIA DROGASIL",
      "PACHECO",
      "PAGUE MENOS",
      "DROGA RAIA",
      "SAO PAULO DROGARIA",
      "DROGAL",
    ],
    categoria: "farmacia",
    natureza: "essencial",
  },
  {
    nome: "saúde",
    inclui: [
      "UNIMED",
      "AMIL",
      "HAPVIDA",
      "SULAMERICA",
      "SUL AMERICA",
      "HOSPITAL",
      "CLINICA",
      "CLÍNICA",
      "LABORATORIO",
      "LABORATÓRIO",
      "DENTISTA",
      "ODONTO",
      "CONSULTA",
    ],
    categoria: "saude",
    natureza: "essencial",
  },
  {
    nome: "combustível",
    inclui: [
      "POSTO ",
      "SHELL",
      "IPIRANGA",
      "PETROBRAS",
      "BR MANIA",
      "ALE COMBUST",
      "AUTO POSTO",
      "COMBUSTIVEL",
    ],
    categoria: "combustivel",
    natureza: "essencial",
  },
  {
    nome: "transporte por app",
    inclui: ["UBER", "99APP", "99 POP", "99POP", "99 TECH", "CABIFY", "INDRIVE"],
    categoria: "transporte",
    natureza: "flexivel",
  },
  {
    nome: "transporte público",
    inclui: [
      "METRO",
      "METRÔ",
      "CPTM",
      "BILHETE UNICO",
      "BILHETE ÚNICO",
      "CARTAO TRANSPORTE",
      "ONIBUS",
      "ÔNIBUS",
      "RECARGAPAY",
    ],
    categoria: "transporte",
    natureza: "essencial",
  },
  {
    nome: "contas da casa",
    inclui: [
      "ENEL",
      "LIGHT ",
      "CPFL",
      "CEMIG",
      "COPEL",
      "SABESP",
      "COPASA",
      "COMGAS",
      "COMGÁS",
      "ENERGISA",
      "VIVO",
      "CLARO",
      "TIM ",
      "OI FIBRA",
      "NET VIRTUA",
      "ALGAR",
      "CONTA DE LUZ",
      "CONTA DE AGUA",
    ],
    categoria: "contas",
    natureza: "essencial",
  },
  {
    nome: "moradia",
    inclui: ["CONDOMINIO", "CONDOMÍNIO", "ALUGUEL", "ADMINISTRADORA"],
    categoria: "moradia",
    natureza: "essencial",
  },
  {
    nome: "educação",
    inclui: ["ESCOLA", "FACULDADE", "UNIVERSIDADE", "MENSALIDADE", "CURSO ", "COLEGIO", "COLÉGIO", "ALURA", "UDEMY", "COURSERA"],
    categoria: "educacao",
    natureza: "essencial",
  },
  {
    nome: "compras online e varejo",
    inclui: [
      "MERCADO LIVRE",
      "MERCADOLIVRE",
      "MERCADO*",
      "MERPAGO",
      "AMAZON",
      "MAGAZINE LUIZA",
      "MAGALU",
      "AMERICANAS",
      "SHPPE",
      "SHOPEE",
      "SHEIN",
      "ZARA",
      "RENNER",
      "C&A",
      "CEA ",
      "RIACHUELO",
      "NIKE",
      "ADIDAS",
      "CENTAURO",
      "KALUNGA",
    ],
    categoria: "compras",
    natureza: "flexivel",
  },
  {
    nome: "cuidados pessoais",
    inclui: ["SALAO", "SALÃO", "BARBEARIA", "ESMALTE", "ESTETICA", "ESTÉTICA", "SPA "],
    categoria: "cuidados",
    natureza: "flexivel",
  },
  {
    nome: "tarifa e juros do cartão",
    inclui: [
      "JUROS",
      "ENCARGOS",
      "IOF",
      "ANUIDADE",
      "MULTA",
      "ROTATIVO",
      "ATRASO",
      "TARIFA",
    ],
    categoria: "tarifas",
    natureza: "dispensavel",
  },
];

const IGNORAR = [
  "PAGAMENTO RECEBIDO",
  "PAGTO FATURA",
  "PAGAMENTO FATURA",
  "SALDO ANTERIOR",
  "SALDO FATURA",
  "TOTAL DA FATURA",
  "VALOR TOTAL",
  "LIMITE TOTAL",
  "LIMITE DISPONIVEL",
  "VENCIMENTO",
  "MELHOR DIA",
];

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function deveIgnorar(descricao: string): boolean {
  const n = normalizar(descricao);
  return IGNORAR.some((p) => n.includes(normalizar(p)));
}

export function eEntrada(descricao: string): boolean {
  const n = normalizar(descricao);
  return (
    n.includes("PAGAMENTO EM") ||
    n.includes("PAGAMENTO RECEBIDO") ||
    n.includes("PAGTO FATURA") ||
    n.includes("PAGAMENTO FATURA") ||
    n.includes("PAGAMENTOS E FINANCIAMENTOS") ||
    n.includes("ESTORNO") ||
    n.includes("DEVOLUCAO") ||
    n.startsWith("PAGAMENTO")
  );
}

export function classificar(descricao: string): {
  categoria: Categoria;
  natureza: Natureza;
  regra: string;
} {
  const n = normalizar(descricao);
  if (n.includes("PAGAMENTO RECEBIDO") || n.includes("PAGTO FATURA") || n.includes("PAGAMENTO FATURA")) {
    return { categoria: "outros", natureza: "essencial", regra: "pagamento da fatura" };
  }
  for (const regra of REGRAS) {
    if (regra.nome === "pagamento da fatura") continue;
    if (regra.inclui.some((termo) => n.includes(normalizar(termo)))) {
      return {
        categoria: regra.categoria,
        natureza: regra.natureza,
        regra: regra.nome,
      };
    }
  }
  return { categoria: "outros", natureza: "flexivel", regra: "sem correspondência — revise" };
}
