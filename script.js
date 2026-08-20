/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS - VERSÃO FINAL
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const API_URL =
  "https://open.er-api.com/v6/latest/BRL";

const HISTORICO_API =
  "https://api.frankfurter.dev/v2/rates";

const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


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
   DATA
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


    /*
      Atualiza o gráfico depois
      que as cotações foram carregadas.
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
   CARDS
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


      /*
        API:

        1 BRL = X moeda

        Para descobrir:

        1 moeda = X BRL

        usamos:

        1 / taxa
      */

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


  /* =========================
     ORIGEM
  ========================= */

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


  /* =========================
     DESTINO
  ========================= */

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

    console.warn(
      "Elementos do gráfico não encontrados."
    );

    return;

  }


  /*
    Verifica Chart.js.
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


  /*
    Mostra carregamento.
  */

  mensagem.style.display =
    "flex";


  mensagem.textContent =
    "⏳ Carregando histórico real...";


  try {

    /*
      Datas.

      Vamos buscar 30 dias.
    */

    const hoje =
      new Date();


    const inicio =
      new Date();


    inicio.setDate(
      hoje.getDate() - 30
    );


    const dataInicio =
      formatarDataAPI(
        inicio
      );


    const dataFim =
      formatarDataAPI(
        hoje
      );


    /*
      NOVO ENDPOINT CORRETO.

      Exemplo:

      https://api.frankfurter.dev/v2/rates
      ?from=2026-07-21
      &to=2026-08-20
      &base=BRL
      &quotes=USD
    */

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
      "Buscando histórico:",
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


    console.log(
      "Histórico recebido:",
      dados
    );


    /*
      A API v2 retorna:

      [
        {
          date: "...",
          base: "BRL",
          quote: "USD",
          rate: 0.18
        }
      ]
    */

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
          !Number.isFinite(
            taxa
          ) ||
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


        /*
          BRL -> USD

          Para obter:

          USD -> BRL

          fazemos:

          1 / taxa
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
        "Os dados históricos não possuem valores válidos."
      );

    }


    /*
      Destrói gráfico anterior.
    */

    if (
      graficoMoeda
    ) {

      graficoMoeda.destroy();

      graficoMoeda =
        null;

    }


    /*
      Remove mensagem.
    */

    mensagem.style.display =
      "none";


    /*
      Cria gráfico.
    */

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
                  3,


                pointHoverRadius:
                  6

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

              x: {

                ticks: {

                  maxTicksLimit:
                    10

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
      "❌ Não foi possível carregar o histórico.";

  }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Gonçalves Câmbio iniciado."
    );


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


          refresh.disabled =
            false;


          refresh.textContent =
            "↻ Atualizar";

        }
      );

    }


    /* =========================
       TROCAR
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
       GRÁFICO
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
       CARREGAR
    ========================= */

    carregarCotacoes();

    carregarBitcoin();


    /*
      O gráfico também começa
      automaticamente.
    */

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
