import { useEffect, useMemo, useState } from "react";
import {
  analisar,
  fatiasCategoria,
  fatiasNatureza,
  type Panorama,
} from "./logic/analise";
import { ROTULO_CATEGORIA, ROTULO_NATUREZA, TEXTO_NATUREZA } from "./logic/classificar";
import { LANCAMENTOS_DEMO, textoFaturaExemplo } from "./logic/demo";
import { formatarBRL, formatarPct } from "./logic/dinheiro";
import { extrairLancamentos } from "./logic/parser";
import type { Categoria, Fatura, Lancamento, Natureza, OrigemFatura } from "./types";

const NATUREZAS: Natureza[] = ["essencial", "flexivel", "dispensavel"];
const STORAGE_ULTIMA = "faturaclara.ultima";
type Filtro = Natureza | "todos" | "entrada";

export default function App() {
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [textoColado, setTextoColado] = useState("");
  const [mostrarCola, setMostrarCola] = useState(false);

  const panorama = useMemo(
    () => (fatura ? analisar(fatura.lancamentos) : null),
    [fatura],
  );

  const visiveis = useMemo(() => {
    if (!fatura) return [];
    const q = busca.trim().toLowerCase();
    return fatura.lancamentos.filter((l) => {
      if (filtro === "entrada") {
        if (l.tipo !== "entrada") return false;
      } else if (filtro === "todos") {
        /* mostra os dois */
      } else if (l.tipo === "entrada" || l.natureza !== filtro) {
        return false;
      }
      if (!q) return true;
      return (
        l.descricao.toLowerCase().includes(q) ||
        ROTULO_CATEGORIA[l.categoria].toLowerCase().includes(q)
      );
    });
  }, [fatura, filtro, busca]);

  function aplicar(
    origem: OrigemFatura,
    lancamentos: Lancamento[],
    textoBruto: string,
    arquivo?: string,
  ) {
    if (lancamentos.length === 0) {
      setErro(
        "Não encontrei lançamentos com data, descrição e valor. Cole o texto da fatura ou use o exemplo acadêmico.",
      );
      setMostrarCola(true);
      if (textoBruto) setTextoColado(textoBruto.slice(0, 8000));
      return;
    }
    setErro(null);
    const entradas = lancamentos.filter((l) => l.tipo === "entrada").length;
    const gastos = lancamentos.length - entradas;
    setAviso(
      origem === "demo"
        ? "Fatura de exemplo carregada. Nada disso é um cartão real."
        : `${gastos} gastos lidos${entradas ? ` · ${entradas} pagamento(s) à parte, não somam no total` : ""}. Revise o que estiver cinza — o classificador erra, você corrige.`,
    );
    setFiltro("todos");
    setBusca("");
    setFatura({ origem, arquivo, textoBruto, lancamentos });
    try {
      sessionStorage.setItem(
        STORAGE_ULTIMA,
        JSON.stringify({ origem, arquivo, textoBruto }),
      );
    } catch {
      /* ignore */
    }
  }

  function usarDemo() {
    aplicar("demo", LANCAMENTOS_DEMO, textoFaturaExemplo(), "fatura-exemplo.pdf");
  }

  async function onArquivo(file: File | undefined) {
    if (!file) return;
    setCarregando(true);
    setErro(null);
    try {
      const { extrairTextoPdf } = await import("./pdf");
      const texto = await extrairTextoPdf(file);
      const lancamentos = extrairLancamentos(texto);
      aplicar("pdf", lancamentos, texto, file.name);
    } catch {
      setErro("Não consegui ler este PDF. Se for imagem digitalizada, cole o texto. Ou baixe o PDF de exemplo para testar o fluxo.");
      setMostrarCola(true);
    } finally {
      setCarregando(false);
    }
  }

  function lerTexto() {
    const lancamentos = extrairLancamentos(textoColado);
    aplicar("texto", lancamentos, textoColado);
  }

  useEffect(() => {
    setFatura((atual) => {
      if (atual?.textoBruto) {
        return { ...atual, lancamentos: extrairLancamentos(atual.textoBruto) };
      }
      try {
        const raw = sessionStorage.getItem(STORAGE_ULTIMA);
        if (!raw) return atual;
        const salvo = JSON.parse(raw) as {
          origem: OrigemFatura;
          arquivo?: string;
          textoBruto: string;
        };
        if (!salvo.textoBruto) return atual;
        return {
          origem: salvo.origem,
          arquivo: salvo.arquivo,
          textoBruto: salvo.textoBruto,
          lancamentos: extrairLancamentos(salvo.textoBruto),
        };
      } catch {
        return atual;
      }
    });
  }, []);

  function mudarNatureza(id: string, natureza: Natureza) {
    setFatura((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        lancamentos: atual.lancamentos.map((l) =>
          l.id === id ? { ...l, natureza, manual: true, regra: "você reclassificou" } : l,
        ),
      };
    });
  }

  function mudarCategoria(id: string, categoria: Categoria) {
    setFatura((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        lancamentos: atual.lancamentos.map((l) =>
          l.id === id ? { ...l, categoria, manual: true } : l,
        ),
      };
    });
  }

  return (
    <div className="app">
      <header className="topo">
        <p className="logo">
          <button type="button" onClick={() => setFatura(null)}>
            Fatura<span>Clara</span>
          </button>
        </p>
        <p className="selo">MBA · dados e IA · uso educacional</p>
      </header>

      {!fatura || !panorama ? (
        <Inicio
          carregando={carregando}
          erro={erro}
          mostrarCola={mostrarCola}
          textoColado={textoColado}
          onMostrarCola={() => setMostrarCola(true)}
          onTexto={setTextoColado}
          onDemo={usarDemo}
          onArquivo={(f) => void onArquivo(f)}
          onLerTexto={lerTexto}
          onBaixarPdf={() => {
            void import("./logic/pdfExemplo").then((m) => m.baixarPdfExemplo());
          }}
        />
      ) : (
        <Painel
          fatura={fatura}
          panorama={panorama}
          visiveis={visiveis}
          filtro={filtro}
          busca={busca}
          aviso={aviso}
          erro={erro}
          onFiltro={setFiltro}
          onBusca={setBusca}
          onNatureza={mudarNatureza}
          onCategoria={mudarCategoria}
          onNova={() => {
            setFatura(null);
            setAviso(null);
            setErro(null);
            sessionStorage.removeItem(STORAGE_ULTIMA);
          }}
          onDemo={usarDemo}
          onArquivo={(f) => void onArquivo(f)}
        />
      )}

      <footer className="rodape">
        <p>
          Trabalho acadêmico de MBA (inteligência financeira orientada por dados e IA). Não é consultoria,
          não pede senha do banco e a fatura não sai do seu navegador.
        </p>
      </footer>
    </div>
  );
}

function Inicio({
  carregando,
  erro,
  mostrarCola,
  textoColado,
  onMostrarCola,
  onTexto,
  onDemo,
  onArquivo,
  onLerTexto,
  onBaixarPdf,
}: {
  carregando: boolean;
  erro: string | null;
  mostrarCola: boolean;
  textoColado: string;
  onMostrarCola: () => void;
  onTexto: (v: string) => void;
  onDemo: () => void;
  onArquivo: (f: File | undefined) => void;
  onLerTexto: () => void;
  onBaixarPdf: () => void;
}) {
  return (
    <main>
      <section className="hero">
        <p className="olho">Orientador de gastos da fatura</p>
        <h1>Mercado é essencial. Restaurante, quase nunca.</h1>
        <p className="lead">
          A fatura do cartão lista o quanto saiu. Falta dizer <em>o que</em> era aquilo. Esta aplicação lê o
          PDF, classifica cada lançamento e aponta onde dá para economizar ou redirecionar — sem moralismo, com
          regra explícita.
        </p>
        <div className="acoes">
          <button type="button" className="btn principal" onClick={onDemo} disabled={carregando}>
            Ver fatura de exemplo
          </button>
          <label className={`btn ${carregando ? "desativado" : ""}`}>
            {carregando ? "Lendo PDF…" : "Enviar PDF da fatura"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              hidden
              disabled={carregando}
              onChange={(e) => onArquivo(e.target.files?.[0])}
            />
          </label>
        </div>
        <p className="atalhos">
          <button type="button" className="link" onClick={onBaixarPdf}>
            Baixar PDF de exemplo
          </button>
          {" · "}
          <button type="button" className="link" onClick={onMostrarCola}>
            Colar texto da fatura
          </button>
        </p>
        {erro ? <p className="alerta">{erro}</p> : null}
        {mostrarCola ? (
          <div className="cola">
            <label htmlFor="cola">Cole aqui as linhas da fatura (data, descrição, valor)</label>
            <textarea
              id="cola"
              rows={8}
              value={textoColado}
              onChange={(e) => onTexto(e.target.value)}
              placeholder="08/08 SUPERMERCADO EXTRA 186,40"
            />
            <button type="button" className="btn" onClick={onLerTexto}>
              Classificar texto
            </button>
          </div>
        ) : null}
      </section>

      <section className="tres">
        <article>
          <h2>1. Extrair</h2>
          <p>
            O PDF vira dados: data, estabelecimento e valor. Tudo roda no navegador — a fatura não é enviada a
            servidor nenhum.
          </p>
        </article>
        <article>
          <h2>2. Filtrar</h2>
          <p>
            Um classificador de regras (sistema especialista) marca essencial, flexível ou dispensável. Você
            pode corrigir. Comida de mercado ≠ comida de restaurante.
          </p>
        </article>
        <article>
          <h2>3. Orientar</h2>
          <p>
            A folga vira conselho concreto: quanto cortar, e para onde mandar o dinheiro — reserva, dívida ou
            investimento.
          </p>
        </article>
      </section>

      <section className="lenda">
        <h2>As três naturezas</h2>
        <ul>
          {(Object.keys(TEXTO_NATUREZA) as Natureza[]).map((n) => (
            <li key={n}>
              <strong className={`tag ${n}`}>{ROTULO_NATUREZA[n]}</strong>
              <span>{TEXTO_NATUREZA[n]}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Painel({
  fatura,
  panorama,
  visiveis,
  filtro,
  busca,
  aviso,
  erro,
  onFiltro,
  onBusca,
  onNatureza,
  onCategoria,
  onNova,
  onDemo,
  onArquivo,
}: {
  fatura: Fatura;
  panorama: Panorama;
  visiveis: Lancamento[];
  filtro: Filtro;
  busca: string;
  aviso: string | null;
  erro: string | null;
  onFiltro: (f: Filtro) => void;
  onBusca: (v: string) => void;
  onNatureza: (id: string, n: Natureza) => void;
  onCategoria: (id: string, c: Categoria) => void;
  onNova: () => void;
  onDemo: () => void;
  onArquivo: (f: File | undefined) => void;
}) {
  const naturezas = fatiasNatureza(panorama);
  const categorias = fatiasCategoria(panorama);
  const maxCat = categorias[0]?.valor ?? 1;
  const saidas = fatura.lancamentos.filter((l) => l.tipo !== "entrada");
  const entradas = fatura.lancamentos.filter((l) => l.tipo === "entrada");

  return (
    <main>
      <div className="toolbar">
        <p>
          {fatura.arquivo ?? "Texto colado"} · {saidas.length} gastos
          {entradas.length
            ? ` · ${entradas.length} ${entradas.length === 1 ? "entrada" : "entradas"}`
            : ""}
        </p>
        <div className="acoes">
          <button type="button" className="btn" onClick={onNova}>
            Nova leitura
          </button>
          <button type="button" className="btn" onClick={onDemo}>
            Exemplo
          </button>
          <label className="btn">
            Outro PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => onArquivo(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>
      {aviso ? <p className="aviso">{aviso}</p> : null}
      {erro ? <p className="alerta">{erro}</p> : null}

      {panorama.totalEntradas > 0 ? (
        <p className="aviso">
          Pagamento/crédito de {formatarBRL(panorama.totalEntradas)} não entra no gasto do mês. O
          total abaixo é o que de fato saiu nesta fatura.
        </p>
      ) : null}

      <section className="kpis">
        <Kpi rotulo="Total da fatura" valor={formatarBRL(panorama.total)} detalhe="gastos, sem pagamentos" />
        <Kpi
          rotulo="Essencial"
          valor={formatarPct(panorama.porNatureza.essencial, panorama.total)}
          detalhe={formatarBRL(panorama.porNatureza.essencial)}
          tom="essencial"
        />
        <Kpi
          rotulo="Dispensável"
          valor={formatarPct(panorama.porNatureza.dispensavel, panorama.total)}
          detalhe={formatarBRL(panorama.porNatureza.dispensavel)}
          tom="dispensavel"
        />
        <Kpi
          rotulo="Folga sugerida"
          valor={formatarBRL(panorama.potencialEconomia)}
          detalhe="metade do dispensável, meta realista"
          tom="flexivel"
        />
      </section>

      <section className="grade">
        <article className="card">
          <h2>Como a fatura se reparte</h2>
          <div className="donut-linha">
            <div
              className="donut"
              style={{
                background: conic(panorama),
              }}
              aria-hidden="true"
            />
            <ul className="legenda">
              {naturezas.map((f) => (
                <li key={f.chave}>
                  <span className={`ponto ${f.chave}`} />
                  {f.rotulo}
                  <strong>{formatarBRL(f.valor)}</strong>
                  <em>{formatarPct(f.valor, panorama.total)}</em>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="card destaque">
          <h2>Comida de casa × comida de fora</h2>
          <p className="sub">
            O ponto da matéria: supermercado alimenta o mês. Restaurante e delivery alimentam o hábito.
          </p>
          <Comparativo
            aRotulo="Mercado"
            aValor={panorama.mercado}
            bRotulo="Restaurante + delivery"
            bValor={panorama.comidaFora}
          />
        </article>
      </section>

      <section className="card">
        <h2>Por categoria</h2>
        <ul className="barras">
          {categorias.map((f) => (
            <li key={f.chave}>
              <span>{f.rotulo}</span>
              <div className="trilha">
                <i style={{ width: `${Math.max(4, (f.valor / maxCat) * 100)}%` }} />
              </div>
              <strong>{formatarBRL(f.valor)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Orientação</h2>
        <p className="sub">
          Não é para zerar o prazer. É para dar destino ao que sobra. Você corrige a classificação se a regra
          errou.
        </p>
        <div className="conselhos">
          {panorama.conselhos.map((c) => (
            <article key={c.id} className={`conselho ${c.gravidade}`}>
              <p className="gravidade">{c.gravidade === "alta" ? "Prioridade" : c.gravidade === "media" ? "Atenção" : "Ajuste fino"}</p>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
              <p className="economia">
                Economia possível: <strong>{formatarBRL(c.economiaMensal)}</strong> / mês
              </p>
              <p className="redir">
                <strong>Redirecionar:</strong> {c.redirecionar}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="tabela-topo">
          <h2>Lançamentos</h2>
          <input
            type="search"
            placeholder="Filtrar por nome ou categoria"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
          />
        </div>
        <div className="chips">
          <button
            type="button"
            className={filtro === "todos" ? "chip on" : "chip"}
            onClick={() => onFiltro("todos")}
          >
            Todos ({saidas.length})
          </button>
          {NATUREZAS.map((n) => (
            <button
              key={n}
              type="button"
              className={filtro === n ? `chip on ${n}` : `chip ${n}`}
              onClick={() => onFiltro(n)}
            >
              {ROTULO_NATUREZA[n]} ({saidas.filter((l) => l.natureza === n).length})
            </button>
          ))}
          {entradas.length > 0 ? (
            <button
              type="button"
              className={filtro === "entrada" ? "chip on" : "chip"}
              onClick={() => onFiltro("entrada")}
            >
              Entradas ({entradas.length})
            </button>
          ) : null}
        </div>
        <div className="tabela-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Natureza</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => (
                <tr key={l.id} className={l.tipo === "entrada" ? "linha-entrada" : undefined}>
                  <td>{l.data}</td>
                  <td>
                    <span className="desc">{l.descricao}</span>
                    <small>
                      {l.tipo === "entrada"
                        ? "entrada — pagamento, não é gasto do mês"
                        : l.manual
                          ? "reclassificado por você"
                          : l.regra}
                    </small>
                  </td>
                  <td>
                    {l.tipo === "entrada" ? (
                      <span className="tag flexivel">Pagamento</span>
                    ) : (
                      <select
                        value={l.categoria}
                        onChange={(e) => onCategoria(l.id, e.target.value as Categoria)}
                        aria-label={`Categoria de ${l.descricao}`}
                      >
                        {(Object.keys(ROTULO_CATEGORIA) as Categoria[]).map((c) => (
                          <option key={c} value={c}>
                            {ROTULO_CATEGORIA[c]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {l.tipo === "entrada" ? (
                      "—"
                    ) : (
                      <select
                        className={l.natureza}
                        value={l.natureza}
                        onChange={(e) => onNatureza(l.id, e.target.value as Natureza)}
                        aria-label={`Natureza de ${l.descricao}`}
                      >
                        {NATUREZAS.map((n) => (
                          <option key={n} value={n}>
                            {ROTULO_NATUREZA[n]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="num">
                    {l.tipo === "entrada" ? `− ${formatarBRL(l.valor)}` : formatarBRL(l.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visiveis.length === 0 ? <p className="vazio">Nenhum lançamento neste filtro.</p> : null}
      </section>
    </main>
  );
}

function Kpi({
  rotulo,
  valor,
  detalhe,
  tom,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  tom?: Natureza;
}) {
  return (
    <article className={`kpi ${tom ?? ""}`}>
      <p>{rotulo}</p>
      <strong>{valor}</strong>
      <span>{detalhe}</span>
    </article>
  );
}

function Comparativo({
  aRotulo,
  aValor,
  bRotulo,
  bValor,
}: {
  aRotulo: string;
  aValor: number;
  bRotulo: string;
  bValor: number;
}) {
  const max = Math.max(aValor, bValor, 1);
  return (
    <div className="comp">
      <div>
        <span>{aRotulo}</span>
        <div className="trilha">
          <i className="essencial" style={{ width: `${(aValor / max) * 100}%` }} />
        </div>
        <strong>{formatarBRL(aValor)}</strong>
      </div>
      <div>
        <span>{bRotulo}</span>
        <div className="trilha">
          <i className="dispensavel" style={{ width: `${(bValor / max) * 100}%` }} />
        </div>
        <strong>{formatarBRL(bValor)}</strong>
      </div>
    </div>
  );
}

function conic(p: Panorama): string {
  const t = p.total || 1;
  const e = (p.porNatureza.essencial / t) * 360;
  const f = (p.porNatureza.flexivel / t) * 360;
  return `conic-gradient(#1d6b48 0deg ${e}deg, #a67c2a ${e}deg ${e + f}deg, #c45c26 ${e + f}deg 360deg)`;
}
