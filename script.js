/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS - VERSÃO CORRIGIDA
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const API_URL = "https://open.er-api.com/v6/latest/BRL";

const HISTORICO_API =
  "https://api.frankfurter.dev/v2/rates";

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

let taxas = {};

let graficoMoeda = null;


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarMoeda(valor, codigo) {

  try {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      maximumFractionDigits:
        codigo === "PYG" || codigo === "CLP"
          ? 0
          : 2
    }).format(valor);

  } catch (erro) {

    return Number(valor).toFixed(2);

  }

}


/* =========================================================
   COTAÇÕES ATUAIS
========================================================= */

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
      await fetch(API_URL, {
        cache: "no-store"
      });


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
        "API de moedas indisponível"
      );

    }


    taxas = dados.rates;


    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();


    /*
      Atualiza também o gráfico
      depois que as taxas forem carregadas.
    */

    const seletor =
      document.getElementById(
        "chartCurrency"
      );


    if (seletor) {

      carregarGrafico(
        seletor.value || "USD"
      );

    }


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
   CARDS DE MOEDAS
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
        taxas[moeda.codigo];


      if (
        !taxa ||
        !Number.isFinite(
          Number(taxa)
        )
      ) {

        return;

      }


      /*
        A API está em BRL.

        Exemplo:

        BRL -> USD = 0.18

        Para descobrir:

        USD -> BRL

        fazemos:

        1 / 0.18
      */

      const valor =
        1 / Number(taxa);


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


      cards.appendChild(card);

    }
  );

}


/* =========================================================
   DÓLAR DESTAQUE
========================================================= */

function atualizarDolar() {

  const taxa =
    taxas["USD"];


  if (!taxa) return;


  const valor =
    1 / Number(taxa);


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


  try {

    const resposta =
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true",
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Bitcoin indisponível"
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
      Number(btc.brl);


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


  /* -------------------------
     MOEDA DE ORIGEM
  ------------------------- */


  if (
    moedaOrigem === "BRL"
  ) {

    valorBRL =
      quantidade;

  } else {

    const taxaOrigem =
      taxas[moedaOrigem];


    if (!taxaOrigem) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }


    valorBRL =
      quantidade /
      Number(taxaOrigem);

  }


  /* -------------------------
     MOEDA DE DESTINO
  ------------------------- */


  let valorFinal;


  if (
    moedaDestino === "BRL"
  ) {

    valorFinal =
      valorBRL;

  } else {

    const taxaDestino =
      taxas[moedaDestino];


    if (!taxaDestino) {

      resultado.textContent =
        "Cotação indisponível";

      return;

    }


    valorFinal =
      valorBRL *
      Number(taxaDestino);

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
   HISTÓRICO REAL
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

    return;

  }


  /*
    Verifica se Chart.js existe.
  */

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
    "⏳ Carregando histórico real...";


  try {


    /*
      Pega aproximadamente
      os últimos 30 dias.
    */

    const hoje =
      new Date();


    const inicio =
      new Date();


    inicio.setDate(
      hoje.getDate() - 30
    );


    const formatarData =
      function(data) {

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


        return (
          ano +
          "-" +
          mes +
          "-" +
          dia
        );

      };


    const dataInicio =
      formatarData(
        inicio
      );


    const dataFim =
      formatarData(
        hoje
      );


    /*
      Frankfurter fornece
      séries históricas reais.

      Base = BRL
      Cotação = USD/EUR/etc.

      Como queremos:

      1 USD em BRL

      e a API entrega:

      1 BRL em USD

      fazemos:

      1 / taxa
    */

    const url =
      HISTORICO_API +
      "?from=" +
      encodeURIComponent(
        dataInicio
      ) +
      "&to=" +
      encodeURIComponent(
        dataFim
      ) +
      "&base=BRL" +
      "&quotes=" +
      encodeURIComponent(
        codigo
      );


    console.log(
      "Histórico:",
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
        "Erro histórico HTTP " +
        resposta.status
      );

    }


    const dados =
      await resposta.json();


    console.log(
      "Dados históricos:",
      dados
    );


    if (
      !Array.isArray(
        dados
      ) ||
      dados.length === 0
    ) {

      throw new Error(
        "Nenhum dado histórico encontrado"
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
          !Number.isFinite(
            taxa
          ) ||
          taxa <= 0
        ) {

          return;

        }


        labels.push(
          new Date(
            item.date +
            "T12:00:00"
          ).toLocaleDateString(
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
        "Histórico sem valores válidos"
      );

    }


    /*
      Remove gráfico anterior.
    */

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

            labels: labels,


            datasets: [

              {

                label:
                  `1 ${codigo} em reais`,


                data: valores,


                borderWidth: 3,


                tension: 0.35,


                fill: true,


                pointRadius: 3,


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

              },


              tooltip: {

                callbacks: {

                  label:
                    function(context) {

                      return (
                        " " +
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
      "Erro no histórico:",
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
      "❌ Não foi possível carregar o histórico.";

  }

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    /* -------------------------
       BOTÃO ATUALIZAR
    ------------------------- */

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


          refresh.disabled =
            false;


          refresh.textContent =
            "↻ Atualizar";

        }
      );

    }


    /* -------------------------
       TROCAR MOEDAS
    ------------------------- */

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


    /* -------------------------
       VALOR
    ------------------------- */

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


    /* -------------------------
       MOEDA DE ORIGEM
    ------------------------- */

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


    /* -------------------------
       MOEDA DE DESTINO
    ------------------------- */

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


    /* -------------------------
       SELETOR DO GRÁFICO
    ------------------------- */

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


    /* -------------------------
       ANO
    ------------------------- */

    const year =
      document.getElementById(
        "year"
      );


    if (year) {

      year.textContent =
        new Date()
          .getFullYear();

    }


    /* -------------------------
       INICIAR
    ------------------------- */

    carregarCotacoes();

    carregarBitcoin();


    if (chartCurrency) {

      carregarGrafico(
        chartCurrency.value
      );

    }

  }
);


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

setInterval(
  function() {

    carregarCotacoes();

    carregarBitcoin();

  },
  5 * 60 * 1000
);
