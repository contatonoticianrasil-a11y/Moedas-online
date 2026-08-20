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
let graficoMoeda = null;


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

    return Number(valor).toFixed(2);

  }

}


/* =========================
   COTAÇÕES
========================= */

async function carregarCotacoes() {

  const cards =
    document.getElementById("currencyCards");

  if (!cards) return;

  cards.innerHTML = `
    <div class="loading">
      ⏳ Carregando cotações...
    </div>
  `;

  try {

    const resposta =
      await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Erro na API");
    }

    const dados =
      await resposta.json();

    if (dados.result !== "success") {
      throw new Error("API indisponível");
    }

    taxas = dados.rates;

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
        Tente novamente.
      </div>
    `;

    const dolar =
      document.getElementById("heroDollar");

    if (dolar) {
      dolar.textContent = "Indisponível";
    }

  }

}


/* =========================
   CARDS
========================= */

function mostrarCards() {

  const cards =
    document.getElementById("currencyCards");

  if (!cards) return;

  cards.innerHTML = "";

  moedas.forEach(moeda => {

    const taxa =
      taxas[moeda.codigo];

    if (!taxa) return;

    const valor =
      1 / taxa;

    const card =
      document.createElement("div");

    card.className =
      "currency-card";

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
        ${formatarMoeda(valor, "BRL")}
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

  const taxa =
    taxas["USD"];

  if (!taxa) return;

  const valor =
    1 / taxa;

  const elemento =
    document.getElementById("heroDollar");

  if (elemento) {

    elemento.textContent =
      formatarMoeda(valor, "BRL");

  }

}


/* =========================
   HORÁRIO
========================= */

function atualizarHorario() {

  const elemento =
    document.getElementById("lastUpdate");

  if (!elemento) return;

  elemento.textContent =
    "Atualizado às " +
    new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}


/* =========================
   BITCOIN
========================= */

async function carregarBitcoin() {

  const area =
    document.getElementById("cryptoCards");

  if (!area) return;

  try {

    const resposta =
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true"
      );

    if (!resposta.ok) {
      throw new Error("Bitcoin indisponível");
    }

    const dados =
      await resposta.json();

    const btc =
      dados.bitcoin;

    const valor =
      btc.brl;

    const variacao =
      Number(btc.brl_24h_change || 0);

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


/* =========================
   CONVERSOR
========================= */

function atualizarConversor() {

  const campo =
    document.getElementById("amount");

  const origem =
    document.getElementById("from");

  const destino =
    document.getElementById("to");

  const resultado =
    document.getElementById(
      "conversionResult"
    );

  if (
    !campo ||
    !origem ||
    !destino ||
    !resultado
  ) {
    return;
  }

  const quantidade =
    Number(campo.value);

  if (
    !Number.isFinite(quantidade) ||
    quantidade < 0
  ) {

    resultado.textContent =
      "Digite um valor válido";

    return;

  }

  const moedaOrigem =
    origem.value;

  const moedaDestino =
    destino.value;


  let valorBRL;


  if (moedaOrigem === "BRL") {

    valorBRL =
      quantidade;

  } else {

    if (!taxas[moedaOrigem]) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }

    valorBRL =
      quantidade /
      taxas[moedaOrigem];

  }


  let valorFinal;


  if (moedaDestino === "BRL") {

    valorFinal =
      valorBRL;

  } else {

    if (!taxas[moedaDestino]) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }

    valorFinal =
      valorBRL *
      taxas[moedaDestino];

  }


  resultado.textContent =
    formatarMoeda(
      valorFinal,
      moedaDestino
    );

}


/* =========================
   TROCAR MOEDAS
========================= */

function trocarMoedas() {

  const origem =
    document.getElementById("from");

  const destino =
    document.getElementById("to");

  if (!origem || !destino) {
    return;
  }

  const temp =
    origem.value;

  origem.value =
    destino.value;

  destino.value =
    temp;

  atualizarConversor();

}


/* =========================
   GRÁFICO
========================= */

async function carregarGrafico(codigo = "USD") {

  const canvas =
    document.getElementById(
      "currencyChart"
    );

  const mensagem =
    document.getElementById(
      "chartMessage"
    );

  if (!canvas || !mensagem) {
    return;
  }

  mensagem.style.display =
    "flex";

  mensagem.textContent =
    "⏳ Carregando histórico...";


  try {

    const fim =
      new Date();

    const inicio =
      new Date();

    inicio.setDate(
      inicio.getDate() - 7
    );


    const inicioTexto =
      inicio.toISOString()
        .slice(0, 10);

    const fimTexto =
      fim.toISOString()
        .slice(0, 10);


    const url =
      `https://api.frankfurter.app/${inicioTexto}..${fimTexto}?from=BRL&to=${codigo}`;


    const resposta =
      await fetch(url);


    if (!resposta.ok) {
      throw new Error("Erro histórico");
    }


    const dados =
      await resposta.json();


    const datas =
      Object.keys(
        dados.rates
      );


    const valores =
      datas.map(data => {

        const taxa =
          dados.rates[data][codigo];

        return 1 / taxa;

      });


    const labels =
      datas.map(data => {

        const partes =
          data.split("-");

        return (
          partes[2] +
          "/" +
          partes[1]
        );

      });


    mensagem.style.display =
      "none";


    if (graficoMoeda) {
      graficoMoeda.destroy();
    }


    graficoMoeda =
      new Chart(
        canvas,
        {

          type: "line",

          data: {

            labels: labels,

            datasets: [

              {

                label:
                  `1 ${codigo} em reais`,

                data: valores,

                borderWidth: 3,

                tension: 0.35,

                fill: true,

                pointRadius: 4

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false

          }

        }
      );


  } catch (erro) {

    console.error(
      "Gráfico:",
      erro
    );

    mensagem.style.display =
      "flex";

    mensagem.textContent =
      "❌ Histórico indisponível.";

  }

}


/* =========================
   INICIAR SITE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    const refresh =
      document.getElementById(
        "refreshBtn"
      );

    if (refresh) {

      refresh.addEventListener(
        "click",
        function() {

          carregarCotacoes();
          carregarBitcoin();

        }
      );

    }


    const swap =
      document.getElementById(
        "swapBtn"
      );

    if (swap) {

      swap.addEventListener(
        "click",
        trocarMoedas
      );

    }


    const amount =
      document.getElementById(
        "amount"
      );

    if (amount) {

      amount.addEventListener(
        "input",
        atualizarConversor
      );

    }


    const from =
      document.getElementById(
        "from"
      );

    if (from) {

      from.addEventListener(
        "change",
        atualizarConversor
      );

    }


    const to =
      document.getElementById(
        "to"
      );

    if (to) {

      to.addEventListener(
        "change",
        atualizarConversor
      );

    }


    const chartCurrency =
      document.getElementById(
        "chartCurrency"
      );

    if (chartCurrency) {

      chartCurrency.addEventListener(
        "change",
        function() {

          carregarGrafico(
            this.value
          );

        }
      );

    }


    const year =
      document.getElementById(
        "year"
      );

    if (year) {

      year.textContent =
        new Date().getFullYear();

    }


    /* COMEÇAR */

    carregarCotacoes();

    carregarBitcoin();

    carregarGrafico(
      chartCurrency
        ? chartCurrency.value
        : "USD"
    );

  }
);


/* =========================
   ATUALIZAÇÃO AUTOMÁTICA
========================= */

setInterval(
  function() {

    carregarCotacoes();

    carregarBitcoin();

  },
  5 * 60 * 1000
);
