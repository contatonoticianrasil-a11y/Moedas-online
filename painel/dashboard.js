/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD ADMINISTRATIVO - V1
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   APIs
========================================================= */

const API_URL =
  "https://open.er-api.com/v6/latest/BRL";

const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


/* =========================================================
   MOEDAS
========================================================= */

const moedas = [
  ["USD", "🇺🇸", "Dólar americano"],
  ["EUR", "🇪🇺", "Euro"],
  ["GBP", "🇬🇧", "Libra esterlina"],
  ["ARS", "🇦🇷", "Peso argentino"],
  ["PYG", "🇵🇾", "Guarani paraguaio"],
  ["CLP", "🇨🇱", "Peso chileno"],
  ["JPY", "🇯🇵", "Iene japonês"],
  ["CAD", "🇨🇦", "Dólar canadense"]
];

let taxas = {};


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarBRL(valor) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(valor);

}


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

async function verificarLogin() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();

  if (error) {

    console.error(
      "Erro ao verificar login:",
      error
    );

    window.location.href =
      "index.html";

    return;

  }

  if (
    !data ||
    !data.session
  ) {

    window.location.href =
      "index.html";

    return;

  }

  const usuario =
    document.getElementById(
      "usuarioLogado"
    );

  if (usuario) {

    usuario.textContent =
      data.session.user.email;

  }

}


/* =========================================================
   CARREGAR COTAÇÕES
========================================================= */

async function carregarCotacoes() {

  const area =
    document.getElementById(
      "currencyCards"
    );

  if (!area) return;

  area.innerHTML = `
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
        "Erro HTTP " +
        resposta.status
      );

    }

    const dados =
      await resposta.json();

    if (
      !dados ||
      dados.result !== "success"
    ) {

      throw new Error(
        "API indisponível"
      );

    }

    taxas =
      dados.rates;

    mostrarMoedas();

    atualizarDestaques();

    atualizarHorario();

  } catch (erro) {

    console.error(
      "Erro nas cotações:",
      erro
    );

    area.innerHTML = `
      <div class="error">
        ❌ Não foi possível carregar as cotações.
      </div>
    `;

  }

}


/* =========================================================
   MOSTRAR MOEDAS
========================================================= */

function mostrarMoedas() {

  const area =
    document.getElementById(
      "currencyCards"
    );

  if (!area) return;

  area.innerHTML = "";

  moedas.forEach(
    function(moeda) {

      const codigo =
        moeda[0];

      const bandeira =
        moeda[1];

      const nome =
        moeda[2];

      const taxa =
        Number(
          taxas[codigo]
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

        <div class="currency-icon">
          ${bandeira}
        </div>

        <div class="currency-info">

          <h3>
            ${nome}
          </h3>

          <span>
            ${codigo}
          </span>

        </div>

        <div class="currency-price">

          ${formatarBRL(valor)}

        </div>

        <div class="currency-label">

          1 ${codigo} em reais

        </div>

      `;

      area.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   DESTAQUES
========================================================= */

function atualizarDestaques() {

  const dolar =
    document.getElementById(
      "valorDolar"
    );

  const euro =
    document.getElementById(
      "valorEuro"
    );

  if (
    dolar &&
    taxas.USD
  ) {

    dolar.textContent =
      formatarBRL(
        1 / Number(taxas.USD)
      );

  }

  if (
    euro &&
    taxas.EUR
  ) {

    euro.textContent =
      formatarBRL(
        1 / Number(taxas.EUR)
      );

  }

}


/* =========================================================
   BITCOIN
========================================================= */

async function carregarBitcoin() {

  const valorBitcoin =
    document.getElementById(
      "valorBitcoin"
    );

  const variacaoBitcoin =
    document.getElementById(
      "variacaoBitcoin"
    );

  if (
    !valorBitcoin
  ) return;

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

    const bitcoin =
      dados.bitcoin;

    if (!bitcoin) {

      throw new Error(
        "Bitcoin indisponível"
      );

    }

    valorBitcoin.textContent =
      formatarBRL(
        Number(
          bitcoin.brl
        )
      );

    if (variacaoBitcoin) {

      const variacao =
        Number(
          bitcoin.brl_24h_change || 0
        );

      const sinal =
        variacao >= 0
          ? "+"
          : "";

      variacaoBitcoin.textContent =
        sinal +
        variacao.toFixed(2) +
        "% nas últimas 24h";

    }

  } catch (erro) {

    console.error(
      "Erro Bitcoin:",
      erro
    );

    valorBitcoin.textContent =
      "Indisponível";

  }

}


/* =========================================================
   HORÁRIO
========================================================= */

function atualizarHorario() {

  const elemento =
    document.getElementById(
      "ultimaAtualizacao"
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


/* =========================================================
   ATUALIZAR TUDO
========================================================= */

async function atualizarTudo() {

  const botao =
    document.getElementById(
      "refreshBtn"
    );

  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "⏳ Atualizando...";

  }

  await Promise.allSettled([

    carregarCotacoes(),

    carregarBitcoin()

  ]);

  if (botao) {

    botao.disabled = false;

    botao.textContent =
      "↻ Atualizar";

  }

}


/* =========================================================
   SAIR
========================================================= */

async function sair() {

  try {

    await supabaseClient
      .auth
      .signOut();

  } catch (erro) {

    console.error(
      "Erro ao sair:",
      erro
    );

  }

  window.location.href =
    "index.html";

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    verificarLogin();

    carregarCotacoes();

    carregarBitcoin();


    const refresh =
      document.getElementById(
        "refreshBtn"
      );

    if (refresh) {

      refresh.addEventListener(
        "click",
        atualizarTudo
      );

    }


    const logout =
      document.getElementById(
        "logoutBtn"
      );

    if (logout) {

      logout.addEventListener(
        "click",
        sair
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
