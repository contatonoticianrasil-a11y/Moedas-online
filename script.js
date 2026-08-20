/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS — VERSÃO CORRIGIDA
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const API_URL = "https://open.er-api.com/v6/latest/BRL";

const HISTORICO_API =
  "https://api.frankfurter.app";

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

let ultimaAtualizacao = null;


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarMoeda(valor, codigo = "BRL") {

  if (
    valor === null ||
    valor === undefined ||
    !Number.isFinite(Number(valor))
  ) {
    return "—";
  }

  try {

    let casas = 2;

    if (
      codigo === "JPY" ||
      codigo === "ARS" ||
      codigo === "PYG" ||
      codigo === "CLP"
    ) {
      casas = 0;
    }

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: codigo,
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
      }
    ).format(Number(valor));

  } catch (erro) {

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }

}


/* =========================================================
   DATA / HORA
========================================================= */

function atualizarHorario() {

  const elemento =
    document.getElementById("lastUpdate");

  if (!elemento) return;

  const agora =
    new Date();

  ultimaAtualizacao = agora;

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
   CARREGAR COTAÇÕES
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
      await fetch(
        API_URL,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro HTTP " +
        resposta.status
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
        "API de câmbio indisponível"
      );

    }


    taxas =
      dados.rates;


    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();


    /*
      IMPORTANTE:
      O gráfico só é carregado
      depois que as taxas estão disponíveis.
    */

    const seletorGrafico =
      document.getElementById(
        "chartCurrency"
      );


    if (seletorGrafico) {

      await carregarGrafico(
        seletorGrafico.value
      );

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar moedas:",
      erro
    );


    cards.innerHTML = `
      <div class="loading">

        ❌ Não foi possível carregar
        as cotações.

        <br><br>

        Verifique sua conexão
        e tente novamente.

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


    const mensagemGrafico =
      document.getElementById(
        "chartMessage"
      );


    if (mensagemGrafico) {

      mensagemGrafico.style.display =
        "flex";

      mensagemGrafico.textContent =
        "❌ Não foi possível carregar o gráfico.";

    }

  }

}


/* =========================================================
   MOSTRAR CARDS
========================================================= */

function mostrarCards() {

  const cards =
    document.getElementById(
      "currencyCards"
    );

  if (!cards) return;


  cards.innerHTML = "";


  let quantidade = 0;


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
        A API informa quantos BRL
        correspondem a 1 BRL em cada moeda.

        Exemplo:
        BRL -> USD = 0.18

        Então:
        1 USD = 1 / 0.18 BRL
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

          1 ${moeda.codigo}
          em reais

        </div>

      `;


      cards.appendChild(
        card
      );


      quantidade++;

    }
  );


  if (quantidade === 0) {

    cards.innerHTML = `
      <div class="loading">
        ❌ Nenhuma cotação disponível.
      </div>
    `;

  }

}


/* =========================================================
   DÓLAR NO HERO
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
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true",
        {
          method: "GET",
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
      typeof dados.bitcoin.brl !== "number"
    ) {

      throw new Error(
        "Dados do Bitcoin inválidos"
      );

    }


    const valor =
      dados.bitcoin.brl;


    const variacao =
      Number(
        dados.bitcoin.brl_24h_change || 0
      );


    const sinal =
      variacao >= 0
        ? "+"
        : "";


    const classe =
      variacao >= 0
        ? "positive"
        : "negative";


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

          <strong
            class="${classe}"
          >
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


  /*
    Se as moedas forem iguais,
    não precisamos consultar taxa.
  */

  if (
    moedaOrigem ===
    moedaDestino
  ) {

    resultado.textContent =
      formatarMoeda(
        quantidade,
        moedaDestino
      );

    return;

  }


  /*
    Converte a moeda de origem
    primeiro para BRL.
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
    Agora converte BRL
    para a moeda de destino.
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


  const valorTemporario =
    origem.value;


  origem.value =
    destino.value;


  destino.value =
    valorTemporario;


  atualizarConversor();

}


/* =========================================================
   FORMATA DATA PARA O GRÁFICO
========================================================= */

function formatarDataGrafico(
  dataString
) {

  const data =
    new Date(
      dataString + "T12:00:00"
    );


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return dataString;

  }


  return data.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );

}


/* =========================================================
   GRÁFICO HISTÓRICO REAL
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
    Verifica se Chart.js carregou.
  */

  if (
    typeof Chart === "undefined"
  ) {

    mensagem.style.display =
      "flex";

    mensagem.textContent =
      "❌ O gráfico não pôde ser carregado.";

    return;

  }


  mensagem.style.display =
    "flex";


  mensagem.textContent =
    "⏳ Carregando histórico real...";


  try {

    /*
      Frankfurter fornece dados históricos
      de moedas com base em taxas do
      mercado europeu.

      Buscamos os últimos 30 dias.
    */

    const hoje =
      new Date();


    const inicio =
      new Date();


    inicio.setDate(
      hoje.getDate() - 30
    );


    const dataInicio =
      inicio.toISOString()
        .split("T")[0];


    const dataFim =
      hoje.toISOString()
        .split("T")[0];


    const url =
      `${HISTORICO_API}/${dataInicio}..${dataFim}?base=BRL&symbols=${codigo}`;


    const resposta =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro no histórico"
      );

    }


    const dados =
      await resposta.json();


    if (
      !dados ||
      !dados.rates
    ) {

      throw new Error(
        "Histórico vazio"
      );

    }


    const datas =
      Object.keys(
        dados.rates
      ).sort();


    const valores =
      datas.map(
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

            return null;

          }


          /*
            A API retorna:
            1 BRL = X moeda.

            Queremos:
            1 moeda = X BRL.
          */

          return 1 / taxa;

        }
      );


    const dadosValidos =
      valores.filter(
        function(valor) {

          return Number.isFinite(
            valor
          );

        }
      );


    if (
      dadosValidos.length < 2
    ) {

      throw new Error(
        "Poucos dados históricos"
      );

    }


    mensagem.style.display =
      "none";


    /*
      Destrói o gráfico anterior.
    */

    if (graficoMoeda) {

      graficoMoeda.destroy();

      graficoMoeda = null;

    }


    graficoMoeda =
      new Chart(
        canvas,
        {
          type: "line",

          data: {

            labels:
              datas.map(
                formatarDataGrafico
              ),

            datasets: [

              {

                label:
                  `1 ${codigo} em reais`,

                data:
                  valores,

                borderWidth: 3,

                tension: 0.3,

                fill: true,

                pointRadius: 3,

                pointHoverRadius: 6

              }

            ]

          },


          options: {

            responsive: true,

            maintainAspectRatio: false,


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

              x: {

                ticks: {

                  maxTicksLimit: 10

                }

              },


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


    /*
      NÃO cria um gráfico falso.
      Mostra uma mensagem real para
      o usuário.
    */

    mensagem.style.display =
      "flex";


    mensagem.textContent =
      "❌ Histórico indisponível no momento.";


    if (graficoMoeda) {

      graficoMoeda.destroy();

      graficoMoeda = null;

    }

  }

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {


  /* ATUALIZAR */

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


        const textoOriginal =
          refresh.textContent;


        refresh.textContent =
          "⏳ Atualizando...";


        await Promise.all([
          carregarCotacoes(),
          carregarBitcoin()
        ]);


        refresh.disabled =
          false;


        refresh.textContent =
          textoOriginal;

      }
    );

  }


  /* TROCAR */

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


  /* VALOR */

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


  /* ORIGEM */

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


  /* DESTINO */

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


  /* MOEDA DO GRÁFICO */

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


  /* ANO */

  const year =
    document.getElementById(
      "year"
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    configurarEventos();


    /*
      Primeiro carrega as moedas.
    */

    await carregarCotacoes();


    /*
      Depois carrega Bitcoin.
    */

    await carregarBitcoin();


    /*
      Atualiza conversor.
    */

    atualizarConversor();

  }
);


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
   A CADA 5 MINUTOS
========================================================= */

setInterval(
  async function() {

    console.log(
      "Atualizando cotações..."
    );


    await carregarCotacoes();

    await carregarBitcoin();


  },
  5 * 60 * 1000
);
