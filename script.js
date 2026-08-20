const API_URL = "https://open.er-api.com/v6/latest/BRL";
const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";

const moedas = [
  { codigo: "USD", nome: "Dólar americano", simbolo: "🇺🇸" },
  { codigo: "EUR", nome: "Euro", simbolo: "🇪🇺" },
  { codigo: "GBP", nome: "Libra esterlina", simbolo: "🇬🇧" },
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

function formatarMoeda(valor, codigo = "BRL") {

  if (!Number.isFinite(Number(valor))) {
    return "—";
  }

  try {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      minimumFractionDigits:
        codigo === "PYG" || codigo === "CLP" ? 0 : 2,
      maximumFractionDigits:
        codigo === "PYG" || codigo === "CLP" ? 0 : 2
    }).format(Number(valor));

  } catch (erro) {

    return Number(valor).toFixed(2);

  }
}


/* =========================
   CARREGAR COTAÇÕES
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

    const resposta = await fetch(
      API_URL,
      {
        cache: "no-store"
      }
    );

    if (!resposta.ok) {
      throw new Error(
        "Erro HTTP: " + resposta.status
      );
    }

    const dados =
      await resposta.json();

    if (
      !dados ||
      dados.result !== "success" ||
      !dados.rates
    ) {
      throw new Error(
        "Resposta inválida da API"
      );
    }

    taxas = dados.rates;

    mostrarCards();
    atualizarDolar();
    atualizarConversor();
    atualizarHorario();

    /*
      Depois que as cotações chegaram,
      podemos carregar o gráfico.
    */

    const seletor =
      document.getElementById(
        "chartCurrency"
      );

    if (seletor) {
      carregarGrafico(
        seletor.value
      );
    }

  } catch (erro) {

    console.error(
      "Erro nas cotações:",
      erro
    );

    cards.innerHTML = `
      <div class="loading">
        ❌ Não foi possível carregar as cotações.
        <br><br>
        Verifique sua conexão e tente novamente.
      </div>
    `;

    const dolar =
      document.getElementById(
        "heroDollar"
      );

    if (dolar) {
      dolar.textContent =
        "Indisponível";
    }

    const horario =
      document.getElementById(
        "lastUpdate"
      );

    if (horario) {
      horario.textContent =
        "Erro ao atualizar";
    }

  }
}


/* =========================
   MOSTRAR CARDS
========================= */

function mostrarCards() {

  const cards =
    document.getElementById(
      "currencyCards"
    );

  if (!cards) return;

  cards.innerHTML = "";

  moedas.forEach(
    function(moeda) {

      const taxa =
        Number(
          taxas[moeda.codigo]
        );

      if (
        !Number.isFinite(taxa) ||
        taxa <= 0
      ) {
        return;
      }

      /*
        A API está em BRL.

        Exemplo:

        1 BRL = 0,18 USD

        Portanto:

        1 USD = 1 / 0,18 BRL
      */

      const valorEmReais =
        1 / taxa;

      const card =
        document.createElement(
          "div"
        );

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

    }
  );
}


/* =========================
   DÓLAR PRINCIPAL
========================= */

function atualizarDolar() {

  const taxa =
    Number(
      taxas["USD"]
    );

  if (
    !Number.isFinite(taxa) ||
    taxa <= 0
  ) {
    return;
  }

  const valor =
    1 / taxa;

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


/* =========================
   HORÁRIO
========================= */

function atualizarHorario() {

  const elemento =
    document.getElementById(
      "lastUpdate"
    );

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
        BITCOIN_API,
        {
          cache: "no-store"
        }
      );

    if (!resposta.ok) {
      throw new Error(
        "Bitcoin HTTP " +
        resposta.status
      );
    }

    const dados =
      await resposta.json();

    if (
      !dados ||
      !dados.bitcoin
    ) {
      throw new Error(
        "Bitcoin não encontrado"
      );
    }

    const bitcoin =
      dados.bitcoin;

    const valor =
      Number(
        bitcoin.brl
      );

    const variacao =
      Number(
        bitcoin.brl_24h_change || 0
      );

    const sinal =
      variacao >= 0
        ? "+"
        : "";

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

          <br>

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


/* =========================
   CONVERSOR
========================= */

function atualizarConversor() {

  const campo =
    document.getElementById(
      "amount"
    );

  const origem =
    document.getElementById(
      "from"
    );

  const destino =
    document.getElementById(
      "to"
    );

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
    Number(
      campo.value
    );

  if (
    !Number.isFinite(
      quantidade
    ) ||
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


  /*
    PRIMEIRO:
    transforma tudo para BRL.
  */

  let valorBRL;


  if (
    moedaOrigem === "BRL"
  ) {

    valorBRL =
      quantidade;

  } else {

    const taxaOrigem =
      Number(
        taxas[moedaOrigem]
      );

    if (
      !Number.isFinite(
        taxaOrigem
      ) ||
      taxaOrigem <= 0
    ) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }

    valorBRL =
      quantidade /
      taxaOrigem;

  }


  /*
    DEPOIS:
    transforma BRL para a moeda destino.
  */

  let valorFinal;


  if (
    moedaDestino === "BRL"
  ) {

    valorFinal =
      valorBRL;

  } else {

    const taxaDestino =
      Number(
        taxas[moedaDestino]
      );

    if (
      !Number.isFinite(
        taxaDestino
      ) ||
      taxaDestino <= 0
    ) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }

    valorFinal =
      valorBRL *
      taxaDestino;

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
    document.getElementById(
      "from"
    );

  const destino =
    document.getElementById(
      "to"
    );

  if (
    !origem ||
    !destino
  ) {
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


/* =========================
   GRÁFICO HISTÓRICO REAL
========================= */

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

  if (
    !canvas ||
    !mensagem
  ) {
    return;
  }

  /*
    Verifica se Chart.js existe.
  */

  if (
    typeof Chart === "undefined"
  ) {

    console.error(
      "Chart.js não foi carregado."
    );

    mensagem.style.display =
      "flex";

    mensagem.textContent =
      "⚠️ Gráfico indisponível.";

    return;

  }


  mensagem.style.display =
    "flex";

  mensagem.textContent =
    "⏳ Carregando histórico...";


  try {

    /*
      Frankfurter fornece dados
      históricos de moedas.
    */

    const hoje =
      new Date();

    const inicio =
      new Date();

    inicio.setDate(
      hoje.getDate() - 7
    );


    const inicioTexto =
      inicio.toISOString()
        .slice(0, 10);

    const fimTexto =
      hoje.toISOString()
        .slice(0, 10);


    const url =
      "https://api.frankfurter.app/" +
      inicioTexto +
      ".." +
      fimTexto +
      "?from=BRL&to=" +
      encodeURIComponent(
        codigo
      );


    const resposta =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro histórico HTTP " +
        resposta.status
      );

    }


    const dados =
      await resposta.json();


    if (
      !dados ||
      !dados.rates
    ) {

      throw new Error(
        "Histórico não encontrado"
      );

    }


    const datas =
      Object.keys(
        dados.rates
      );


    if (
      datas.length === 0
    ) {

      throw new Error(
        "Sem dados históricos"
      );

    }


    const labels =
      [];

    const valores =
      [];


    datas.forEach(
      function(data) {

        const taxa =
          Number(
            dados.rates[data][codigo]
          );

        if (
          !Number.isFinite(
            taxa
          ) ||
          taxa <= 0
        ) {
          return;
        }

        labels.push(
          data
            .split("-")
            .reverse()
            .slice(0, 2)
            .join("/")
        );

        /*
          Frankfurter:
          1 BRL = X moeda

          Queremos:
          1 moeda = X BRL
        */

        valores.push(
          1 / taxa
        );

      }
    );


    if (
      valores.length === 0
    ) {

      throw new Error(
        "Nenhum valor válido"
      );

    }


    mensagem.style.display =
      "none";


    if (graficoMoeda) {

      graficoMoeda.destroy();

      graficoMoeda =
        null;

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

                data:
                  valores,

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

            maintainAspectRatio:
              false,

            interaction: {

              intersect: false,

              mode: "index"

            },

            plugins: {

              legend: {

                display: true

              }

            },


            scales: {

              y: {

                beginAtZero: false,

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


/* =========================
   EVENTOS
========================= */

function iniciarSite() {

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


  /*
    Primeiro carrega as cotações.
    Depois carrega o gráfico.
  */

  carregarCotacoes();

  carregarBitcoin();

}


/* =========================
   INICIAR
========================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    iniciarSite
  );

} else {

  iniciarSite();

}


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
