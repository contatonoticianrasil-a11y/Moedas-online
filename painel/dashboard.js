/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD ADMINISTRATIVO V1
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

const CURRENCY_API =
  "https://open.er-api.com/v6/latest/BRL";

const BITCOIN_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true";


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    $("ano").textContent =
      new Date().getFullYear();

    configurarMenu();

    configurarEventos();

    const autenticado =
      await verificarLogin();

    if (!autenticado) {
      return;
    }

    await carregarDados();

  }
);


/* =========================================================
   LOGIN
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

    if (
      error ||
      !data ||
      !data.session
    ) {

      window.location.href =
        "index.html";

      return false;

    }

    const email =
      data.session.user.email ||
      "Administrador";

    if ($("usuarioLogado")) {
      $("usuarioLogado").textContent =
        email;
    }

    if ($("emailConfiguracao")) {
      $("emailConfiguracao").textContent =
        email;
    }

    return true;

  } catch (erro) {

    console.error(
      "Erro no login:",
      erro
    );

    window.location.href =
      "index.html";

    return false;

  }

}


/* =========================================================
   MENU MOBILE
========================================================= */

function configurarMenu() {

  const menuBtn =
    $("menuBtn");

  const sidebar =
    $("sidebar");

  if (!menuBtn || !sidebar) {
    return;
  }

  menuBtn.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "open"
      );

    }
  );

  document
    .querySelectorAll(".menu-item")
    .forEach(
      item => {

        item.addEventListener(
          "click",
          () => {

            sidebar.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

  $("logoutBtn")?.addEventListener(
    "click",
    sair
  );

  $("novoAnuncioBtn")?.addEventListener(
    "click",
    abrirFormulario
  );

  $("fecharForm")?.addEventListener(
    "click",
    fecharFormulario
  );

  $("cancelarAnuncio")?.addEventListener(
    "click",
    fecharFormulario
  );

  $("salvarAnuncio")?.addEventListener(
    "click",
    salvarAnuncio
  );

  $("atualizarAnuncios")?.addEventListener(
    "click",
    carregarAnuncios
  );

  $("atualizarCotacoes")?.addEventListener(
    "click",
    carregarCotacoes
  );

  $("cancelarExclusao")?.addEventListener(
    "click",
    fecharModal
  );

  $("confirmarExclusao")?.addEventListener(
    "click",
    confirmarExclusao
  );

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

  await Promise.allSettled([

    carregarAnuncios(),

    carregarCotacoes(),

    carregarBitcoin()

  ]);

}


/* =========================================================
   COTAÇÕES
========================================================= */

async function carregarCotacoes() {

  try {

    const resposta =
      await fetch(
        CURRENCY_API,
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
      !dados.rates
    ) {
      throw new Error(
        "Dados inválidos"
      );
    }

    const taxas =
      dados.rates;

    const usd =
      1 / Number(taxas.USD);

    const eur =
      1 / Number(taxas.EUR);

    const gbp =
      1 / Number(taxas.GBP);

    $("valorDolar").textContent =
      formatarBRL(usd);

    $("quoteUSD").textContent =
      formatarBRL(usd);

    $("quoteEUR").textContent =
      formatarBRL(eur);

    $("quoteGBP").textContent =
      formatarBRL(gbp);

  } catch (erro) {

    console.error(
      "Erro nas cotações:",
      erro
    );

    $("valorDolar").textContent =
      "Indisponível";

  }

}


/* =========================================================
   BITCOIN
========================================================= */

async function carregarBitcoin() {

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
        "Erro Bitcoin"
      );
    }

    const dados =
      await resposta.json();

    const valor =
      Number(
        dados?.bitcoin?.brl
      );

    if (!Number.isFinite(valor)) {
      throw new Error(
        "Bitcoin indisponível"
      );
    }

    const valorFormatado =
      formatarBRL(valor);

    $("valorBitcoin").textContent =
      valorFormatado;

    $("quoteBTC").textContent =
      valorFormatado;

  } catch (erro) {

    console.error(
      "Erro Bitcoin:",
      erro
    );

    $("valorBitcoin").textContent =
      "Indisponível";

    $("quoteBTC").textContent =
      "Indisponível";

  }

}


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
   FORMULÁRIO
========================================================= */

function abrirFormulario() {

  $("anuncioForm")
    .classList
    .remove("hidden");

  $("anuncioTitulo").focus();

  window.scrollTo({
    top:
      $("anuncioForm").offsetTop - 100,
    behavior: "smooth"
  });

}


function fecharFormulario() {

  $("anuncioForm")
    .classList
    .add("hidden");

  $("anuncioTitulo").value = "";
  $("anuncioLink").value = "";
  $("anuncioImagem").value = "";
  $("anuncioStatus").value = "ativo";

}


/* =========================================================
   ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  const lista =
    $("listaAnuncios");

  if (!lista) {
    return;
  }

  lista.innerHTML = `
    <div class="empty-state">
      <div>⏳</div>
      <strong>Carregando anúncios...</strong>
    </div>
  `;

  /*
    IMPORTANTE:

    A tabela "anuncios" precisa existir no Supabase.

    Campos esperados:
    id
    titulo
    link
    imagem
    status
    created_at
  */

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {

      console.error(
        "Erro Supabase:",
        error
      );

      mostrarListaVazia(
        "A tabela de anúncios ainda não está configurada."
      );

      atualizarContadores([]);

      return;

    }

    renderizarAnuncios(
      data || []
    );

    atualizarContadores(
      data || []
    );

  } catch (erro) {

    console.error(
      "Erro:",
      erro
    );

    mostrarListaVazia(
      "Não foi possível carregar os anúncios."
    );

  }

}


/* =========================================================
   RENDERIZAR ANÚNCIOS
========================================================= */

function renderizarAnuncios(
  anuncios
) {

  const lista =
    $("listaAnuncios");

  if (!lista) {
    return;
  }

  if (!anuncios.length) {

    mostrarListaVazia(
      "Nenhum anúncio cadastrado."
    );

    return;

  }

  lista.innerHTML = "";

  anuncios.forEach(
    anuncio => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "ad-item";

      const imagem =
        anuncio.imagem ||
        "https://via.placeholder.com/150x100?text=Anuncio";

      const titulo =
        escaparHTML(
          anuncio.titulo ||
          "Sem título"
        );

      const link =
        anuncio.link ||
        "#";

      const ativo =
        anuncio.status ===
        "ativo";

      item.innerHTML = `

        <img
          class="ad-image"
          src="${imagem}"
          alt="${titulo}"
          onerror="this.src='https://via.placeholder.com/150x100?text=Anuncio'"
        >

        <div class="ad-info">

          <strong>
            ${titulo}
          </strong>

          <span>
            ${escaparHTML(link)}
          </span>

        </div>

        <span class="status-badge ${
          ativo ? "active" : ""
        }">

          ${
            ativo
              ? "🟢 Ativo"
              : "⚪ Inativo"
          }

        </span>

        <div class="ad-actions">

          <a
            class="small-btn"
            href="${link}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 Abrir
          </a>

          <button
            class="small-btn delete"
            data-id="${anuncio.id}"
          >
            🗑️
          </button>

        </div>

      `;

      const excluir =
        item.querySelector(
          ".delete"
        );

      excluir.addEventListener(
        "click",
        () => {

          abrirModal(
            anuncio.id
          );

        }
      );

      lista.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   CONTADORES
========================================================= */

function atualizarContadores(
  anuncios
) {

  const ativos =
    anuncios.filter(
      anuncio =>
        anuncio.status ===
        "ativo"
    );

  $("totalAnuncios").textContent =
    ativos.length;

  $("totalLinks").textContent =
    anuncios.filter(
      anuncio =>
        anuncio.link
    ).length;

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio() {

  const titulo =
    $("anuncioTitulo")
      .value
      .trim();

  const link =
    $("anuncioLink")
      .value
      .trim();

  const imagem =
    $("anuncioImagem")
      .value
      .trim();

  const status =
    $("anuncioStatus")
      .value;

  if (!titulo) {

    alert(
      "Digite o título do anúncio."
    );

    return;

  }

  if (!link) {

    alert(
      "Digite o link da propaganda."
    );

    return;

  }

  const botao =
    $("salvarAnuncio");

  botao.disabled =
    true;

  botao.textContent =
    "Salvando...";

  try {

    const {
      data: usuario
    } =
      await supabaseClient
        .auth
        .getUser();

    if (!usuario?.user) {

      alert(
        "Sua sessão expirou. Faça login novamente."
      );

      window.location.href =
        "index.html";

      return;

    }

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .insert({

          titulo,
          link,
          imagem,
          status

        });

    if (error) {

      console.error(
        "Erro ao salvar:",
        error
      );

      alert(
        "Não foi possível salvar. Verifique se a tabela 'anuncios' existe no Supabase."
      );

      return;

    }

    alert(
      "Anúncio salvo com sucesso!"
    );

    fecharFormulario();

    await carregarAnuncios();

  } catch (erro) {

    console.error(
      erro
    );

    alert(
      "Erro ao salvar o anúncio."
    );

  } finally {

    botao.disabled =
      false;

    botao.textContent =
      "💾 Salvar anúncio";

  }

}


/* =========================================================
   EXCLUSÃO
========================================================= */

let anuncioParaExcluir =
  null;


function abrirModal(id) {

  anuncioParaExcluir =
    id;

  $("modal")
    .classList
    .remove("hidden");

}


function fecharModal() {

  anuncioParaExcluir =
    null;

  $("modal")
    .classList
    .add("hidden");

}


async function confirmarExclusao() {

  if (!anuncioParaExcluir) {
    return;
  }

  const id =
    anuncioParaExcluir;

  const botao =
    $("confirmarExclusao");

  botao.disabled =
    true;

  botao.textContent =
    "Excluindo...";

  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {

      console.error(
        error
      );

      alert(
        "Não foi possível excluir o anúncio."
      );

      return;

    }

    fecharModal();

    await carregarAnuncios();

  } catch (erro) {

    console.error(
      erro
    );

    alert(
      "Erro ao excluir."
    );

  } finally {

    botao.disabled =
      false;

    botao.textContent =
      "Excluir";

  }

}


/* =========================================================
   LISTA VAZIA
========================================================= */

function mostrarListaVazia(
  mensagem
) {

  $("listaAnuncios").innerHTML = `

    <div class="empty-state">

      <div>📢</div>

      <strong>
        ${mensagem}
      </strong>

      <span>
        Clique em "Novo anúncio" para cadastrar.
      </span>

    </div>

  `;

}


/* =========================================================
   SEGURANÇA BÁSICA
========================================================= */

function escaparHTML(
  texto
) {

  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   SAIR
========================================================= */

async function sair() {

  const botao =
    $("logoutBtn");

  botao.disabled =
    true;

  botao.textContent =
    "Saindo...";

  try {

    await supabaseClient
      .auth
      .signOut({
        scope: "local"
      });

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
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

setInterval(
  async () => {

    await carregarAnuncios();

    await carregarCotacoes();

    await carregarBitcoin();

  },
  5 * 60 * 1000
);
