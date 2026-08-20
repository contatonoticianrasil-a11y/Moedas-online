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


/* =================================
   FORMATAR MOEDA
================================= */

function formatarMoeda(valor, codigo) {

  try {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      maximumFractionDigits:
        codigo === "PYG" || codigo === "CLP" ? 0 : 2
    }).format(valor);

  } catch (erro) {

    return Number(valor).toFixed(2);

  }

}


/* =================================
   CARREGAR COTAÇÕES
================================= */

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
      throw new Error("Erro na API de moedas");
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

    console.error(
      "Erro nas moedas:",
      erro
    );

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

    const horario =
      document.getElementById("lastUpdate");

    if (horario) {
      horario.textContent =
        "Erro ao atualizar";
    }

  }

}


/* =================================
   MOSTRAR CARDS
================================= */

function mostrarCards() {

  const cards =
    document.getElementById("currencyCards");

  if (!cards) return;

  cards.innerHTML = "";

  moedas.forEach(moeda => {

    const taxa =
      taxas[moeda.codigo];

    if (!taxa) return;

    const valorEmReais =
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
        ${formatarMoeda(
          valorEmReais,
          "BRL"
        )}
      </div>

      <div class="currency-label">
        1 ${moeda.codigo} em reais
      </div>

    `;

    cards.appendChild(card);

  });

}


/* =================================
   DÓLAR PRINCIPAL
================================= */

function atualizarDolar() {

  const dolar =
    taxas["USD"];

  if (!dolar) return;

  const valor =
    1 / dolar;

  const elemento =
    document.getElementById(
      "heroDollar"
    );

  if (elemento) {

    elemento.textContent =
      formatarMoeda(
        valor,
        "BRL"
      );

  }

}


/* =================================
   HORÁRIO
================================= */

function atualizarHorario() {

  const elemento =
    document.getElementById(
      "lastUpdate"
    );

  if (!elemento) return;

  const agora =
    new Date();

  elemento.textContent =
    "Atualizado às " +
    agora.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}


/* =================================
   BITCOIN
================================= */

async function carregarBitcoin() {

  const area =
    document.getElementById(
      "cryptoCards"
    );

  if (!area) return;

  area.innerHTML = `
    <div class="loading">
      ⏳ Carregando Bitcoin...
    </div>
  `;

  try {

    const resposta =
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true"
      );

    if (!resposta.ok) {
      throw new Error(
        "Erro ao buscar Bitcoin"
      );
    }

    const dados =
      await resposta.json();

    if (
      !dados.bitcoin ||
      !dados.bitcoin.brl
    ) {

      throw new Error(
        "Bitcoin não encontrado"
      );

    }

    const valor =
      dados.bitcoin.brl;

    const variacao =
      Number(
        dados.bitcoin.brl_24h_change || 0
      );

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

          ${formatarMoeda(
            valor,
            "BRL"
          )}

        </div>

        <div class="currency-label">

          1 BTC em reais

          <br><br>

          <strong>
            ${sinal}${variacao.toFixed(2)}%
          </strong>

          nas últimas 24h

        </div>

      </div>

    `;

  } catch (erro) {

    console.error(
      "Erro Bitcoin:",
      erro
    );

    area.innerHTML = `
      <div class="loading">
        ❌ Bitcoin indisponível no momento.
      </div>
    `;

  }

}


/* =================================
   CONVERSOR
================================= */

function atualizarConversor() {

  const campoValor =
    document.getElementById(
      "amount"
    );

  const campoOrigem =
    document.getElementById(
      "from"
    );

  const campoDestino =
    document.getElementById(
      "to"
    );

  const resultado =
    document.getElementById(
      "conversionResult"
    );

  if (
    !campoValor ||
    !campoOrigem ||
    !campoDestino ||
    !resultado
  ) {
    return;
  }

  const quantidade =
    parseFloat(
      campoValor.value
    );

  const origem =
    campoOrigem.value;

  const destino =
    campoDestino.value;


  if (
    isNaN(quantidade) ||
    quantidade < 0
  ) {

    resultado.textContent =
      "Digite um valor válido";

    return;

  }


  if (
    origem !== "BRL" &&
    !taxas[origem]
  ) {

    resultado.textContent =
      "Cotação indisponível";

    return;

  }


  if (
    destino !== "BRL" &&
    !taxas[destino]
  ) {

    resultado.textContent =
      "Cotação indisponível";

    return;

  }


  let valorBRL;


  if (origem === "BRL") {

    valorBRL =
      quantidade;

  } else {

    valorBRL =
      quantidade / taxas[origem];

  }


  let valorFinal;


  if (destino === "BRL") {

    valorFinal =
      valorBRL;

  } else {

    valorFinal =
      valorBRL * taxas[destino];

  }


  resultado.textContent =
    formatarMoeda(
      valorFinal,
      destino
    );

}


/* =================================
   TROCAR MOEDAS
================================= */

function trocarMoedas() {

  const origem =
    document.getElementById(
      "from"
    );

  const destino =
    document.getElementById(
      "to"
    );

  if (!origem || !destino) {
    return;
  }

  const temporario =
    origem.value;

  origem.value =
    destino.value;

  destino.value =
    temporario;

  atualizarConversor();

}


/* =================================
   GRÁFICO HISTÓRICO
================================= */

async function carregarGrafico(
  codigo = "USD"
) {

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

    const hoje =
      new Date();

    const final =
      hoje.toISOString()
        .slice(0, 10);


    const inicioData =
      new Date();

    inicioData.setDate(
      inicioData.getDate() - 7
    );


    const inicio =
      inicioData
        .toISOString()
        .slice(0, 10);


    const url =
      `https://api.frankfurter.app/${inicio}..${final}?from=BRL&to=${codigo}`;


    const resposta =
      await fetch(url);


    if (!resposta.ok) {

      throw new Error(
        "Erro no histórico"
      );

    }


    const dados =
      await resposta.json();


    const datas =
      Object.keys(
        dados.rates
      );


    if (!datas.length) {

      throw new Error(
        "Sem histórico"
      );

    }


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


    const ctx =
      canvas.getContext(
        "2d"
      );


    graficoMoeda =
      new Chart(
        ctx,
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

                pointRadius: 4,

                pointHoverRadius: 6

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: true
              }

            },

            scales: {

              y: {

                ticks: {

                  callback:
                    function(valor) {

                      return formatarMoeda(
                        valor,
                        "BRL"
                      );

                    }

                }

              }

            }

          }

        }
      );

  } catch (erro) {

    console.error(
      "Erro no gráfico:",
      erro
    );

    mensagem.style.display =
      "flex";

    mensagem.textContent =
      "❌ Histórico indisponível no momento.";

  }

}


/* =================================
   EVENTOS
================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    const atualizar =
      document.getElementById(
        "refreshBtn"
      );

    if (atualizar) {

      atualizar.addEventListener(
        "click",
        function() {

          carregarCotacoes();

          carregarBitcoin();

        }
      );

    }


    const trocar =
      document.getElementById(
        "swapBtn"
      );

    if (trocar) {

      trocar.addEventListener(
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


    const seletorGrafico =
      document.getElementById(
        "chartCurrency"
      );

    if (seletorGrafico) {

      seletorGrafico.addEventListener(
        "change",
        function() {

          carregarGrafico(
            this.value
          );

        }
      );

    }


    const ano =
      document.getElementById(
        "year"
      );

    if (ano) {

      ano.textContent =
        new Date().getFullYear();

    }


    /* Iniciar */

    carregarCotacoes();

    carregarBitcoin();

    carregarGrafico(
      seletorGrafico
        ? seletorGrafico.value
        : "USD"
    );


  }
);


/* =================================
   ATUALIZAÇÃO AUTOMÁTICA
================================= */

setInterval(
  function() {

    carregarCotacoes();

    carregarBitcoin();

  },
  5 * 60 * 1000
);
