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

/* =========================================================
FORMATAÇÃO
========================================================= */

function formatarBRL(valor) {

if (!Number.isFinite(Number(valor))) {
return "Indisponível";
}

return new Intl.NumberFormat(
"pt-BR",
{
style: "currency",
currency: "BRL",
minimumFractionDigits: 2,
maximumFractionDigits: 2
}
).format(Number(valor));

}

/* =========================================================
VERIFICAR LOGIN
========================================================= */

async function verificarLogin() {

try {

const {
  data,
  error
} =
  await supabaseClient
    .auth
    .getSession();


if (error) {

  console.error(
    "Erro ao verificar sessão:",
    error
  );

  window.location.href =
    "index.html";

  return false;

}


if (
  !data ||
  !data.session
) {

  window.location.href =
    "index.html";

  return false;

}


const usuario =
  document.getElementById(
    "usuarioLogado"
  );


if (usuario) {

  usuario.textContent =
    data.session.user.email ||
    "Administrador";

}


return true;

} catch (erro) {

console.error(
  "Erro de autenticação:",
  erro
);

window.location.href =
  "index.html";

return false;

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

try {

if (area) {

  area.innerHTML = `
    <div class="loading">
      ⏳ Atualizando cotações...
    </div>
  `;

}


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
  dados.result !== "success" ||
  !dados.rates
) {

  throw new Error(
    "API de moedas indisponível"
  );

}


taxas =
  dados.rates;


mostrarMoedas();

atualizarResumo();

atualizarHorario();

} catch (erro) {

console.error(
  "Erro nas cotações:",
  erro
);


if (area) {

  area.innerHTML = `
    <div class="loading">
      ❌ Não foi possível carregar
      as cotações.
    </div>
  `;

}

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
    A API retorna quanto 1 BRL
    vale na moeda estrangeira.

    Para descobrir quanto vale
    1 moeda estrangeira em BRL,
    fazemos:

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

      ${formatarBRL(valor)}

    </div>


    <div class="currency-label">

      1 ${moeda.codigo} em reais

    </div>

  `;


  area.appendChild(
    card
  );

}

);

}

/* =========================================================
ATUALIZAR RESUMO
========================================================= */

function atualizarResumo() {

const resumo = [
"USD",
"EUR",
"GBP"
];

resumo.forEach(
function(codigo) {

  const elemento =
    document.getElementById(
      "summary" + codigo
    );


  const taxa =
    Number(
      taxas[codigo]
    );


  if (
    elemento &&
    Number.isFinite(taxa) &&
    taxa > 0
  ) {

    elemento.textContent =
      formatarBRL(
        1 / taxa
      );

  }

}

);

}

/* =========================================================
ATUALIZAR HORÁRIO
========================================================= */

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
minute: "2-digit",
second: "2-digit"
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

const resumo =
document.getElementById(
"summaryBTC"
);

try {

if (area) {

  area.innerHTML = `
    <div class="loading">
      ⏳ Carregando Bitcoin...
    </div>
  `;

}


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
  !dados.bitcoin ||
  !Number.isFinite(
    Number(dados.bitcoin.brl)
  )
) {

  throw new Error(
    "Bitcoin indisponível"
  );

}


const valor =
  Number(
    dados.bitcoin.brl
  );


const variacao =
  Number(
    dados.bitcoin.brl_24h_change || 0
  );


const sinal =
  variacao >= 0
    ? "+"
    : "";


if (resumo) {

  resumo.textContent =
    formatarBRL(
      valor
    );

}


if (area) {

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

        ${formatarBRL(valor)}

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

}

} catch (erro) {

console.error(
  "Erro Bitcoin:",
  erro
);


if (resumo) {

  resumo.textContent =
    "Indisponível";

}


if (area) {

  area.innerHTML = `
    <div class="loading">
      ❌ Bitcoin indisponível.
    </div>
  `;

}

}

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

botao.disabled =
  true;

botao.textContent =
  "⏳ Atualizando...";

}

await Promise.allSettled([

carregarCotacoes(),

carregarBitcoin()

]);

if (botao) {

botao.disabled =
  false;

botao.textContent =
  "↻ Atualizar";

}

}

/* =========================================================
SAIR
========================================================= */

async function sair() {

const botao =
document.getElementById(
"logoutBtn"
);

if (botao) {

botao.disabled =
  true;

botao.textContent =
  "Saindo...";

}

try {

const {
  error
} =
  await supabaseClient
    .auth
    .signOut({
      scope: "local"
    });


if (error) {

  throw error;

}

} catch (erro) {

console.error(
  "Erro ao sair:",
  erro
);


if (botao) {

  botao.disabled =
    false;

  botao.textContent =
    "🚪 Sair";

}

return;

}

window.location.href =
"index.html";

}

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
async function() {

/* ANO */

const year =
  document.getElementById(
    "year"
  );


if (year) {

  year.textContent =
    new Date()
      .getFullYear();

}


/* LOGIN */

const autenticado =
  await verificarLogin();


if (!autenticado) {

  return;

}


/* BOTÃO ATUALIZAR */

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


/* BOTÃO SAIR */

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


/* COTAÇÕES */

await carregarCotacoes();


/* BITCOIN */

await carregarBitcoin();

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
