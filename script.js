const API_URL = "https://open.er-api.com/v6/latest/BRL";

const moedas = [
  { codigo: "USD", nome: "Dólar americano", simbolo: "🇺🇸" },
  { codigo: "EUR", nome: "Euro", simbolo: "🇪🇺" },
  { codigo: "GBP", nome: "Libra", simbolo: "🇬🇧" },
  { codigo: "ARS", nome: "Peso argentino", simbolo: "🇦🇷" },
  { codigo: "PYG", nome: "Guarani paraguaio", simbolo: "🇵🇾" },
  { codigo: "CLP", nome: "Peso chileno", simbolo: "🇨🇱" },
  { codigo: "JPY", nome: "Iene japonês", simbolo: "🇯🇵" },
  { codigo: "CAD", nome: "Dólar canadense", simbolo: "🇨🇦" }
];

let taxas = {};
let ultimaAtualizacao = null;


/* =========================
   FORMATAÇÃO
========================= */

function formatarMoeda(valor, codigo) {

  try {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      maximumFractionDigits:
        codigo === "PYG" || codigo === "CLP" ? 0 : 2
    }).format(valor);

  } catch {

    return valor.toFixed(2);

  }

}


/* =========================
   CARREGAR COTAÇÕES
========================= */

async function carregarCotacoes() {
async function carregarBitcoin() {

  const area =
    document.getElementById("cryptoCards");

  try {

    const resposta = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true"
    );

    if (!resposta.ok) {
      throw new Error("Erro Bitcoin");
    }

    const dados =
      await resposta.json();

    const bitcoin =
      dados.bitcoin;

    const valor =
      bitcoin.brl;

    const variacao =
      bitcoin.brl_24h_change;

    const sinal =
      variacao >= 0 ? "+" : "";

    area.innerHTML = `

      <div class="currency-card">

        <div class="currency-top">

          <div class="currency-icon">
            ₿
          </div>

          <div>

            <div class="currency-name">
              Bitcoin
            </div>

            <span class="currency-code">
              BTC
            </span>

          </div>

        </div>

        <div class="currency-value">

          ${formatarMoeda(valor, "BRL")}

        </div>

        <div class="currency-label">

          1 BTC em reais

          <br>

          <strong>
            ${sinal}${variacao.toFixed(2)}%
          </strong>

          nas últimas 24h

        </div>

      </div>

    `;

  } catch (erro) {

    console.error(erro);

    area.innerHTML = `

      <div class="loading">

        ❌ Bitcoin indisponível no momento.

      </div>

    `;

  }

}

carregarBitcoin();

setInterval(
  carregarBitcoin,
  5 * 60 * 1000
);
  const cards =
    document.getElementById("currencyCards");

  cards.innerHTML = `
    <div class="loading">
      ⏳ Carregando cotações...
    </div>
  `;

  try {

    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Erro na API");
    }

    const dados = await resposta.json();

    if (dados.result !== "success") {
      throw new Error("API indisponível");
    }

    taxas = dados.rates;

    ultimaAtualizacao = new Date();

    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();

  } catch (erro) {

    console.error(erro);

    cards.innerHTML = `
      <div class="loading">
        ❌ Não foi possível carregar as cotações.
        <br><br>
        Verifique sua conexão e tente novamente.
      </div>
    `;

    document.getElementById(
      "heroDollar"
    ).textContent = "Indisponível";

    document.getElementById(
      "lastUpdate"
    ).textContent = "Erro ao atualizar";

  }

}


/* =========================
   CARDS
========================= */

function mostrarCards() {

  const cards =
    document.getElementById("currencyCards");

  cards.innerHTML = "";

  moedas.forEach(moeda => {

    const taxa = taxas[moeda.codigo];

    if (!taxa) return;

    const valorEmReais = 1 / taxa;

    const card =
      document.createElement("div");

    card.className = "currency-card";

    card.innerHTML = `

      <div class="currency-top">

        <div class="currency-icon">
          ${moeda.simbolo}
        </div>

        <div>

          <div class="currency-name">
            ${moeda.nome}
          </div>

          <span class="currency-code">
            ${moeda.codigo}
          </span>

        </div>

      </div>

      <div class="currency-value">
        ${formatarMoeda(valorEmReais, "BRL")}
      </div>

      <div class="currency-label">
        1 ${moeda.codigo} em reais
      </div>

    `;

    cards.appendChild(card);

  });

}


/* =========================
   DÓLAR
========================= */

function atualizarDolar() {

  const dolar = taxas["USD"];

  if (!dolar) return;

  const valor = 1 / dolar;

  document.getElementById(
    "heroDollar"
  ).textContent =
    formatarMoeda(valor, "BRL");

}


/* =========================
   HORÁRIO
========================= */

function atualizarHorario() {

  if (!ultimaAtualizacao) return;

  const horario =
    ultimaAtualizacao.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  document.getElementById(
    "lastUpdate"
  ).textContent =
    "Atualizado às " + horario;

}


/* =========================
   CONVERSOR
========================= */

function atualizarConversor() {

  const amount =
    parseFloat(
      document.getElementById("amount").value
    );

  const from =
    document.getElementById("from").value;

  const to =
    document.getElementById("to").value;

  const resultado =
    document.getElementById(
      "conversionResult"
    );


  if (isNaN(amount) || amount < 0) {

    resultado.textContent =
      "Digite um valor válido";

    return;

  }


  if (
    !taxas[from] &&
    from !== "BRL"
  ) {

    resultado.textContent =
      "Cotação indisponível";

    return;

  }


  if (
    !taxas[to] &&
    to !== "BRL"
  ) {

    resultado.textContent =
      "Cotação indisponível";

    return;

  }


  let valorEmBRL;


  if (from === "BRL") {

    valorEmBRL = amount;

  } else {

    valorEmBRL =
      amount / taxas[from];

  }


  let valorFinal;


  if (to === "BRL") {

    valorFinal = valorEmBRL;

  } else {

    valorFinal =
      valorEmBRL * taxas[to];

  }


  resultado.textContent =
    formatarMoeda(
      valorFinal,
      to
    );

}


/* =========================
   TROCAR MOEDAS
========================= */

function trocarMoedas() {

  const from =
    document.getElementById("from");

  const to =
    document.getElementById("to");

  const temporario =
    from.value;

  from.value =
    to.value;

  to.value =
    temporario;

  atualizarConversor();

}


/* =========================
   EVENTOS
========================= */

document
  .getElementById("refreshBtn")
  .addEventListener(
    "click",
    carregarCotacoes
  );


document
  .getElementById("swapBtn")
  .addEventListener(
    "click",
    trocarMoedas
  );


document
  .getElementById("amount")
  .addEventListener(
    "input",
    atualizarConversor
  );


document
  .getElementById("from")
  .addEventListener(
    "change",
    atualizarConversor
  );


document
  .getElementById("to")
  .addEventListener(
    "change",
    atualizarConversor
  );


/* =========================
   ANO
========================= */

document.getElementById("year").textContent =
  new Date().getFullYear();


/* =========================
   INICIAR
========================= */

carregarCotacoes();


/* =========================
   ATUALIZAÇÃO AUTOMÁTICA
========================= */

setInterval(
  carregarCotacoes,
  5 * 60 * 1000
);
