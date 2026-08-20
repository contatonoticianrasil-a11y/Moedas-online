/* =========================================================
   GONÇALVES CÂMBIO
   SCRIPT.JS - V1
========================================================= */

/* =========================
   CONFIGURAÇÃO
========================= */

const API_URL = "https://open.er-api.com/v6/latest/BRL";

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


/* =========================
   FORMATAÇÃO
========================= */

function formatarMoeda(valor, codigo = "BRL") {

  if (!Number.isFinite(Number(valor))) {
    return "Indisponível";
  }

  try {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: codigo,
      maximumFractionDigits:
        codigo === "PYG" || codigo === "CLP"
          ? 0
          : 2
    }).format(Number(valor));

  } catch (erro) {

    console.error(
      "Erro ao formatar moeda:",
      erro
    );

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

    /* Atualiza gráfico depois que as taxas
       estiverem disponíveis */

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
        ❌ Não foi possível carregar
        as cotações.
        <br><br>
        Verifique sua conexão e tente
        novamente.
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
   CARDS DAS MOEDAS
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
        Number(taxas[moeda.codigo]);

      if (
        !Number.isFinite(taxa) ||
        taxa <= 0
      ) {
        return;
      }

      /*
        API está em BRL.

        Exemplo:

        1 BRL = 0,18 USD

        Então:

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
   DÓLAR NO HERO
========================= */

function atualizarDolar() {

  const taxa =
    Number(taxas["USD"]);

  const elemento =
    document.getElementById(
      "heroDollar"
    );

  if (!elemento) return;

  if (
    !Number.isFinite(taxa) ||
    taxa <= 0
  ) {

    elemento.textContent =
      "Indisponível";

    return;

  }

  const dolar =
    1 / taxa;

  elemento.textContent =
    formatarMoeda(
      dolar,
      "BRL"
    );

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

          <strong class="${classe}">
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
    Primeiro converte
    origem → BRL
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
    Depois converte
    BRL → destino
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


/* =========================================================
   GRÁFICO - HISTÓRICO REAL
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
    "⏳ Carregando histórico...";


  /*
    Verifica se Chart.js carregou.
  */

  if (
    typeof Chart ===
    "undefined"
  ) {

    mensagem.textContent =
      "❌ Gráfico indisponível.";

    return;

  }


  try {

    /*
      Frankfurter fornece
      histórico de câmbio.
    */

    const hoje =
      new Date();

    const dataFinal =
      hoje
        .toISOString()
        .slice(0, 10);


    const inicioData =
      new Date();

    inicioData.setDate(
      inicioData.getDate() - 30
    );


    const dataInicial =
      inicioData
        .toISOString()
        .slice(0, 10);


    /*
      BRL → moeda escolhida
    */

    const url =
      `https://api.frankfurter.app/` +
      `${dataInicial}..${dataFinal}` +
      `?from=BRL&to=${encodeURIComponent(codigo)}`;


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
      ).sort();


    if (
      datas.length === 0
    ) {

      throw new Error(
        "Nenhum histórico encontrado"
      );

    }


    /*
      Como a API retorna:

      1 BRL = X moeda

      precisamos fazer:

      1 / X

      para descobrir:

      1 moeda = X BRL
    */

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

          return 1 / taxa;

        }
      );


    /*
      Remove pontos inválidos.
    */

    const dadosValidos =
      datas
        .map(
          function(data, index) {

            return {
              data: data,
              valor: valores[index]
            };

          }
        )
        .filter(
          function(item) {

            return Number.isFinite(
              item.valor
            );

          }
        );


    if (
      dadosValidos.length === 0
    ) {

      throw new Error(
        "Nenhum valor válido"
      );

    }


    const labels =
      dadosValidos.map(
        function(item) {

          const partes =
            item.data.split("-");

          return (
            partes[2] +
            "/" +
            partes[1]
          );

        }
      );


    const valoresGrafico =
      dadosValidos.map(
        function(item) {

          return item.valor;

        }
      );


    /*
      Esconde mensagem.
    */

    mensagem.style.display =
      "none";


    /*
      Destrói gráfico anterior.
    */

    if (
      graficoMoeda
    ) {

      graficoMoeda.destroy();

    }


    /*
      Cria novo gráfico.
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

                data:
                  valoresGrafico,

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
      Caso o histórico não esteja
      disponível, tenta mostrar
      a cotação atual.
    */

    try {

      const taxa =
        Number(
          taxas[codigo]
        );


      if (
        Number.isFinite(
          taxa
        ) &&
        taxa > 0
      ) {

        const valorAtual =
          1 / taxa;


        const hoje =
          new Date();


        const labels = [];

        const valores = [];


        for (
          let i = 6;
          i >= 0;
          i--
        ) {

          const data =
            new Date(hoje);

          data.setDate(
            hoje.getDate() - i
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
            valorAtual
          );

        }


        mensagem.style.display =
          "none";


        if (
          graficoMoeda
        ) {

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
                      `Cotação atual - 1 ${codigo}`,

                    data: valores,

                    borderWidth: 3,

                    tension: 0.35,

                    fill: true,

                    pointRadius: 3

                  }

                ]

              },


              options: {

                responsive: true,

                maintainAspectRatio: false,

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


        return;

      }

    } catch (
      erroFallback
    ) {

      console.error(
        erroFallback
      );

    }


    mensagem.style.display =
      "flex";

    mensagem.textContent =
      "❌ Histórico indisponível no momento.";

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
       BOTÃO ATUALIZAR
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


          await Promise.allSettled(
            [
              carregarCotacoes(),
              carregarBitcoin()
            ]
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
       MOEDA ORIGEM
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
       MOEDA DESTINO
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
       SELETOR DO GRÁFICO
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
        new Date().getFullYear();

    }


    /* =========================
       CARREGAMENTO INICIAL
    ========================= */

    carregarCotacoes();

    carregarBitcoin();


    if (chartCurrency) {

      /*
        O gráfico será carregado
        depois que as cotações
        estiverem disponíveis.
      */

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
