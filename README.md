# FaturaClara

**Trabalho acadêmico de MBA** (inteligência financeira orientada por dados e IA). Os direitos de uso são **exclusivamente educacionais, acadêmicos e de pesquisa**. Uso comercial não é autorizado.

Orientador que **lê a fatura do cartão**, classifica cada gasto e mostra o que é essencial, o que é flexível e o que é dispensável — para economizar ou redirecionar o dinheiro.

A regra de ouro do projeto: **mercado é essencial; restaurante e delivery não precisam ser.**

Isto **não** é consultoria financeira, não acessa o banco e **não pede senha**. A leitura do PDF acontece no próprio navegador.

---

## A ideia

A fatura responde *quanto* saiu. Quase nunca responde *o que aquilo era na vida da pessoa*.

Um supermercado e um iFood podem ter o mesmo valor e naturezas opostas: um abastece a casa, o outro substitui o fogão. Sem essa etiqueta, “cortar gastos” vira conselho vazio.

O FaturaClara faz três passos:

1. **Extrair** data, descrição e valor do PDF (ou de texto colado).
2. **Classificar** com um sistema especialista — regras explícitas, não uma caixa-preta.
3. **Orientar** com conselhos concretos: quanto dá para cortar e para onde mandar o que sobrar (reserva, dívida, investimento).

Você pode **corrigir** qualquer classificação. O modelo sugere; a decisão é sua.

---

## Como usar

```bash
cd faturaclara
npm install
npm run dev
```

O navegador abre em geral em `http://localhost:5173`.

1. Clique em **Ver fatura de exemplo** para apresentar o trabalho (lançamentos fictícios).
2. Ou **Enviar PDF da fatura** (Nubank, Itaú, Inter etc. em PDF com texto, não foto).
3. Se o PDF for imagem ou o layout for exótico, **Cole o texto** da fatura.
4. No panorama, compare **mercado × restaurante/delivery**.
5. Leia a **orientação** e, se a regra errou, mude a natureza do lançamento.

Há também **Baixar PDF de exemplo** para testar o leitor de ponta a ponta.

### O que o classificador entende

| Natureza | Exemplos | Por quê |
| --- | --- | --- |
| **Essencial** | supermercado, farmácia, luz, combustível, saúde | Cortar aqui costuma sair mais caro depois |
| **Flexível** | Uber, padaria, marketplace | Depende do contexto (trabalho vs. lazer) |
| **Dispensável** | iFood, restaurante, streaming, juros do cartão | Dá para adiar sem comprometer o básico |

“Dispensável” não é julgamento moral. É folga que pode virar reserva.

---

## O que isto é (e o que não é)

- É um **protótipo acadêmico** de extração + classificação + orientação.
- É um classificador **explicável** (a regra que casou aparece em cada linha).
- **Não** é um robô de investimento nem um app de banco.
- **Não** cobre o orçamento inteiro: só o que passou no cartão. Aluguel em débito, por exemplo, não aparece.

---

## Como rodar no computador

Node.js 20+ e `npm`.

```bash
npm install
npm run dev
```

Para gerar a pasta `dist` (apresentação offline):

```bash
npm run build
npm run preview
```

---

## GitHub

O código fica neste repositório. A cada push em `main`, o GitHub Pages publica a aplicação (Actions → workflow **GitHub Pages**).

A fatura **não sobe para o GitHub**: a leitura do PDF continua só no navegador de quem usa.
