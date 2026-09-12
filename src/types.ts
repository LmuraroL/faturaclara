export type Natureza = "essencial" | "flexivel" | "dispensavel";

export type Categoria =
  | "mercado"
  | "alimentacao_fora"
  | "delivery"
  | "transporte"
  | "combustivel"
  | "saude"
  | "farmacia"
  | "moradia"
  | "contas"
  | "educacao"
  | "assinatura"
  | "compras"
  | "lazer"
  | "cuidados"
  | "tarifas"
  | "pagamento"
  | "outros";

export type TipoLancamento = "saida" | "entrada";

export type Lancamento = {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: Categoria;
  natureza: Natureza;
  regra: string;
  tipo: TipoLancamento;
  manual?: boolean;
};

export type OrigemFatura = "demo" | "pdf" | "texto";

export type Fatura = {
  origem: OrigemFatura;
  arquivo?: string;
  textoBruto: string;
  lancamentos: Lancamento[];
};
