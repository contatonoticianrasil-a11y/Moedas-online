/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS - VERSÃO ATUALIZADA
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const API_URL = "https://open.er-api.com/v6/latest/BRL";

const HISTORICO_API =
  "https://api.exchangerate.host/timeframe";

const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price" +
  "?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


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
    nome: "Libra",
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

let ultimaAtualizacao = null;


/* =========================================================
   FORMATAÇÃO DE MOEDA
========================================================= */

function formatarMoeda(valor, codigo = "BRL") {

  if (!Number.isFinite(Number(valor))) {
    return "—";
  }

  try {

    let casas = 2;

    if (
      codigo === "PYG" ||
      codigo === "CLP" ||
      codigo === "JPY"
    ) {
      casas = 0;
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      minimumFractionDigits: casas,
      maximumFractionDigits: casas
    }).format(Number(valor));

  } catch (erro) {

    console.error(
      "Erro ao formatar moeda:",
      erro
    );

    return Number(valor).toFixed(2);

  }

}


/* =========================================================
   DATA / HORA
========================================================= */

function atualizarHorario() {

  const elemento =
    document.getElementById("lastUpdate");

  if (!elemento) {
    return;
  }

  const agora = new Date();

  ultimaAtualizacao = agora;

  elemento.textContent =
    "Atualizado às " +
    agora.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );

}


/* =========================================================
   COTAÇÕES
========================================================= */

async function carregarCotacoes() {

  const cards =
    document.getElementById("currencyCards");

  if (!cards) {
    return;
  }

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
        "Resposta inválida da API."
      );
    }

    taxas = dados.rates;

    console.log(
      "Cotações carregadas:",
      taxas
    );

    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();

  } catch (erro) {

    console.error(
      "Erro ao carregar cotações:",
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
      document.getElementById("heroDollar");

    if (dolar) {
      dolar.textContent =
        "Indisponível";
    }

  }

}


/* =========================================================
   MOSTRAR CARDS
========================================================= */

function mostrarCards() {

  const cards =
    document.getElementById("currencyCards");

  if (!cards) {
    return;
  }

  cards.innerHTML = "";

  let quantidade = 0;

  moedas.forEach(
    function(moeda) {

      const taxa =
        Number(taxas[moeda.codigo]);

      if (
        !Number.isFinite(taxa) ||
        taxa <= 0
      ) {
        return;
      }

      /*
        API retorna:
        1 BRL = X moeda

        Para descobrir:
        1 moeda = X BRL

        usamos:
        1 / taxa
      */

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
    Number(taxas["USD"]);

  const elemento =
    document.getElementById(
      "heroDollar"
    );

  if (!elemento) {
    return;
  }

  if (
    !Number.isFinite(taxa) ||
    taxa <= 0
  ) {

    elemento.textContent =
      "Indisponível";

    return;

  }

  const valor =
    1 / taxa;

  elemento.textContent =
    formatarMoeda(
      valor,
      "BRL"
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

  if (!area) {
    return;
  }

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
        "Erro HTTP Bitcoin: " +
        resposta.status
      );

    }

    const dados =
      await resposta.json();

    if (
      !dados ||
      !dados.bitcoin ||
      !Number.isFinite(
        Number(dados.bitcoin.brl)
      )
    ) {

      throw new Error(
        "Dados do Bitcoin inválidos."
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
        ❌ Bitcoin indisponível no momento.
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
    Number(campo.value);


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
    Se for BRL, já temos o valor
    diretamente em reais.
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
    Agora convertemos de BRL
    para a moeda escolhida.
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


  mensagem.style.display =
    "flex";

  mensagem.textContent =
    "⏳ Carregando histórico real...";


  try {

    /*
      Criamos um período de 7 dias.
    */

    const hoje =
      new Date();

    const fim =
      hoje.toISOString()
        .split("T")[0];


    const inicioData =
      new Date(hoje);

    inicioData.setDate(
      hoje.getDate() - 6
    );


    const inicio =
      inicioData
        .toISOString()
        .split("T")[0];


    /*
      A API histórica usa:
      base = BRL
      symbols = USD/EUR
    */

    const url =
      HISTORICO_API +
      "?start_date=" +
      inicio +
      "&end_date=" +
      fim +
      "&base=BRL" +
      "&symbols=" +
      codigo;


    const resposta =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Histórico HTTP " +
        resposta.status
      );

    }


    const dados =
      await resposta.json();


    /*
      Algumas versões da API
      retornam success=false.
    */

    if (
      dados.success === false ||
      !dados.rates
    ) {

      throw new Error(
        "Histórico não disponível."
      );

    }


    const labels = [];

    const valores = [];


    /*
      Percorre todas as datas
      retornadas pela API.
    */

    Object.keys(
      dados.rates
    )
      .sort()
      .forEach(
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


          /*
            A API retorna:
            1 BRL = X moeda

            Queremos:
            1 moeda = X BRL
          */

          const valor =
            1 / taxa;


          const partes =
            data.split("-");


          labels.push(
            partes[2] +
            "/" +
            partes[1]
          );


          valores.push(
            valor
          );

        }
      );


    if (
      valores.length < 2
    ) {

      throw new Error(
        "Poucos dados históricos."
      );

    }


    /*
      Remove mensagem.
    */

    mensagem.style.display =
      "none";


    /*
      Destroi gráfico anterior.
    */

    if (graficoMoeda) {

      graficoMoeda.destroy();

    }


    /*
      Cria gráfico.
    */

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

                pointRadius: 4,

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
      Se a API histórica não
      funcionar, não mostramos
      dados inventados.
    */

    mensagem.style.display =
      "flex";


    mensagem.innerHTML = `
      ❌ Histórico indisponível no momento.
      <br>
      <small>
        A fonte de dados históricos não respondeu.
      </small>
    `;


    if (graficoMoeda) {

      graficoMoeda.destroy();

      graficoMoeda = null;

    }

  }

}


/* =========================================================
   ATUALIZAR TUDO
========================================================= */

async function atualizarTudo() {

  await Promise.allSettled([
    carregarCotacoes(),
    carregarBitcoin()
  ]);


  const seletor =
    document.getElementById(
      "chartCurrency"
    );


  if (seletor) {

    carregarGrafico(
      seletor.value
    );

  }

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    /*
      BOTÃO ATUALIZAR
    */

    const refresh =
      document.getElementById(
        "refreshBtn"
      );


    if (refresh) {

      refresh.addEventListener(
        "click",
        function() {

          refresh.disabled =
            true;

          refresh.textContent =
            "⏳ Atualizando...";


          atualizarTudo()
            .finally(
              function() {

                refresh.disabled =
                  false;

                refresh.textContent =
                  "↻ Atualizar";

              }
            );

        }
      );

    }


    /*
      TROCAR MOEDAS
    */

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


    /*
      VALOR
    */

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


    /*
      MOEDA DE ORIGEM
    */

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


    /*
      MOEDA DE DESTINO
    */

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


    /*
      SELETOR DO GRÁFICO
    */

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


    /*
      ANO DO RODAPÉ
    */

    const year =
      document.getElementById(
        "year"
      );


    if (year) {

      year.textContent =
        new Date().getFullYear();

    }


    /*
      INICIALIZAÇÃO
    */

    carregarCotacoes();

    carregarBitcoin();


    /*
      O gráfico espera as taxas
      da API principal.

      Por isso tentamos depois
      de carregar as cotações.
    */

    setTimeout(
      function() {

        carregarGrafico(
          chartCurrency
            ? chartCurrency.value
            : "USD"
        );

      },
      800
    );

  }
);


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
   A CADA 5 MINUTOS
========================================================= */

setInterval(
  function() {

    atualizarTudo();

  },
  5 * 60 * 1000
);
