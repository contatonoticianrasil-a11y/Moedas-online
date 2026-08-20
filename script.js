const API_URL = "https://open.er-api.com/v6/latest/BRL";

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

let taxas = {};
let ultimaAtualizacao = null;


/* =========================
   FORMATAR MOEDA
========================= */

function formatarMoeda(valor, codigo) {

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: codigo,
    maximumFractionDigits: codigo === "PYG" || codigo === "CLP" ? 0 : 2
  }).format(valor);

}


/* =========================
   CARREGAR COTAÇÕES
========================= */

async function carregarCotacoes() {

  const cards = document.getElementById("currencyCards");

  cards.innerHTML = `
    <div class="loading">
      ⏳ Carregando cotações...
    </div>
  `;

  try {

    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Erro na API");
    }

    const dados = await resposta.json();

    if (dados.result !== "success") {
      throw new Error("A API não retornou os dados");
    }

    taxas = dados.rates;

    ultimaAtualizacao = new Date();

    mostrarCards();

    atualizarDolar();

    atualizarConversor();

    atualizarHorario();

  } catch (erro) {

    console.error(erro);

    cards.innerHTML = `
      <div class="loading">
        ❌ Não foi possível carregar as cotações.
        <br><br>
        Tente atualizar a página.
      </div>
    `;

    document.getElementById("heroDollar").textContent = "Indisponível";

    document.getElementById("lastUpdate").textContent =
      "Erro ao atualizar";

  }

}


/* =========================
   MOSTRAR CARDS
========================= */

function mostrarCards() {

  const cards = document.getElementById("currencyCards");

  cards.innerHTML = "";

  moedas.forEach(moeda => {

    const taxa = taxas[moeda.codigo];

    if (!taxa) {
      return;
    }

    const valorEmReais = 1 / taxa;

    const card = document.createElement("div");

    card.className = "currency-card";

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
        ${formatarMoeda(valorEmReais, "BRL")}
      </div>

      <div class="currency-label">
        1 ${moeda.codigo} em reais
      </div>

    `;

    cards.appendChild(card);

  });

}


/* =========================
   DÓLAR NO HERO
========================= */

function atualizarDolar() {

  const dolar = taxas["USD"];

  if (!dolar) {
    return;
  }

  const valor = 1 / dolar;

  document.getElementById("heroDollar").textContent =
    formatarMoeda(valor, "BRL");

}


/* =========================
   HORÁRIO
========================= */

function atualizarHorario() {

  if (!ultimaAtualizacao) {
    return;
  }

  const horario = ultimaAtualizacao.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

  document.getElementById("lastUpdate").textContent =
    "Atualizado às " + horario;

}


/* =========================
   CONVERSOR
========================= */

function atualizarConversor() {

  const amount = parseFloat(
    document.getElementById("amount").value
  );

  const from = document.getElementById("from").value;

  const to = document.getElementById("to").value;

  const resultado = document.getElementById("conversionResult");


  if (!amount || amount < 0) {

    resultado.textContent = "Digite um valor válido";

    return;
  }


  if (!taxas[from] || !taxas[to]) {

    resultado.textContent =
      "Cotação indisponível";

    return;
  }


  /*
    A API está baseada no BRL.

    Primeiro convertemos a moeda de origem
    para BRL.

    Depois convertemos BRL para a moeda
    de destino.
  */

  let valorEmBRL;

  if (from === "BRL") {

    valorEmBRL = amount;

  } else {

    valorEmBRL = amount / taxas[from];

  }


  let valorFinal;

  if (to === "BRL") {

    valorFinal = valorEmBRL;

  } else {

    valorFinal = valorEmBRL * taxas[to];

  }


  const resultadoFormatado =
    formatarMoeda(valorFinal, to);


  resultado.textContent =
    resultadoFormatado;

}


/* =========================
   TROCAR MOEDAS
========================= */

function trocarMoedas() {

  const from = document.getElementById("from");

  const to = document.getElementById("to");

  const temporario = from.value;

  from.value = to.value;

  to.value = temporario;

  atualizarConversor();

}


/* =========================
   BOTÃO ATUALIZAR
========================= */

document
  .getElementById("refreshBtn")
  .addEventListener(
    "click",
    carregarCotacoes
  );


/* =========================
   BOTÃO TROCAR
========================= */

document
  .getElementById("swapBtn")
  .addEventListener(
    "click",
    trocarMoedas
  );


/* =========================
   CAMPOS DO CONVERSOR
========================= */

document
  .getElementById("amount")
  .addEventListener(
    "input",
    atualizarConversor
  );


document
  .getElementById("from")
  .addEventListener(
    "change",
    atualizarConversor
  );


document
  .getElementById("to")
  .addEventListener(
    "change",
    atualizarConversor
  );


/* =========================
   ANO DO RODAPÉ
========================= */

document.getElementById("year").textContent =
  new Date().getFullYear();


/* =========================
   INICIAR
========================= */

carregarCotacoes();


/*
  Atualiza automaticamente
  a cada 5 minutos.
*/

setInterval(
  carregarCotacoes,
  5 * 60 * 1000
);
