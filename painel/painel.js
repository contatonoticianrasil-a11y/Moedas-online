/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL DE CONTROLE V1
========================================================= */


/* =========================================================
   APIs
========================================================= */

const API_MOEDAS =
  "https://open.er-api.com/v6/latest/BRL";


const API_BITCOIN =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


/* =========================================================
   MOEDAS
========================================================= */

const moedas = [

  {
    codigo: "USD",
    nome: "Dólar americano",
    bandeira: "🇺🇸"
  },

  {
    codigo: "EUR",
    nome: "Euro",
    bandeira: "🇪🇺"
  },

  {
    codigo: "GBP",
    nome: "Libra esterlina",
    bandeira: "🇬🇧"
  },

  {
    codigo: "ARS",
    nome: "Peso argentino",
    bandeira: "🇦🇷"
  },

  {
    codigo: "PYG",
    nome: "Guarani paraguaio",
    bandeira: "🇵🇾"
  },

  {
    codigo: "CLP",
    nome: "Peso chileno",
    bandeira: "🇨🇱"
  },

  {
    codigo: "JPY",
    nome: "Iene japonês",
    bandeira: "🇯🇵"
  },

  {
    codigo: "CAD",
    nome: "Dólar canadense",
    bandeira: "🇨🇦"
  }

];


/* =========================================================
   VARIÁVEIS
========================================================= */

let taxas = {};

let intervaloAtualizacao = null;


/* =========================================================
   FORMATAÇÃO
========================================================= */

function moedaBRL(valor) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(valor);

}


/* =========================================================
   LOGIN V1
=========================================================

   IMPORTANTE:
   Este login é apenas uma proteção visual da V1.

   Para produção, substitua pelo Supabase
   ou outro sistema de autenticação seguro.
========================================================= */

const EMAIL_ADMIN =
  "admin@goncalvescambio.com";


const SENHA_ADMIN =
  "123456";


function iniciarLogin() {

  const form =
    document.getElementById(
      "loginForm"
    );


  if (!form) return;


  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();


      const email =
        document.getElementById(
          "loginEmail"
        ).value.trim();


      const senha =
        document.getElementById(
          "loginPassword"
        ).value;


      const mensagem =
        document.getElementById(
          "loginMessage"
        );


      if (
        email === EMAIL_ADMIN &&
        senha === SENHA_ADMIN
      ) {

        sessionStorage.setItem(
          "goncalves_admin",
          "true"
        );


        mostrarPainel();


      } else {

        mensagem.textContent =
          "E-mail ou senha incorretos.";

      }

    }
  );

}


/* =========================================================
   MOSTRAR PAINEL
========================================================= */

function mostrarPainel() {

  const login =
    document.getElementById(
      "loginScreen"
    );


  const painel =
    document.getElementById(
      "adminPanel"
    );


  if (login) {

    login.classList.add(
      "hidden"
    );

  }


  if (painel) {

    painel.classList.remove(
      "hidden"
    );

  }


  carregarDashboard();

}


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

function verificarLogin() {

  const autenticado =
    sessionStorage.getItem(
      "goncalves_admin"
    );


  if (
    autenticado === "true"
  ) {

    mostrarPainel();

  }

}


/* =========================================================
   LOGOUT
========================================================= */

function iniciarLogout() {

  const botao =
    document.getElementById(
      "logoutButton"
    );


  if (!botao) return;


  botao.addEventListener(
    "click",
    function() {

      sessionStorage.removeItem(
        "goncalves_admin"
      );


      location.reload();

    }
  );

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function iniciarNavegacao() {

  const botoes =
    document.querySelectorAll(
      "[data-section]"
    );


  botoes.forEach(
    function(botao) {

      botao.addEventListener(
        "click",
        function() {

          const secao =
            this.dataset.section;


          abrirSecao(
            secao
          );

        }
      );

    }
  );

}


/* =========================================================
   ABRIR SEÇÃO
========================================================= */

function abrirSecao(secao) {

  document
    .querySelectorAll(
      ".admin-section"
    )
    .forEach(
      function(item) {

        item.classList.remove(
          "active-section"
        );

      }
    );


  const alvo =
    document.getElementById(
      `section-${secao}`
    );


  if (alvo) {

    alvo.classList.add(
      "active-section"
    );

  }


  document
    .querySelectorAll(
      ".menu-item"
    )
    .forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


  const menu =
    document.querySelector(
      `.menu-item[data-section="${secao}"]`
    );


  if (menu) {

    menu.classList.add(
      "active"
    );

  }


  const titulos = {

    dashboard:
      "Dashboard",

    moedas:
      "Cotações das Moedas",

    bitcoin:
      "Bitcoin",

    anuncios:
      "Anúncios",

    configuracoes:
      "Configurações"

  };


  const titulo =
    document.getElementById(
      "pageTitle"
    );


  if (titulo) {

    titulo.textContent =
      titulos[secao] ||
      "Painel";

  }


  if (secao === "moedas") {

    carregarMoedas();

  }


  if (secao === "bitcoin") {

    carregarBitcoin();

  }

}


/* =========================================================
   COTAÇÕES
========================================================= */

async function carregarMoedas() {

  const area =
    document.getElementById(
      "currencyTable"
    );


  if (!area) return;


  area.innerHTML = `
    <div class="loading-box">
      ⏳ Atualizando cotações...
    </div>
  `;


  try {

    const resposta =
      await fetch(
        API_MOEDAS,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro na API"
      );

    }


    const dados =
      await resposta.json();


    if (
      dados.result !== "success"
    ) {

      throw new Error(
        "API indisponível"
      );

    }


    taxas =
      dados.rates;


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


        const valor =
          1 / taxa;


        const card =
          document.createElement(
            "div"
          );


        card.className =
          "currency-admin-card";


        card.innerHTML = `

          <div class="currency-admin-top">

            <div class="currency-flag">
              ${moeda.bandeira}
            </div>

            <div>

              <div class="currency-admin-name">
                ${moeda.nome}
              </div>

              <div class="currency-code">
                ${moeda.codigo}
              </div>

            </div>

          </div>


          <div class="currency-admin-value">

            ${moedaBRL(valor)}

          </div>


          <div class="currency-admin-label">

            1 ${moeda.codigo} em reais

          </div>

        `;


        area.appendChild(
          card
        );

      }
    );


    const status =
      document.getElementById(
        "currencyApiStatus"
      );


    if (status) {

      status.textContent =
        "Online";

      status.style.color =
        "var(--success)";

    }


    atualizarHora();


  } catch (erro) {

    console.error(
      erro
    );


    area.innerHTML = `

      <div class="loading-box">

        ❌ Não foi possível
        carregar as cotações.

      </div>

    `;


    const status =
      document.getElementById(
        "currencyApiStatus"
      );


    if (status) {

      status.textContent =
        "Erro";

      status.style.color =
        "var(--danger)";

    }

  }

}


/* =========================================================
   BITCOIN
========================================================= */

async function carregarBitcoin() {

  const area =
    document.getElementById(
      "bitcoinPanel"
    );


  if (!area) return;


  area.innerHTML = `

    <div class="loading-box">

      ⏳ Carregando Bitcoin...

    </div>

  `;


  try {

    const resposta =
      await fetch(
        API_BITCOIN,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro Bitcoin"
      );

    }


    const dados =
      await resposta.json();


    if (
      !dados.bitcoin
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


    const classe =
      variacao >= 0
        ? "change-positive"
        : "change-negative";


    const sinal =
      variacao >= 0
        ? "+"
        : "";


    area.innerHTML = `

      <div class="panel-card">

        <div class="currency-admin-top">

          <div class="currency-flag">
            ₿
          </div>

          <div>

            <div class="currency-admin-name">
              Bitcoin
            </div>

            <div class="currency-code">
              BTC
            </div>

          </div>

        </div>


        <div class="bitcoin-value">

          ${moedaBRL(valor)}

        </div>


        <div class="bitcoin-change ${classe}">

          ${sinal}${variacao.toFixed(2)}%
          nas últimas 24 horas

        </div>

      </div>

    `;


    const status =
      document.getElementById(
        "bitcoinApiStatus"
      );


    if (status) {

      status.textContent =
        "Online";

      status.style.color =
        "var(--success)";

    }


  } catch (erro) {

    console.error(
      erro
    );


    area.innerHTML = `

      <div class="loading-box">

        ❌ Bitcoin indisponível.

      </div>

    `;


    const status =
      document.getElementById(
        "bitcoinApiStatus"
      );


    if (status) {

      status.textContent =
        "Erro";

      status.style.color =
        "var(--danger)";

    }

  }

}


/* =====================================================
   DASHBOARD
===================================================== */

async function carregarDashboard() {

  await carregarMoedas();

  await carregarBitcoin();


  atualizarDashboardValores();

}


/* =====================================================
   ATUALIZAR VALORES DO DASHBOARD
===================================================== */

function atualizarDashboardValores() {

  if (!taxas) return;


  const valores = {

    USD:
      document.getElementById(
        "dashboardDollar"
      ),

    EUR:
      document.getElementById(
        "dashboardEuro"
      ),

    GBP:
      document.getElementById(
        "dashboardPound"
      )

  };


  Object.keys(valores)
    .forEach(
      function(codigo) {

        const elemento =
          valores[codigo];


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
            moedaBRL(
              1 / taxa
            );

        }

      }
    );


  carregarBitcoinDashboard();

}


/* =====================================================
   BITCOIN DASHBOARD
===================================================== */

async function carregarBitcoinDashboard() {

  const elemento =
    document.getElementById(
      "dashboardBitcoin"
    );


  if (!elemento) return;


  try {

    const resposta =
      await fetch(
        API_BITCOIN,
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    const valor =
      Number(
        dados.bitcoin.brl
      );


    elemento.textContent =
      moedaBRL(valor);


  } catch {

    elemento.textContent =
      "Indisponível";

  }

}


/* =====================================================
   HORA
===================================================== */

function atualizarHora() {

  const agora =
    new Date();


  const texto =
    agora.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  const elemento =
    document.getElementById(
      "currentTime"
    );


  if (elemento) {

    elemento.textContent =
      texto;

  }


  const ultimo =
    document.getElementById(
      "lastUpdate"
    );


  if (ultimo) {

    ultimo.textContent =
      agora.toLocaleTimeString(
        "pt-BR"
      );

  }

}


/* =====================================================
   BOTÕES DE ATUALIZAÇÃO
===================================================== */

function iniciarBotoesAtualizacao() {

  const moedas =
    document.getElementById(
      "refreshCurrencies"
    );


  if (moedas) {

    moedas.addEventListener(
      "click",
      carregarMoedas
    );

  }


  const bitcoin =
    document.getElementById(
      "refreshBitcoin"
    );


  if (bitcoin) {

    bitcoin.addEventListener(
      "click",
      carregarBitcoin
    );

  }


  const dashboard =
    document.getElementById(
      "refreshDashboard"
    );


  if (dashboard) {

    dashboard.addEventListener(
      "click",
      carregarDashboard
    );

  }

}


/* =====================================================
   ANÚNCIOS
===================================================== */

function carregarConfiguracaoAnuncios() {

  const ativo =
    localStorage.getItem(
      "goncalves_popup_ad"
    );


  const frequencia =
    localStorage.getItem(
      "goncalves_ad_frequency"
    );


  const texto =
    localStorage.getItem(
      "goncalves_ad_text"
    );


  const checkbox =
    document.getElementById(
      "popupAdEnabled"
    );


  const select =
    document.getElementById(
      "adFrequency"
    );


  const campo =
    document.getElementById(
      "adText"
    );


  if (checkbox) {

    checkbox.checked =
      ativo !== "false";

  }


  if (select && frequencia) {

    select.value =
      frequencia;

  }


  if (campo && texto) {

    campo.value =
      texto;

  }

}


/* =====================================================
   SALVAR ANÚNCIOS
===================================================== */

function salvarAnuncios() {

  const checkbox =
    document.getElementById(
      "popupAdEnabled"
    );


  const select =
    document.getElementById(
      "adFrequency"
    );


  const campo =
    document.getElementById(
      "adText"
    );


  if (!checkbox) return;


  localStorage.setItem(
    "goncalves_popup_ad",
    checkbox.checked
  );


  localStorage.setItem(
    "goncalves_ad_frequency",
    select.value
  );


  localStorage.setItem(
    "goncalves_ad_text",
    campo.value
  );


  const mensagem =
    document.getElementById(
      "adSaveMessage"
    );


  if (mensagem) {

    mensagem.textContent =
      "✓ Configurações de anúncios salvas.";

    setTimeout(
      function() {

        mensagem.textContent =
          "";

      },
      3000
    );

  }

}


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

function carregarConfiguracoes() {

  const nome =
    localStorage.getItem(
      "goncalves_site_name"
    );


  const refresh =
    localStorage.getItem(
      "goncalves_auto_refresh"
    );


  const campo =
    document.getElementById(
      "siteName"
    );


  const select =
    document.getElementById(
      "autoRefresh"
    );


  if (
    campo &&
    nome
  ) {

    campo.value =
      nome;

  }


  if (
    select &&
    refresh
  ) {

    select.value =
      refresh;

  }

}


/* =====================================================
   SALVAR CONFIGURAÇÕES
===================================================== */

function salvarConfiguracoes() {

  const nome =
    document.getElementById(
      "siteName"
    );


  const refresh =
    document.getElementById(
      "autoRefresh"
    );


  localStorage.setItem(
    "goncalves_site_name",
    nome.value
  );


  localStorage.setItem(
    "goncalves_auto_refresh",
    refresh.value
  );


  iniciarAtualizacaoAutomatica();


  const mensagem =
    document.getElementById(
      "settingsMessage"
    );


  if (mensagem) {

    mensagem.textContent =
      "✓ Configurações salvas.";

    setTimeout(
      function() {

        mensagem.textContent =
          "";

      },
      3000
    );

  }

}


/* =====================================================
   ATUALIZAÇÃO AUTOMÁTICA
===================================================== */

function iniciarAtualizacaoAutomatica() {

  if (
    intervaloAtualizacao
  ) {

    clearInterval(
      intervaloAtualizacao
    );

  }


  const valor =
    Number(
      localStorage.getItem(
        "goncalves_auto_refresh"
      ) || 5
    );


  intervaloAtualizacao =
    setInterval(
      function() {

        carregarDashboard();

      },
      valor *
      60 *
      1000
    );

}


/* =====================================================
   EVENTOS
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    iniciarLogin();

    verificarLogin();

    iniciarLogout();

    iniciarNavegacao();

    iniciarBotoesAtualizacao();

    carregarConfiguracaoAnuncios();

    carregarConfiguracoes();

    atualizarHora();

    setInterval(
      atualizarHora,
      1000
    );

    iniciarAtualizacaoAutomatica();


    const salvarAds =
      document.getElementById(
        "saveAds"
      );


    if (salvarAds) {

      salvarAds.addEventListener(
        "click",
        salvarAnuncios
      );

    }


    const salvarConfig =
      document.getElementById(
        "saveSettings"
      );


    if (salvarConfig) {

      salvarConfig.addEventListener(
        "click",
        salvarConfiguracoes
      );

    }

  }
);
