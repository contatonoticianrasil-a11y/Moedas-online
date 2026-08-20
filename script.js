/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS - VERSÃO PROFISSIONAL
   GRÁFICO: 7 / 30 / 90 DIAS
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const API_URL =
  "https://open.er-api.com/v6/latest/BRL";

const HISTORICO_API =
  "https://api.frankfurter.dev/v2/rates";

const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


/* =========================================================
   MOEDAS
========================================================= */

const moedas = [

  {
    codigo: "USD",
    nome: "Dólar americano",
    simbolo: "🇺🇸"
  },

  {
    codigo: "EUR",
    nome: "Euro",
    simbolo: "🇪🇺"
  },

  {
    codigo: "GBP",
    nome: "Libra esterlina",
    simbolo: "🇬🇧"
  },

  {
    codigo: "ARS",
    nome: "Peso argentino",
    simbolo: "🇦🇷"
  },

  {
    codigo: "PYG",
    nome: "Guarani paraguaio",
    simbolo: "🇵🇾"
  },

  {
    codigo: "CLP",
    nome: "Peso chileno",
    simbolo: "🇨🇱"
  },

  {
    codigo: "JPY",
    nome: "Iene japonês",
    simbolo: "🇯🇵"
  },

  {
    codigo: "CAD",
    nome: "Dólar canadense",
    simbolo: "🇨🇦"
  }

];


/* =========================================================
   VARIÁVEIS
========================================================= */

let taxas = {};

let graficoMoeda = null;

let periodoGrafico = 30;


/* =========================================================
   FORMATAÇÃO DE MOEDA
========================================================= */

function formatarMoeda(valor, codigo) {

  try {

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: codigo,

        maximumFractionDigits:
          codigo === "PYG" ||
          codigo === "CLP"
            ? 0
            : 2
      }
    ).format(valor);

  } catch (erro) {

    return Number(valor).toFixed(2);

  }

}


/* =========================================================
   DATA PARA API
========================================================= */

function formatarDataAPI(data) {

  const ano =
    data.getFullYear();

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;

}


/* =========================================================
   COTAÇÕES ATUAIS
========================================================= */

async function carregarCotacoes() {

  const cards =
    document.getElementById(
      "currencyCards"
    );

  if (!cards) return;


  cards.innerHTML = `
    <div class="loading">
      ⏳ Carregando cotações...
    </div>
  `;


  try {

    const resposta =
      await fetch(
        API_URL,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro HTTP ${resposta.status}`
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
        "API de moedas indisponível"
      );

    }


    taxas =
      dados.rates;


    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();


  } catch (erro) {

    console.error(
      "Erro nas cotações:",
      erro
    );


    cards.innerHTML = `
      <div class="loading">
        ❌ Não foi possível carregar
        as cotações.
        <br><br>
        Tente novamente.
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

  }

}


/* =========================================================
   CARDS DAS MOEDAS
========================================================= */

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


      const valor =
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
            valor,
            "BRL"
          )}

        </div>


        <div class="currency-label">

          1 ${moeda.codigo}
          em reais

        </div>

      `;


      cards.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   DÓLAR DESTAQUE
========================================================= */

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


/* =========================================================
   HORÁRIO
========================================================= */

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


/* =========================================================
   BITCOIN
========================================================= */

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
        `Bitcoin HTTP ${resposta.status}`
      );

    }


    const dados =
      await resposta.json();


    if (
      !dados.bitcoin ||
      !dados.bitcoin.brl
    ) {

      throw new Error(
        "Dados do Bitcoin inválidos"
      );

    }


    const btc =
      dados.bitcoin;


    const valor =
      Number(
        btc.brl
      );


    const variacao =
      Number(
        btc.brl_24h_change || 0
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
        ❌ Bitcoin indisponível
        no momento.
      </div>
    `;

  }

}


/* =========================================================
   CONVERSOR
========================================================= */

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


/* =========================================================
   TROCAR MOEDAS
========================================================= */

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


  const temp =
    origem.value;


  origem.value =
    destino.value;


  destino.value =
    temp;


  atualizarConversor();

}


/* =========================================================
   CRIAR BOTÕES 7 / 30 / 90 DIAS
========================================================= */

function criarControlesGrafico() {

  const canvas =
    document.getElementById(
      "currencyChart"
    );


  if (!canvas) return;


  const chartCard =
    canvas.parentElement;


  if (!chartCard) return;


  if (
    document.getElementById(
      "chartPeriods"
    )
  ) {

    return;

  }


  const controles =
    document.createElement(
      "div"
    );


  controles.id =
    "chartPeriods";


  controles.innerHTML = `

    <div class="chart-period-title">
      Período:
    </div>

    <button
      type="button"
      class="chart-period"
      data-period="7"
    >
      7 dias
    </button>

    <button
      type="button"
      class="chart-period active"
      data-period="30"
    >
      30 dias
    </button>

    <button
      type="button"
      class="chart-period"
      data-period="90"
    >
      90 dias
    </button>

  `;


  chartCard.insertBefore(
    controles,
    canvas
  );


  const botoes =
    controles.querySelectorAll(
      ".chart-period"
    );


  botoes.forEach(
    function(botao) {

      botao.addEventListener(
        "click",
        function() {

          botoes.forEach(
            function(item) {

              item.classList.remove(
                "active"
              );

            }
          );


          this.classList.add(
            "active"
          );


          periodoGrafico =
            Number(
              this.dataset.period
            );


          const seletor =
            document.getElementById(
              "chartCurrency"
            );


          carregarGrafico(
            seletor
              ? seletor.value
              : "USD"
          );

        }
      );

    }
  );

}


/* =========================================================
   HISTÓRICO
========================================================= */

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

    console.warn(
      "Elementos do gráfico não encontrados."
    );

    return;

  }


  if (
    typeof Chart === "undefined"
  ) {

    mensagem.style.display =
      "flex";


    mensagem.textContent =
      "❌ Chart.js não carregado.";

    return;

  }


  mensagem.style.display =
    "flex";


  mensagem.textContent =
    `⏳ Carregando histórico de ${periodoGrafico} dias...`;


  try {

    const hoje =
      new Date();


    const inicio =
      new Date();


    inicio.setDate(
      hoje.getDate() -
      periodoGrafico
    );


    const dataInicio =
      formatarDataAPI(
        inicio
      );


    const dataFim =
      formatarDataAPI(
        hoje
      );


    const parametros =
      new URLSearchParams({

        from:
          dataInicio,

        to:
          dataFim,

        base:
          "BRL",

        quotes:
          codigo

      });


    const url =
      `${HISTORICO_API}?${parametros.toString()}`;


    console.log(
      `Histórico ${periodoGrafico} dias:`,
      url
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
        `Histórico HTTP ${resposta.status}`
      );

    }


    const dados =
      await resposta.json();


    if (
      !Array.isArray(
        dados
      ) ||
      dados.length === 0
    ) {

      throw new Error(
        "Nenhum histórico encontrado."
      );

    }


    const labels = [];

    const valores = [];


    dados.forEach(
      function(item) {

        if (
          !item ||
          !item.date ||
          !item.rate
        ) {

          return;

        }


        const taxa =
          Number(
            item.rate
          );


        if (
          !Number.isFinite(taxa) ||
          taxa <= 0
        ) {

          return;

        }


        const data =
          new Date(
            item.date +
            "T12:00:00"
          );


        labels.push(
          data.toLocaleDateString(
            "pt-BR",
            {
              day: "2-digit",
              month: "2-digit"
            }
          )
        );


        valores.push(
          1 / taxa
        );

      }
    );


    if (
      valores.length === 0
    ) {

      throw new Error(
        "Histórico sem valores válidos."
      );

    }


    if (
      graficoMoeda
    ) {

      graficoMoeda.destroy();

      graficoMoeda =
        null;

    }


    mensagem.style.display =
      "none";


    graficoMoeda =
      new Chart(
        canvas,
        {

          type: "line",


          data: {

            labels:
              labels,


            datasets: [

              {

                label:
                  `1 ${codigo} em reais`,


                data:
                  valores,


                borderWidth:
                  3,


                tension:
                  0.35,


                fill:
                  true,


                pointRadius:
                  periodoGrafico <= 7
                    ? 4
                    : 2,


                pointHoverRadius:
                  7

              }

            ]

          },


          options: {

            responsive:
              true,


            maintainAspectRatio:
              false,


            interaction: {

              intersect:
                false,

              mode:
                "index"

            },


            plugins: {

              legend: {

                display:
                  true

              },


              tooltip: {

                displayColors:
                  false,


                callbacks: {

                  title:
                    function(context) {

                      return (
                        "Data: " +
                        context[0].label
                      );

                    },


                  label:
                    function(context) {

                      return (
                        " Cotação: " +
                        formatarMoeda(
                          context.parsed.y,
                          "BRL"
                        )
                      );

                    }

                }

              }

            },


            scales: {

              x: {

                grid: {

                  display:
                    false

                },


                ticks: {

                  maxTicksLimit:
                    periodoGrafico === 7
                      ? 7
                      : periodoGrafico === 30
                        ? 10
                        : 12

                }

              },


              y: {

                beginAtZero:
                  false,


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
      "ERRO NO HISTÓRICO:",
      erro
    );


    if (
      graficoMoeda
    ) {

      graficoMoeda.destroy();

      graficoMoeda =
        null;

    }


    mensagem.style.display =
      "flex";


    mensagem.textContent =
      `❌ Não foi possível carregar o histórico de ${periodoGrafico} dias.`;

  }

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    console.log(
      "Gonçalves Câmbio iniciado."
    );


    /* =========================
       CRIAR CONTROLES DO GRÁFICO
    ========================= */

    criarControlesGrafico();


    /* =========================
       ATUALIZAR
    ========================= */

    const refresh =
      document.getElementById(
        "refreshBtn"
      );


    if (refresh) {

      refresh.addEventListener(
        "click",
        async function() {

          refresh.disabled =
            true;


          refresh.textContent =
            "⏳ Atualizando...";


          await Promise.allSettled([

            carregarCotacoes(),

            carregarBitcoin()

          ]);


          const seletor =
            document.getElementById(
              "chartCurrency"
            );


          await carregarGrafico(
            seletor
              ? seletor.value
              : "USD"
          );


          refresh.disabled =
            false;


          refresh.textContent =
            "↻ Atualizar";

        }
      );

    }


    /* =========================
       TROCAR MOEDAS
    ========================= */

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


    /* =========================
       VALOR
    ========================= */

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


    /* =========================
       ORIGEM
    ========================= */

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


    /* =========================
       DESTINO
    ========================= */

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


    /* =========================
       MOEDA DO GRÁFICO
    ========================= */

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


    /* =========================
       ANO
    ========================= */

    const year =
      document.getElementById(
        "year"
      );


    if (year) {

      year.textContent =
        new Date()
          .getFullYear();

    }


    /* =========================
       INICIAR
    ========================= */

    carregarCotacoes();

    carregarBitcoin();


    if (chartCurrency) {

      carregarGrafico(
        chartCurrency.value ||
        "USD"
      );

    }

  }
);


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

setInterval(
  function() {

    console.log(
      "Atualização automática..."
    );


    carregarCotacoes();

    carregarBitcoin();

  },
  5 * 60 * 1000
);
